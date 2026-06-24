import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AssetService, BusinessAsset } from '../../core/services/asset.service';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-business-assets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './business-assets.component.html',
  styleUrls: ['./business-assets.component.scss']
})
export class BusinessAssetsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  private projectService = inject(ProjectService);
  private validationService = inject(WizardValidationService);
  private snackBar = inject(MatSnackBar);

  assets = signal<BusinessAsset[]>([]);
  activeProject = this.projectService.activeProject;
  showForm = signal<boolean>(false);
  editMode = signal<boolean>(false);
  editingAssetId = signal<number | null>(null);
  assetForm: FormGroup;
  submitted = signal(false);   // form-level (asset add/edit form)
  listSubmitted = signal(false); // true after Continue was clicked
  private _subs = new Subscription();

  assetTypes = ['Information', 'Data', 'Service', 'Process', 'Hardware', 'Software', 'Function', 'Secret'];
  ratingValues = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Low' },
    { value: 2, label: 'Moderate' },
    { value: 3, label: 'High' }
  ];

  ratingProps = [
    { key: 'confidentiality', label: 'C' },
    { key: 'integrity', label: 'I' },
    { key: 'availability', label: 'A' },
    { key: 'authenticity', label: 'Au' },
    { key: 'authorization', label: 'Az' },
    { key: 'nonRepudiation', label: 'Nr' }
  ];

  ratingColumns = this.ratingProps;
  displayedColumns = ['assetName', 'assetType', 'confidentiality', 'integrity', 'availability', 'authenticity', 'authorization', 'nonRepudiation', 'assetDescription', 'actions'];

  constructor() {
    this.assetForm = this.fb.group({
      assetName: ['', [Validators.required, Validators.minLength(2)]],
      assetType: ['Information', [Validators.required]],
      assetDescription: [''],
      confidentiality: [1],
      integrity: [1],
      availability: [1],
      authenticity: [1],
      authorization: [1],
      nonRepudiation: [1]
    });
  }

  ngOnInit(): void {
    this._subs.add(
      this.validationService.continueClicked$.subscribe(() => {
        this.listSubmitted.set(true);
        if (this.assets().length === 0) {
          this.validationService.reportResult(false);
          return;
        }
        this.validationService.reportResult(true);
      })
    );
    this.loadAssets();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  loadAssets() {
    const proj = this.activeProject();
    if (!proj?.id) return;
    this.assetService.getBusinessAssets(proj.id).subscribe({
      next: (a) => this.assets.set(a),
      error: () => this.snackBar.open('Failed to load assets.', 'Dismiss', { duration: 3000 })
    });
  }

  getRatingLabel(value: number): string {
    return this.ratingValues.find(r => r.value === value)?.label || 'None';
  }

  cycleRating(asset: BusinessAsset, key: string) {
    const current = (asset as any)[key] as number;
    const next = (current + 1) % 4;
    const updated = { ...asset, [key]: next };
    const proj = this.activeProject();
    if (!proj?.id || !asset.id) return;
    this.assetService.updateBusinessAsset(proj.id, asset.id, updated).subscribe({
      next: () => this.loadAssets(),
      error: () => this.snackBar.open('Failed to update rating.', 'Dismiss', { duration: 2000 })
    });
  }

  onAddAssetClick() {
    this.editMode.set(false);
    this.editingAssetId.set(null);
    this.assetForm.reset({ assetType: 'Information', confidentiality: 1, integrity: 1, availability: 1, authenticity: 1, authorization: 1, nonRepudiation: 1 });
    this.showForm.set(true);
  }

  onEditAsset(asset: BusinessAsset) {
    this.editMode.set(true);
    this.editingAssetId.set(asset.id || null);
    this.assetForm.patchValue(asset);
    this.showForm.set(true);
  }

  onSubmit() {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }
    const proj = this.activeProject();
    if (!proj?.id) return;

    if (this.editMode() && this.editingAssetId()) {
      this.assetService.updateBusinessAsset(proj.id, this.editingAssetId()!, this.assetForm.value).subscribe({
        next: () => { this.showForm.set(false); this.loadAssets(); },
        error: () => this.snackBar.open('Failed to update asset.', 'Dismiss', { duration: 3000 })
      });
    } else {
      this.assetService.addBusinessAsset(proj.id, this.assetForm.value).subscribe({
        next: () => { this.showForm.set(false); this.loadAssets(); },
        error: () => this.snackBar.open('Failed to add asset.', 'Dismiss', { duration: 3000 })
      });
    }
  }

  onDeleteAsset(id: number) {
    const proj = this.activeProject();
    if (!proj?.id) return;
    if (confirm('Delete this asset?')) {
      this.assetService.deleteBusinessAsset(proj.id, id).subscribe({
        next: () => this.loadAssets(),
        error: () => this.snackBar.open('Failed to delete asset.', 'Dismiss', { duration: 3000 })
      });
    }
  }
}
