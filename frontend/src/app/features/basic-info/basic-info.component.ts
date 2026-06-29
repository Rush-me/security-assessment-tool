import { Component, OnInit, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { AboutDataService } from '../../core/services/about-data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private validationService = inject(WizardValidationService);
  private snackBar = inject(MatSnackBar);
  private aboutDataService = inject(AboutDataService);

  activeProject = this.projectService.activeProject;
  submitted = signal(false);

  basicForm: FormGroup;
  private _subs = new Subscription();

  classifications = ['Public', 'Internal', 'Confidential', 'Restricted', 'Top Secret'];

  constructor() {
    this.basicForm = this.fb.group({
      projectName:         ['', Validators.required],
      projectVersion:      ['', Validators.required],
      projectOrganization: ['', Validators.required],
      classification:      ['', Validators.required]
    });

    effect(() => {
      const proj = this.activeProject();
      if (proj) {
        this.basicForm.patchValue({
          projectName:         proj.projectName || '',
          projectVersion:      proj.projectVersion || '',
          projectOrganization: proj.projectOrganization || '',
          classification:      proj.classification || ''
        }, { emitEvent: false });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this._subs.add(
      this.validationService.continueClicked$.subscribe(() => {
        this.submitted.set(true);
        if (this.basicForm.invalid) {
          const firstInvalid = document.querySelector('.field-invalid') as HTMLElement;
          firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.validationService.reportResult(false);
          return;
        }
        this.saveAndProceed();
      })
    );
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  isFieldInvalid(field: string): boolean {
    return this.submitted() && (this.basicForm.get(field)?.invalid ?? false);
  }

  openAbout(): void {
    this.aboutDataService.open('basic-info');
  }

  private saveAndProceed(): void {
    const proj = this.activeProject();
    if (!proj?.id) {
      this.validationService.reportResult(true);
      return;
    }
    const val = this.basicForm.value;
    this.projectService.updateProject(proj.id, { ...proj, ...val }).subscribe({
      next: updated => {
        this.projectService.activeProject.set(updated);
        this.validationService.reportResult(true);
      },
      error: () => {
        this.snackBar.open('Failed to save basic info.', 'Dismiss', { duration: 3000 });
        this.validationService.reportResult(false);
      }
    });
  }
}

