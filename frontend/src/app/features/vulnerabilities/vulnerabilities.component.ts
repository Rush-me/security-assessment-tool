import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { AssetService, SupportingAsset } from '../../core/services/asset.service';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { AiStatusService } from '../../core/services/ai-status.service';
import { RiskAiService, VulnerabilitySuggestion } from '../../core/services/risk-ai.service';
import { AboutDataService } from '../../core/services/about-data.service';
import { timeout, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-vulnerabilities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './vulnerabilities.component.html',
  styleUrls: ['./vulnerabilities.component.scss']
})
export class VulnerabilitiesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private vulnService = inject(VulnerabilityService);
  private assetService = inject(AssetService);
  private projectService = inject(ProjectService);
  private snackBar = inject(MatSnackBar);
  private aiService = inject(AiStatusService);
  private riskAiService = inject(RiskAiService);
  private aboutDataService = inject(AboutDataService);
  private validationService = inject(WizardValidationService);
  private _subs = new Subscription();

  vulnerabilities = signal<Vulnerability[]>([]);
  supportingAssets = signal<SupportingAsset[]>([]);
  activeProject = this.projectService.activeProject;

  selectedVulnerability = signal<Vulnerability | null>(null);

  aiState = this.aiService.aiState;
  aiStatusMessage = this.aiService.statusMessage;
  aiSuggestions = signal<VulnerabilitySuggestion[]>([]);
  isLoadingSuggestions = signal<boolean>(false);

  vulnForm: FormGroup;
  submitted = signal(false);
  listSubmitted = signal(false);

  vulnFamilies = [
    'Access Control', 'Authentication', 'Authorization', 'Cryptography',
    'Data Validation', 'Error Handling', 'Configuration', 'Network',
    'Physical', 'Software', 'Supply Chain', 'Other'
  ];

  constructor() {
    this.vulnForm = this.fb.group({
      vulnerabilityName: ['', [Validators.required, Validators.minLength(3)]],
      vulnerabilityFamily: ['Other', [Validators.required]],
      trackingId: ['Open', [Validators.required]],
      trackingUri: [''],
      vulnerabilityDescription: [''],
      cve: [''],
      cveScore: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      supportingAssets: [[], [Validators.required, (c: import('@angular/forms').AbstractControl) => (c.value?.length ? null : { required: true })]]
    });
  }

  ngOnInit(): void {
    this._subs.add(
      this.validationService.continueClicked$.subscribe(() => {
        this.listSubmitted.set(true);
        if (this.vulnerabilities().length === 0) {
          this.validationService.reportResult(false);
          return;
        }
        // Validate currently-open vulnerability editor
        this.submitted.set(true);
        this.vulnForm.markAllAsTouched();
        if (this.vulnForm.invalid) {
          const firstInvalid = document.querySelector(
            '.mat-mdc-form-field.ng-invalid.ng-touched, .field-invalid'
          ) as HTMLElement;
          firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.validationService.reportResult(false);
          return;
        }

        const proj = this.activeProject();
        if (!proj?.id) {
          // Demo mode — navigate without saving
          this.validationService.reportResult(true);
          return;
        }

        // Apply current form values to the selected vulnerability before building batch payload
        const selected = this.selectedVulnerability();
        if (selected) {
          this.applyFormToVuln(selected);
        }

        const payload = this.buildAllVulnsPayload();
        if (payload.length === 0) {
          this.validationService.reportResult(true);
          return;
        }

        this.validationService.isSaving.set(true);
        this.vulnService.batchUpdateVulnerabilities(proj.id, payload).pipe(
          finalize(() => this.validationService.isSaving.set(false))
        ).subscribe({
          next: (updated) => {
            this.vulnerabilities.set(updated);
            const currentId = this.selectedVulnerability()?.id;
            const fresh = updated.find(v => v.id === currentId);
            if (fresh) this.selectedVulnerability.set(structuredClone(fresh));
            this.vulnForm.markAsPristine();
            this.validationService.reportResult(true);
          },
          error: () => {
            this.snackBar.open('Failed to save vulnerabilities. Please try again.', 'Dismiss', { duration: 4000 });
            this.validationService.reportResult(false);
          }
        });
      })
    );
    this.loadData();

    this.vulnForm.valueChanges.subscribe(val => {
      const selected = this.selectedVulnerability();
      if (!selected) return;

      selected.vulnerabilityName = val.vulnerabilityName;
      selected.vulnerabilityDescription = val.vulnerabilityDescription;
      selected.cveScore = val.cveScore || 0;
      selected.vulnerabilityFamily = val.vulnerabilityFamily;
      selected.trackingId = val.trackingId;
      selected.overallLevel = this.getExploitabilityLevel(val.cveScore || 0);

      if (val.supportingAssets) {
        selected.supportingAssets = val.supportingAssets.map((id: number) => {
          const found = this.supportingAssets().find(sa => sa.id === id);
          return found ? found : ({ id } as any);
        });
      }

      // Clear AI suggestions when assets change so stale results don't linger
      this.aiSuggestions.set([]);
    });
  }

  isFieldInvalid(field: string): boolean {
    return this.submitted() && (this.vulnForm.get(field)?.invalid ?? false);
  }

  isAssetsInvalid(): boolean {
    const val: number[] = this.vulnForm.get('supportingAssets')?.value || [];
    return this.submitted() && val.length === 0;
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  openAbout(): void {
    this.aboutDataService.open('vulnerabilities');
  }

  private applyFormToVuln(vuln: Vulnerability): void {
    const val = this.vulnForm.getRawValue();
    vuln.vulnerabilityName = val.vulnerabilityName;
    vuln.vulnerabilityFamily = val.vulnerabilityFamily;
    vuln.trackingId = val.trackingId;
    vuln.trackingUri = val.trackingUri;
    vuln.vulnerabilityDescription = val.vulnerabilityDescription;
    vuln.cve = val.cve;
    vuln.cveScore = val.cveScore || 0;
    vuln.overallLevel = this.getExploitabilityLevel(val.cveScore || 0);
    vuln.supportingAssets = (val.supportingAssets || []).map((id: number) => ({ id } as any));
  }

  private buildAllVulnsPayload(): Vulnerability[] {
    return this.vulnerabilities()
      .filter(v => v.id != null)
      .map(v => ({
        ...v,
        supportingAssets: (v.supportingAssets || []).map(sa => ({ id: sa.id } as any))
      } as Vulnerability));
  }

  loadData(): void {
    const proj = this.activeProject();
    if (!proj?.id) {
      this.vulnerabilities.set([]);
      return;
    }

    this.vulnService.getVulnerabilities(proj.id).subscribe({
      next: (v) => {
        this.vulnerabilities.set(v ?? []);
        if (this.vulnerabilities().length > 0) {
          this.selectVulnerability(this.vulnerabilities()[0]);
        }
      },
      error: () => {
        this.vulnerabilities.set([]);
      }
    });

    this.assetService.getSupportingAssets(proj.id).subscribe({
      next: (a) => this.supportingAssets.set(a)
    });
  }

  selectVulnerability(vuln: Vulnerability): void {
    this.selectedVulnerability.set(vuln);
    // Clear previous suggestions when switching vulnerabilities
    this.aiSuggestions.set([]);

    this.vulnForm.patchValue({
      vulnerabilityName: vuln.vulnerabilityName,
      vulnerabilityFamily: vuln.vulnerabilityFamily || 'Other',
      trackingId: vuln.trackingId || 'Open',
      trackingUri: vuln.trackingUri || '',
      vulnerabilityDescription: vuln.vulnerabilityDescription || '',
      cve: vuln.cve || '',
      cveScore: vuln.cveScore || 0,
      supportingAssets: (vuln.supportingAssets || []).map(sa => sa.id)
    }, { emitEvent: false });
  }

  onAddClick(): void {
    const proj = this.activeProject();
    const newId = Date.now();
    const nextNum = this.vulnerabilities().length + 1;
    const newVuln: Vulnerability = {
      id: newId,
      vulnerabilityId: nextNum,
      vulnerabilityName: 'New Vulnerability',
      vulnerabilityFamily: 'Other',
      cveScore: 0.0,
      overallLevel: 'Low',
      trackingId: 'Open',
      vulnerabilityDescription: '',
      supportingAssets: []
    };

    if (proj?.id) {
      const payload: Vulnerability = {
        vulnerabilityName: newVuln.vulnerabilityName,
        vulnerabilityFamily: newVuln.vulnerabilityFamily,
        cveScore: newVuln.cveScore,
        overallLevel: newVuln.overallLevel,
        trackingId: newVuln.trackingId,
        vulnerabilityDescription: newVuln.vulnerabilityDescription,
        supportingAssets: []
      };
      this.vulnService.addVulnerability(proj.id, payload).subscribe({
        next: (saved) => {
          newVuln.id = saved.id;
          newVuln.vulnerabilityId = saved.vulnerabilityId;
          this.vulnerabilities.update(list => [...list, newVuln]);
          this.selectVulnerability(newVuln);
        },
        error: () => {
          this.vulnerabilities.update(list => [...list, newVuln]);
          this.selectVulnerability(newVuln);
        }
      });
    } else {
      this.vulnerabilities.update(list => [...list, newVuln]);
      this.selectVulnerability(newVuln);
    }
  }

  // ─── Asset helpers ────────────────────────────────────────────────────────

  /** Returns the display name for a supporting asset id. */
  getAssetName(assetId: number): string {
    const found = this.supportingAssets().find(sa => sa.id === assetId);
    return found ? found.assetName : `Asset ${assetId}`;
  }

  /** Removes a single asset from the supportingAssets form control. */
  removeAsset(assetId: number): void {
    const current: number[] = this.vulnForm.get('supportingAssets')?.value || [];
    this.vulnForm.patchValue({
      supportingAssets: current.filter(id => id !== assetId)
    });
    // Clear suggestions since asset set changed
    this.aiSuggestions.set([]);
  }

  /** Returns the name of the first linked supporting asset (used in the metric box). */
  getAffectedAssetName(): string {
    const assets: number[] = this.vulnForm.get('supportingAssets')?.value || [];
    if (assets.length === 0) {
      const selected = this.selectedVulnerability();
      if (selected?.supportingAssets && selected.supportingAssets.length > 0) {
        return selected.supportingAssets[0].assetName;
      }
      return '—';
    }
    return this.getAssetName(assets[0]);
  }

  // ─── AI helpers ───────────────────────────────────────────────────────────

  onSuggestVulnerabilities(): void {
    const assets: number[] = this.vulnForm.get('supportingAssets')?.value || [];
    // Guard — button is hidden when empty, but keep as safety net
    if (assets.length === 0) return;

    if (this.isLoadingSuggestions()) return;

    const state = this.aiState();
    if (state === 'offline' || state === 'not-configured') {
      this.snackBar.open('AI service is offline.', 'Dismiss', { duration: 3000 });
      return;
    }

    const supportingAssetId = assets[0];
    this.isLoadingSuggestions.set(true);
    this.aiSuggestions.set([]);

    this.riskAiService.suggestVulnerabilities(supportingAssetId).pipe(
      timeout(30000),
      finalize(() => this.isLoadingSuggestions.set(false))
    ).subscribe({
      next: (res) => {
        this.aiSuggestions.set(res.suggestions || []);
        if (res.suggestions?.length) {
          this.snackBar.open('Vulnerability suggestions generated successfully.', 'Dismiss', { duration: 3000 });
        } else {
          this.snackBar.open('No suggestions returned from the AI model.', 'Dismiss', { duration: 3000 });
        }
      },
      error: (err) => {
        if (err.name === 'TimeoutError') {
          this.snackBar.open('AI suggestion request timed out. Please try again.', 'Dismiss', { duration: 5000 });
        } else {
          this.snackBar.open('Failed to generate vulnerability suggestions.', 'Dismiss', { duration: 5000 });
        }
      }
    });
  }

  useSuggestion(suggestion: VulnerabilitySuggestion): void {
    this.vulnForm.patchValue({
      vulnerabilityName: suggestion.vulnerabilityName,
      vulnerabilityFamily: suggestion.vulnerabilityFamily || 'Other',
      vulnerabilityDescription: suggestion.vulnerabilityDescription,
      cveScore: suggestion.estimatedCveScore || 0
    });
    this.aiSuggestions.set([]);
    this.snackBar.open('Suggestion applied to the form.', 'Dismiss', { duration: 3000 });
  }

  // ─── Severity / status helpers ────────────────────────────────────────────

  getExploitabilityLevel(score: number | undefined): string {
    const val = score ?? 0;
    if (val >= 9.0) return 'Critical';
    if (val >= 7.0) return 'High';
    if (val >= 4.0) return 'Moderate';
    return 'Low';
  }

  getSeverityColor(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'critical': return '#c81e1e';
      case 'high':     return '#8e4b10';
      case 'moderate': return '#92610a';
      case 'low':      return '#065f46';
      default:         return 'var(--text-primary)';
    }
  }

  getSeverityClass(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'critical':  return 'critical';
      case 'high':      return 'high';
      case 'medium':
      case 'moderate':  return 'moderate';
      case 'low':       return 'low';
      default:          return 'low';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'open':      return 'open';
      case 'mitigated': return 'mitigated';
      case 'accepted':  return 'accepted';
      default:          return 'open';
    }
  }

  onDeleteVulnerability(id: number, event: Event): void {
    event.stopPropagation();
    const vuln = this.vulnerabilities().find(v => v.id === id);
    const name = vuln?.vulnerabilityName || 'this vulnerability';
    const confirmed = confirm(
      `Delete "${name}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    const proj = this.activeProject();
    if (!proj?.id) {
      // Demo mode — just remove from list
      this.removeVulnFromList(id);
      return;
    }

    this.vulnService.deleteVulnerability(proj.id, id).subscribe({
      next: () => {
        this.snackBar.open('Vulnerability deleted successfully.', 'Dismiss', { duration: 3000 });
        this.removeVulnFromList(id);
      },
      error: () => {
        this.snackBar.open('Failed to delete vulnerability.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  private removeVulnFromList(id: number): void {
    const list = this.vulnerabilities();
    const idx = list.findIndex(v => v.id === id);
    const filtered = list.filter(v => v.id !== id);
    this.vulnerabilities.set(filtered);

    if (this.selectedVulnerability()?.id === id) {
      const next = filtered[idx] ?? filtered[idx - 1] ?? null;
      if (next) {
        this.selectVulnerability(next);
      } else {
        this.selectedVulnerability.set(null);
        this.vulnForm.reset();
      }
    }
  }
}