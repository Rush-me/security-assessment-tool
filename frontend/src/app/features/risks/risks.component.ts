import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RiskService, Risk, RiskMitigation } from '../../core/services/risk.service';
import { AssetService, BusinessAsset, SupportingAsset } from '../../core/services/asset.service';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { AiStatusService } from '../../core/services/ai-status.service';
import { RiskAiService, ThreatSuggestion } from '../../core/services/risk-ai.service';
import { AboutDataService } from '../../core/services/about-data.service';
import { timeout, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-risks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './risks.component.html',
  styleUrls: ['./risks.component.scss']
})
export class RisksComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private riskService = inject(RiskService);
  private assetService = inject(AssetService);
  private vulnService = inject(VulnerabilityService);
  private projectService = inject(ProjectService);
  private snackBar = inject(MatSnackBar);
  private aiService = inject(AiStatusService);
  private riskAiService = inject(RiskAiService);
  private aboutDataService = inject(AboutDataService);
  private validationService = inject(WizardValidationService);
  private _subs = new Subscription();

  risks = signal<Risk[]>([]);
  businessAssets = signal<BusinessAsset[]>([]);
  supportingAssets = signal<SupportingAsset[]>([]);
  vulnerabilities = signal<Vulnerability[]>([]);
  activeProject = this.projectService.activeProject;

  selectedRisk = signal<Risk | null>(null);

  aiState = this.aiService.aiState;
  aiStatusMessage = this.aiService.statusMessage;
  aiSuggestions = signal<ThreatSuggestion[]>([]);
  isLoadingSuggestions = signal<boolean>(false);

  submitted = signal(false);
  listSubmitted = signal(false);

  riskForm: FormGroup;
  mitigationForm: FormGroup;
  editingMitigation = signal<{ riskId: number; mitId: number | null } | null>(null);

  threatAgents = ['External Attacker', 'Internal Employee', 'Competitor', 'Nation State', 'Supplier', 'Customer', 'Script Kiddie'];
  threatVerbs = ['steal', 'tamper with', 'deny access to', 'flood', 'spoof', 'repudiate', 'gain an unauthorized access to', 'disclose', 'lose'];
  managementDecisions = ['Avoid', 'Accept', 'Mitigate', 'Transfer', 'Discarded'];
  mitigationDecisions = ['Accepted', 'Done', 'Proposed'];
  residualRiskLevels = ['Low', 'Medium', 'Moderate', 'High', 'Critical'];

  constructor() {
    this.riskForm = this.fb.group({
      threatAgent: ['External Attacker', Validators.required],
      threatAgentDetail: [''],
      threatVerb: ['steal', Validators.required],
      motivation: ['', Validators.required],
      motivationDetail: [''],
      businessAssetRefId: [null],
      supportingAssetRefId: [null],
      isAutomaticRiskName: [true],
      riskName: [''],
      isOwaspLikelihood: [true],
      skillLevel: [5],
      reward: [5],
      accessResources: [5],
      size: [5],
      intrusionDetection: [5],
      occurrence: [5],
      riskLikelihood: [null],
      riskManagementDecision: ['Accept'],
      riskManagementDetail: [''],
      residualRiskScore: [null],
      residualRiskLevel: ['Low']
    });

    this.mitigationForm = this.fb.group({
      description: ['', Validators.required],
      benefits: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]],
      cost: [null],
      decision: ['Proposed', Validators.required],
      decisionDetail: ['']
    });

    // Sync enable/disable state for riskName based on isAutomaticRiskName
    this.riskForm.get('isAutomaticRiskName')!.valueChanges.subscribe(isAuto => {
      const ctrl = this.riskForm.get('riskName')!;
      if (isAuto) {
        ctrl.disable({ emitEvent: false });
      } else {
        ctrl.enable({ emitEvent: false });
      }
    });
    this.riskForm.get('riskName')!.disable({ emitEvent: false });

    // Sync enable/disable state for riskLikelihood based on isOwaspLikelihood
    this.riskForm.get('isOwaspLikelihood')!.valueChanges.subscribe(isOwasp => {
      const ctrl = this.riskForm.get('riskLikelihood')!;
      if (isOwasp) {
        ctrl.disable({ emitEvent: false });
      } else {
        ctrl.enable({ emitEvent: false });
      }
    });
    this.riskForm.get('riskLikelihood')!.disable({ emitEvent: false });
  }

  ngOnInit(): void {
    this._subs.add(
      this.validationService.continueClicked$.subscribe(() => {
        this.listSubmitted.set(true);
        if (this.risks().length === 0) {
          this.validationService.reportResult(false);
          return;
        }
        this.submitted.set(true);
        this.riskForm.markAllAsTouched();
        if (this.riskForm.invalid) {
          const firstInvalid = document.querySelector('.field-invalid') as HTMLElement;
          firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.validationService.reportResult(false);
          return;
        }

        const proj = this.activeProject();
        if (!proj?.id) {
          this.validationService.reportResult(true);
          return;
        }

        // Apply form values to selectedRisk and flush back into the risks array
        // so buildAllRisksPayload picks up the latest UI values (residualRiskScore,
        // residualRiskLevel, inherentRiskScore, riskImpact, etc.)
        const selected = this.selectedRisk();
        if (selected) {
          this.applyFormToRisk(selected);

          // ── FIX: sync the updated selectedRisk back into risks[] ──
          this.risks.update(list =>
            list.map(r => r.id === selected.id ? { ...selected } : r)
          );
        }

        const payload = this.buildAllRisksPayload(proj.id);
        if (payload.length === 0) {
          this.validationService.reportResult(true);
          return;
        }

        this.validationService.isSaving.set(true);
        this.riskService.batchUpdateRisks(proj.id, payload).pipe(
          finalize(() => this.validationService.isSaving.set(false))
        ).subscribe({
          next: (updated) => {
            this.risks.set(updated);
            const currentId = this.selectedRisk()?.id;
            const fresh = updated.find(r => r.id === currentId);
            if (fresh) this.selectedRisk.set(structuredClone(fresh));
            this.riskForm.markAsPristine();
            this.validationService.reportResult(true);
          },
          error: () => {
            this.snackBar.open('Failed to save risks. Please try again.', 'Dismiss', { duration: 4000 });
            this.validationService.reportResult(false);
          }
        });
      })
    );
    this.loadAll();

    this.riskForm.valueChanges.subscribe(val => {
      const selected = this.selectedRisk();
      if (!selected) return;

      // Clear AI suggestions when form changes
      this.aiSuggestions.set([]);

      selected.threatAgent = val.threatAgent;
      selected.threatVerb = val.threatVerb;
      selected.motivation = val.motivation;
      selected.isAutomaticRiskName = val.isAutomaticRiskName;
      selected.riskName = val.isAutomaticRiskName
        ? `${val.threatAgent} attempting to ${val.threatVerb} ${this.getBusinessAssetName(val.businessAssetRefId)}`
        : val.riskName;
      selected.riskManagementDecision = val.riskManagementDecision;

      if (val.isOwaspLikelihood) {
        selected.skillLevel = val.skillLevel;
        selected.reward = val.reward;
        selected.accessResources = val.accessResources;
        selected.size = val.size;
        selected.intrusionDetection = val.intrusionDetection;
        selected.occurrence = val.occurrence;

        const sum = (val.skillLevel || 5) + (val.reward || 5) + (val.accessResources || 5) + (val.size || 5) + (val.intrusionDetection || 5) + (val.occurrence || 5);
        selected.riskLikelihood = Math.round((sum / 6) * 10) / 10;
        selected.inherentRiskScore = Math.round(((selected.riskLikelihood + (selected.riskImpact || 5)) / 2) * 10) / 10;
      }

      if (val.businessAssetRefId) {
        const found = this.businessAssets().find(b => b.id === val.businessAssetRefId);
        selected.businessAssetRef = found ? found : { id: val.businessAssetRefId } as any;
      }
      if (val.supportingAssetRefId) {
        const found = this.supportingAssets().find(s => s.id === val.supportingAssetRefId);
        selected.supportingAssetRef = found ? found : { id: val.supportingAssetRefId } as any;
      }

      // Sync residual fields back to selectedRisk
      selected.residualRiskScore = val.residualRiskScore != null ? Number(val.residualRiskScore) : selected.residualRiskScore;
      selected.residualRiskLevel = val.residualRiskLevel || selected.residualRiskLevel;

      // ── FIX: also keep risks[] in sync on every form change so the
      //    payload always has the latest values regardless of timing ──
      const updatedRisk = { ...selected };
      this.risks.update(list =>
        list.map(r => r.id === updatedRisk.id ? updatedRisk : r)
      );

      // Trigger signal update so template re-renders
      this.selectedRisk.set({ ...selected });
    });
  }

  loadAll() {
    const proj = this.activeProject();
    if (!proj?.id) {
      this.risks.set([]);
      return;
    }

    this.riskService.getRisks(proj.id).subscribe({
      next: (r) => {
        this.risks.set(r ?? []);
        if (this.risks().length > 0) {
          this.selectRisk(this.risks()[0]);
        }
      },
      error: () => {
        this.risks.set([]);
      }
    });

    this.assetService.getBusinessAssets(proj.id).subscribe({ next: a => this.businessAssets.set(a) });
    this.assetService.getSupportingAssets(proj.id).subscribe({ next: a => this.supportingAssets.set(a) });
    this.vulnService.getVulnerabilities(proj.id).subscribe({ next: v => this.vulnerabilities.set(v) });
  }

  selectRisk(risk: Risk) {
    this.selectedRisk.set(structuredClone(risk));
    this.aiSuggestions.set([]);

    const isAuto = risk.isAutomaticRiskName ?? true;
    const isOwasp = risk.isOwaspLikelihood !== false;

    if (isAuto) {
      this.riskForm.get('riskName')!.disable({ emitEvent: false });
    } else {
      this.riskForm.get('riskName')!.enable({ emitEvent: false });
    }
    if (isOwasp) {
      this.riskForm.get('riskLikelihood')!.disable({ emitEvent: false });
    } else {
      this.riskForm.get('riskLikelihood')!.enable({ emitEvent: false });
    }

    this.riskForm.patchValue({
      threatAgent: risk.threatAgent || 'External Attacker',
      threatAgentDetail: risk.threatAgentDetail || '',
      threatVerb: risk.threatVerb || 'steal',
      motivation: risk.motivation || '',
      motivationDetail: risk.motivationDetail || '',
      businessAssetRefId: risk.businessAssetRef?.id || null,
      supportingAssetRefId: risk.supportingAssetRef?.id || null,
      isAutomaticRiskName: isAuto,
      riskName: risk.riskName || '',
      isOwaspLikelihood: isOwasp,
      skillLevel: risk.skillLevel ?? 5,
      reward: risk.reward ?? 5,
      accessResources: risk.accessResources ?? 5,
      size: risk.size ?? 5,
      intrusionDetection: risk.intrusionDetection ?? 5,
      occurrence: risk.occurrence ?? 5,
      riskLikelihood: risk.riskLikelihood ?? null,
      riskManagementDecision: risk.riskManagementDecision || 'Accept',
      riskManagementDetail: risk.riskManagementDetail || '',
      residualRiskScore: risk.residualRiskScore ?? null,
      residualRiskLevel: risk.residualRiskLevel || 'Low'
    }, { emitEvent: false });
  }

  onAddRisk() {
    const proj = this.activeProject();
    const newId = Date.now();
    const nextNum = this.risks().length + 1;
    const newRisk: Risk = {
      id: newId,
      riskId: nextNum,
      riskName: 'New Risk Scenario',
      threatAgent: 'External Attacker',
      threatVerb: 'steal',
      motivation: '',
      isAutomaticRiskName: true,
      inherentRiskScore: 0.0,
      residualRiskScore: 0.0,
      residualRiskLevel: 'Low',
      riskManagementDecision: 'Accept',
      riskAttackPaths: [],
      riskMitigations: []
    };

    if (proj?.id) {
      const payload: Risk = {
        threatAgent: newRisk.threatAgent,
        threatVerb: newRisk.threatVerb,
        motivation: newRisk.motivation,
        isAutomaticRiskName: newRisk.isAutomaticRiskName,
        riskName: newRisk.riskName,
        riskManagementDecision: newRisk.riskManagementDecision,
        riskAttackPaths: [],
        riskMitigations: []
      };
      this.riskService.addRisk(proj.id, payload).subscribe({
        next: (saved) => {
          newRisk.id = saved.id;
          newRisk.riskId = saved.riskId;
          this.risks.update(list => [...list, newRisk]);
          this.selectRisk(newRisk);
        },
        error: () => {
          this.risks.update(list => [...list, newRisk]);
          this.selectRisk(newRisk);
        }
      });
    } else {
      this.risks.update(list => [...list, newRisk]);
      this.selectRisk(newRisk);
    }
  }

  onDeleteRisk(id: number, event?: Event) {
    if (event) event.stopPropagation();
    const risk = this.risks().find(r => r.id === id);
    const name = risk?.riskName || 'this risk scenario';
    const confirmed = confirm(
      `Delete "${name}"?\n\nThis will also remove all its attack paths and mitigations.\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    const proj = this.activeProject();
    if (!proj?.id) {
      this.removeRiskFromList(id);
      return;
    }
    this.riskService.deleteRisk(proj.id, id).subscribe({
      next: () => {
        this.snackBar.open('Risk deleted successfully.', 'Dismiss', { duration: 3000 });
        this.removeRiskFromList(id);
      },
      error: () => {
        this.snackBar.open('Failed to delete risk.', 'Dismiss', { duration: 4000 });
      }
    });
  }

  private removeRiskFromList(id: number): void {
    const list = this.risks();
    const idx = list.findIndex(r => r.id === id);
    const filtered = list.filter(r => r.id !== id);
    this.risks.set(filtered);
    if (this.selectedRisk()?.id === id) {
      const next = filtered[idx] ?? filtered[idx - 1] ?? null;
      if (next) {
        this.selectRisk(next);
      } else {
        this.selectedRisk.set(null);
        this.riskForm.reset();
      }
    }
  }

  addAttackPath(riskId: number) {
    const proj = this.activeProject();
    if (!proj?.id) {
      const selected = this.selectedRisk();
      if (selected) {
        const nextId = (selected.riskAttackPaths || []).length + 1;
        selected.riskAttackPaths = [...(selected.riskAttackPaths || []), { id: Date.now(), attackPathId: nextId, attackPathScore: 0, vulnerabilityRefs: [] }];
        this.selectedRisk.set({ ...selected });
      }
      return;
    }
    this.riskService.addAttackPath(proj.id, riskId).subscribe({
      next: (updated) => {
        this.risks.update(risks => risks.map(r => r.id === riskId ? structuredClone(updated) : r));
        this.selectedRisk.set(structuredClone(updated));
      }
    });
  }

  deleteAttackPath(riskId: number, pathId: number) {
    const proj = this.activeProject();
    if (!proj?.id) {
      const selected = this.selectedRisk();
      if (selected) {
        selected.riskAttackPaths = (selected.riskAttackPaths || []).filter(p => p.id !== pathId);
        this.selectedRisk.set(structuredClone(selected));
      }
      return;
    }
    this.riskService.deleteAttackPath(proj.id, riskId, pathId).subscribe({
      next: (updated) => {
        this.risks.update(risks => risks.map(r => r.id === riskId ? structuredClone(updated) : r));
        this.selectedRisk.set(structuredClone(updated));
      }
    });
  }

  addVulnToPath(riskId: number, pathId: number, vulnId: number) {
    if (!vulnId) return;
    const proj = this.activeProject();
    if (!proj?.id) {
      const selected = this.selectedRisk();
      const vuln = this.vulnerabilities().find(v => v.id === vulnId);
      if (selected && vuln) {
        const path = (selected.riskAttackPaths || []).find(p => p.id === pathId);
        if (path) {
          path.vulnerabilityRefs = [...(path.vulnerabilityRefs || []), { id: vuln.id, name: vuln.vulnerabilityName, score: vuln.cveScore, vulnerability: vuln }];
          path.attackPathScore = Math.max(...(path.vulnerabilityRefs || []).map(r => r.score || 0));
          this.selectedRisk.set(structuredClone(selected));
        }
      }
      return;
    }
    this.riskService.addVulnerabilityToAttackPath(proj.id, riskId, pathId, vulnId).subscribe({
      next: (updated) => {
        this.risks.update(risks => risks.map(r => r.id === riskId ? structuredClone(updated) : r));
        this.selectedRisk.set(structuredClone(updated));
      }
    });
  }

  removeVulnRef(riskId: number, pathId: number, refId: number) {
    const proj = this.activeProject();
    if (!proj?.id) {
      const selected = this.selectedRisk();
      if (selected) {
        const path = (selected.riskAttackPaths || []).find(p => p.id === pathId);
        if (path) {
          path.vulnerabilityRefs = (path.vulnerabilityRefs || []).filter(r => r.id !== refId);
          path.attackPathScore = path.vulnerabilityRefs.length > 0 ? Math.max(...path.vulnerabilityRefs.map(r => r.score || 0)) : 0;
          this.selectedRisk.set(structuredClone(selected));
        }
      }
      return;
    }
    this.riskService.removeVulnerabilityFromAttackPath(proj.id, riskId, pathId, refId).subscribe({
      next: (updated) => {
        this.risks.update(risks => risks.map(r => r.id === riskId ? structuredClone(updated) : r));
        this.selectedRisk.set(structuredClone(updated));
      }
    });
  }

  onAddMitigation(riskId: number) {
    this.editingMitigation.set({ riskId, mitId: null });
    this.mitigationForm.reset({ benefits: 0.5, decision: 'Proposed' });
  }

  onEditMitigation(riskId: number, mit: RiskMitigation) {
    this.editingMitigation.set({ riskId, mitId: mit.id || null });
    this.mitigationForm.patchValue({
      description: mit.description,
      benefits: mit.benefits,
      cost: mit.cost,
      decision: mit.decision,
      decisionDetail: mit.decisionDetail
    });
  }

  onSubmitMitigation() {
    const state = this.editingMitigation();
    const proj = this.activeProject();
    if (!state || this.mitigationForm.invalid) return;

    const payload: RiskMitigation = this.mitigationForm.value;

    if (!proj?.id) {
      const selected = this.selectedRisk();
      if (selected) {
        if (state.mitId) {
          selected.riskMitigations = (selected.riskMitigations || []).map(m => m.id === state.mitId ? { ...m, ...payload } : m);
        } else {
          selected.riskMitigations = [...(selected.riskMitigations || []), { id: Date.now(), ...payload }];
        }
        this.selectedRisk.set({ ...selected });
        this.editingMitigation.set(null);
      }
      return;
    }

    if (state.mitId) {
      this.riskService.updateMitigation(proj.id, state.riskId, state.mitId, payload).subscribe({
        next: (updated) => {
          this.risks.update(risks => risks.map(r => r.id === state.riskId ? structuredClone(updated) : r));
          this.selectedRisk.set(structuredClone(updated));
          this.editingMitigation.set(null);
        }
      });
    } else {
      this.riskService.addMitigation(proj.id, state.riskId, payload).subscribe({
        next: (updated) => {
          this.risks.update(risks => risks.map(r => r.id === state.riskId ? structuredClone(updated) : r));
          this.selectedRisk.set(structuredClone(updated));
          this.editingMitigation.set(null);
        }
      });
    }
  }

  onDeleteMitigation(riskId: number, mitId: number) {
    const proj = this.activeProject();
    if (!proj?.id) {
      const selected = this.selectedRisk();
      if (selected) {
        selected.riskMitigations = (selected.riskMitigations || []).filter(m => m.id !== mitId);
        this.selectedRisk.set({ ...selected });
      }
      return;
    }
    this.riskService.deleteMitigation(proj.id, riskId, mitId).subscribe({
      next: (updated) => {
        this.risks.update(risks => risks.map(r => r.id === riskId ? structuredClone(updated) : r));
        this.selectedRisk.set(structuredClone(updated));
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.submitted() && (this.riskForm.get(fieldName)?.invalid ?? false);
  }

  private applyFormToRisk(risk: Risk): void {
    const val = this.riskForm.getRawValue();
    risk.threatAgent = val.threatAgent;
    risk.threatAgentDetail = val.threatAgentDetail;
    risk.threatVerb = val.threatVerb;
    risk.motivation = val.motivation;
    risk.motivationDetail = val.motivationDetail;
    risk.isAutomaticRiskName = val.isAutomaticRiskName;
    risk.isOwaspLikelihood = val.isOwaspLikelihood;
    risk.skillLevel = val.skillLevel;
    risk.reward = val.reward;
    risk.accessResources = val.accessResources;
    risk.size = val.size;
    risk.intrusionDetection = val.intrusionDetection;
    risk.occurrence = val.occurrence;
    if (!val.isOwaspLikelihood) risk.riskLikelihood = val.riskLikelihood;
    risk.riskManagementDecision = val.riskManagementDecision;
    risk.riskManagementDetail = val.riskManagementDetail;
    if (!val.isAutomaticRiskName) risk.riskName = val.riskName;
    if (val.businessAssetRefId) {
      risk.businessAssetRef = { id: val.businessAssetRefId } as any;
    }
    if (val.supportingAssetRefId) {
      risk.supportingAssetRef = { id: val.supportingAssetRefId } as any;
    }
    // Apply residual fields
    risk.residualRiskScore = val.residualRiskScore != null ? Number(val.residualRiskScore) : risk.residualRiskScore;
    risk.residualRiskLevel = val.residualRiskLevel || risk.residualRiskLevel;
  }

  private buildAllRisksPayload(projId: number): Risk[] {
    return this.risks()
      .filter(r => r.id != null)
      .map(r => ({
        ...r,
        businessAssetRef: r.businessAssetRef?.id ? { id: r.businessAssetRef.id } : null,
        supportingAssetRef: r.supportingAssetRef?.id ? { id: r.supportingAssetRef.id } : null,
        riskAttackPaths: (r.riskAttackPaths || []).map(path => ({
          id: path.id,
          attackPathId: path.attackPathId,
          attackPathName: path.attackPathName,
          attackPathScore: path.attackPathScore,
          vulnerabilityRefs: (path.vulnerabilityRefs || []).map(ref => ({
            id: ref.id,
            score: ref.score,
            name: ref.name,
            vulnerability: ref.vulnerability?.id ? { id: ref.vulnerability.id } : undefined
          }))
        })),
        riskMitigations: (r.riskMitigations || []).map(mit => ({
          id: mit.id,
          mitigationId: mit.mitigationId,
          description: mit.description,
          benefits: mit.benefits,
          cost: mit.cost,
          decision: mit.decision,
          decisionDetail: mit.decisionDetail
        }))
      } as Risk));
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  openAbout(): void {
    this.aboutDataService.open('risks');
  }

  getBusinessAssetName(id: number | null): string {
    if (!id) return '';
    const found = this.businessAssets().find(b => b.id === id);
    return found ? found.assetName : '';
  }

  getResidualClass(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'moderate';
      case 'moderate': return 'moderate';
      case 'low': return 'low';
      default: return 'low';
    }
  }

  getSeverityColor(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'critical': return '#c81e1e';
      case 'high': return '#8e4b10';
      case 'moderate': return '#92610a';
      case 'low': return '#065f46';
      default: return 'var(--text-primary)';
    }
  }

  onSuggestThreats(): void {
    const businessAssetId: number | null = this.riskForm.get('businessAssetRefId')?.value ?? null;
    const supportingAssetId: number | null = this.riskForm.get('supportingAssetRefId')?.value ?? null;

    if (!businessAssetId && !supportingAssetId) return;
    if (this.isLoadingSuggestions()) return;

    const state = this.aiState();
    if (state === 'offline' || state === 'not-configured') {
      this.snackBar.open('AI service is offline.', 'Dismiss', { duration: 3000 });
      return;
    }

    this.isLoadingSuggestions.set(true);
    this.aiSuggestions.set([]);

    this.riskAiService.suggestThreats(businessAssetId, supportingAssetId).pipe(
      timeout(30000),
      finalize(() => this.isLoadingSuggestions.set(false))
    ).subscribe({
      next: (res) => {
        this.aiSuggestions.set(res.suggestions || []);
        if (res.suggestions?.length) {
          this.snackBar.open('Threat suggestions generated successfully.', 'Dismiss', { duration: 3000 });
        } else {
          this.snackBar.open('No suggestions returned from the AI model.', 'Dismiss', { duration: 3000 });
        }
      },
      error: (err) => {
        if (err.name === 'TimeoutError') {
          this.snackBar.open('AI suggestion request timed out. Please try again.', 'Dismiss', { duration: 5000 });
        } else {
          this.snackBar.open('Failed to generate threat suggestions.', 'Dismiss', { duration: 5000 });
        }
      }
    });
  }

  useThreatSuggestion(suggestion: ThreatSuggestion): void {
    this.riskForm.patchValue({
      threatAgent: suggestion.threatAgent,
      threatVerb: suggestion.threatVerb,
      motivation: suggestion.motivation,
      isAutomaticRiskName: true
    });
    this.aiSuggestions.set([]);
    this.snackBar.open('Suggestion applied to the form.', 'Dismiss', { duration: 3000 });
  }

  getSelectedVulnId(event: Event): number {
    const select = event.target as HTMLSelectElement;
    const val = Number(select.value);
    select.value = '';
    return val;
  }
}