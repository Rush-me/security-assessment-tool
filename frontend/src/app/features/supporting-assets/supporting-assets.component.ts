import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AssetService, BusinessAsset, SupportingAsset } from '../../core/services/asset.service';
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
import { MatDialogModule } from '@angular/material/dialog';
import { AboutDataService } from '../../core/services/about-data.service';

@Component({
  selector: 'app-supporting-assets',
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
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './supporting-assets.component.html',
  styleUrls: ['./supporting-assets.component.scss']
})
export class SupportingAssetsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  private projectService = inject(ProjectService);
  private validationService = inject(WizardValidationService);
  private snackBar = inject(MatSnackBar);
  private aboutDataService = inject(AboutDataService);

  assets = signal<SupportingAsset[]>([]);
  businessAssets = signal<BusinessAsset[]>([]);
  activeProject = this.projectService.activeProject;
  showForm = signal<boolean>(false);
  editMode = signal<boolean>(false);
  editingAssetId = signal<number | null>(null);
  assetForm: FormGroup;
  listSubmitted = signal(false);
  private _subs = new Subscription();

  assetTypes = [
    'Application', 'Service', 'Database', 'Operating System', 'Network', 
    'Hardware', 'People', 'Physical', 'Process', 'Middleware'
  ];

  securityLevels = [
    { value: 1, label: 'SL1 - Basic' },
    { value: 2, label: 'SL2 - Standard' },
    { value: 3, label: 'SL3 - Advanced' },
    { value: 4, label: 'SL4 - High Assurance' }
  ];

  displayedColumns: string[] = ['assetId', 'hldId', 'assetName', 'assetType', 'securityLevel', 'businessAssets', 'actions'];

  constructor() {
    this.assetForm = this.fb.group({
      hldId: [''],
      assetName: ['', [Validators.required, Validators.minLength(2)]],
      assetType: ['Application', [Validators.required]],
      securityLevel: [1],
      businessAssets: [[]]
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
    this.loadBusinessAssets();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  openAbout(): void {
    this.aboutDataService.open('supporting-assets');
  }

  loadAssets() {
    const proj = this.activeProject();
    if (!proj?.id) return;
    this.assetService.getSupportingAssets(proj.id).subscribe({
      next: (assets) => this.assets.set(assets),
      error: () => this.snackBar.open('Failed to load supporting assets.', 'Dismiss', { duration: 3000 })
    });
  }

  loadBusinessAssets() {
    const proj = this.activeProject();
    if (!proj?.id) return;
    this.assetService.getBusinessAssets(proj.id).subscribe({
      next: (assets) => this.businessAssets.set(assets),
      error: () => {}
    });
  }

  onAddAssetClick() {
    this.editMode.set(false);
    this.editingAssetId.set(null);
    this.assetForm.reset({ assetType: 'Application', securityLevel: 1, businessAssets: [] });
    this.showForm.set(true);
  }

  onEditAsset(asset: SupportingAsset) {
    this.editMode.set(true);
    this.editingAssetId.set(asset.id || null);
    this.assetForm.patchValue({
      hldId: asset.hldId,
      assetName: asset.assetName,
      assetType: asset.assetType,
      securityLevel: asset.securityLevel,
      businessAssets: (asset.businessAssets || []).map(ba => ba.id)
    });
    this.showForm.set(true);
  }

  onSubmit() {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }
    const proj = this.activeProject();
    if (!proj?.id) return;

    const formValue = this.assetForm.value;
    const payload: SupportingAsset = {
      ...formValue,
      businessAssets: (formValue.businessAssets || []).map((id: number) => ({ id }))
    };

    if (this.editMode() && this.editingAssetId()) {
      this.assetService.updateSupportingAsset(proj.id, this.editingAssetId()!, payload).subscribe({
        next: () => { this.snackBar.open('Supporting asset updated!', 'Dismiss', { duration: 3000 }); this.showForm.set(false); this.loadAssets(); },
        error: () => this.snackBar.open('Failed to update asset.', 'Dismiss', { duration: 3000 })
      });
    } else {
      this.assetService.addSupportingAsset(proj.id, payload).subscribe({
        next: () => { this.snackBar.open('Supporting asset added!', 'Dismiss', { duration: 3000 }); this.showForm.set(false); this.loadAssets(); },
        error: () => this.snackBar.open('Failed to add asset.', 'Dismiss', { duration: 3000 })
      });
    }
  }

  onDeleteAsset(id: number) {
    const proj = this.activeProject();
    if (!proj?.id) return;
    if (confirm('Delete this supporting asset?')) {
      this.assetService.deleteSupportingAsset(proj.id, id).subscribe({
        next: () => { this.snackBar.open('Asset removed.', 'Dismiss', { duration: 3000 }); this.loadAssets(); },
        error: () => this.snackBar.open('Failed to delete asset.', 'Dismiss', { duration: 3000 })
      });
    }
  }

  getBusinessAssetNames(businessAssets: BusinessAsset[]): string {
    return (businessAssets || []).map(ba => ba.assetName).join(', ');
  }

  getSecurityLevelLabel(level: number): string {
    return this.securityLevels.find(sl => sl.value === level)?.label || `SL${level}`;
  }
}
