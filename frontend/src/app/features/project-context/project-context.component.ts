import { Component, OnInit, OnDestroy, signal, effect, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { AboutDataService } from '../../core/services/about-data.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-context',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './project-context.component.html',
  styleUrls: ['./project-context.component.scss']
})
export class ProjectContextComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private validationService = inject(WizardValidationService);
  private snackBar = inject(MatSnackBar);
  private aboutDataService = inject(AboutDataService);
  private route = inject(ActivatedRoute);

  contextForm: FormGroup;
  activeProject = this.projectService.activeProject;
  isSaving = signal<boolean>(false);
  currentStep = signal<number>(1);
  selectedFile = signal<File | null>(null);
  showUrlInput = signal<boolean>(false);
  submitted = signal(false);
  private _subs = new Subscription();

  constructor() {
    this.contextForm = this.fb.group({
      projectName: ['', Validators.required],
      projectVersion: [''],
      projectOrganization: [''],
      projectDescription: ['', Validators.required],
      projectUrl: [''],
      securityProjectObjectives: [''],
      securityOfficerObjectives: [''],
      securityAssumptions: ['']
    });

    effect(() => {
      const proj = this.activeProject();
      if (proj) {
        this.contextForm.patchValue({
          projectName: proj.projectName || '',
          projectVersion: proj.projectVersion || '',
          projectOrganization: proj.projectOrganization || '',
          projectDescription: proj.projectContext?.projectDescription || '',
          projectUrl: proj.projectContext?.projectUrl || '',
          securityProjectObjectives: proj.projectContext?.securityProjectObjectives || '',
          securityOfficerObjectives: proj.projectContext?.securityOfficerObjectives || '',
          securityAssumptions: proj.projectContext?.securityAssumptions || ''
        }, { emitEvent: false });
        if (proj.projectContext?.projectUrl) this.showUrlInput.set(true);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this._subs.add(
      this.validationService.continueClicked$.subscribe(() => {
        this.submitted.set(true);
        this.contextForm.markAllAsTouched();
        if (this.contextForm.invalid) {
          const firstInvalid = document.querySelector('.mat-mdc-form-field.ng-invalid.ng-touched') as HTMLElement;
          firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.validationService.reportResult(false);
          return;
        }
        this.saveAndContinue();
      })
    );

    this._subs.add(
      this.route.queryParams.subscribe(params => {
        const step = params['step'] ? parseInt(params['step'], 10) : 1;
        this.currentStep.set(step);
      })
    );
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  openDrawer() {
    // Emit event to parent layout to open drawer
    // Layout reads active step already — no-op here, parent handles it
  }

  openAbout(): void {
    this.aboutDataService.open('project-context');
  }

  private saveAndContinue(): void {
    const proj = this.activeProject();
    if (!proj?.id) {
      this.validationService.reportResult(true);
      return;
    }
    const { projectName, projectVersion, projectOrganization, projectDescription, projectUrl,
            securityProjectObjectives, securityOfficerObjectives, securityAssumptions } = this.contextForm.value;

    this.isSaving.set(true);
    this.validationService.isSaving.set(true);

    // Chain: first update basic project fields, then update context
    this.projectService.updateProject(proj.id, { ...proj, projectName, projectVersion, projectOrganization })
      .pipe(
        switchMap(updatedProj => {
          this.projectService.activeProject.set(updatedProj);
          return this.projectService.updateProjectContext(proj.id!, {
            projectDescription, projectUrl,
            securityProjectObjectives, securityOfficerObjectives, securityAssumptions
          });
        }),
        finalize(() => {
          this.isSaving.set(false);
          this.validationService.isSaving.set(false);
        })
      )
      .subscribe({
        next: (updatedProj) => {
          this.projectService.activeProject.set(updatedProj);
          this.validationService.reportResult(true);
        },
        error: () => {
          this.snackBar.open('Failed to save context. Please try again.', 'Dismiss', { duration: 4000 });
          this.validationService.reportResult(false);
        }
      });
  }

  onSaveContext() {
    if (this.contextForm.invalid) {
      this.contextForm.markAllAsTouched();
      return;
    }
    const proj = this.activeProject();
    if (!proj || !proj.id) return;

    this.isSaving.set(true);
    const { projectName, projectVersion, projectOrganization, ...contextFields } = this.contextForm.value;

    // Update project basic info
    this.projectService.updateProject(proj.id, { ...proj, projectName, projectVersion, projectOrganization }).subscribe({
      next: (updatedProj) => {
        this.projectService.activeProject.set(updatedProj);
      }
    });

    this.projectService.updateProjectContext(proj.id, contextFields).subscribe({
      next: (updatedProj) => {
        this.projectService.activeProject.set(updatedProj);
        this.isSaving.set(false);
        this.snackBar.open('Context saved.', 'Dismiss', { duration: 2000 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Failed to save context.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  onFileInputClick() {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile.set(input.files[0]);
  }

  onUploadAttachment() {
    const file = this.selectedFile();
    const proj = this.activeProject();
    if (!file || !proj?.id) return;
    this.projectService.uploadContextAttachment(proj.id, file).subscribe({
      next: (updatedProj) => {
        this.projectService.activeProject.set(updatedProj);
        this.selectedFile.set(null);
        this.snackBar.open('Attachment uploaded.', 'Dismiss', { duration: 2000 });
      },
      error: () => this.snackBar.open('Upload failed.', 'Dismiss', { duration: 3000 })
    });
  }

  onDownloadAttachment() {
    const proj = this.activeProject();
    if (!proj?.id) return;
    this.projectService.downloadContextAttachment(proj.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `attachment_${proj.id}`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Download failed.', 'Dismiss', { duration: 3000 })
    });
  }

  attachmentName(): string {
    const path = this.activeProject()?.projectContext?.projectDescriptionAttachmentPath;
    if (!path) return '';
    return path.substring(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1);
  }
}
