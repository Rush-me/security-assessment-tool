import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskService, Risk } from '../../core/services/risk.service';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { ProjectService } from '../../core/services/project.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

export interface SampleRiskRow {
  id: string;
  name: string;
  inherent: number;
  mitigated: number;
  residual: number;
  level: string;
  decision: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private riskService = inject(RiskService);
  private vulnService = inject(VulnerabilityService);
  private projectService = inject(ProjectService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  risks = signal<Risk[]>([]);
  vulnerabilities = signal<Vulnerability[]>([]);
  activeProject = this.projectService.activeProject;

  // ── Risk KPIs ─────────────────────────────────────────────────────────────
  totalRisks         = computed(() => this.risks().length);
  highAndCriticalCount = computed(() =>
    this.risks().filter(r => {
      const l = r.residualRiskLevel?.toLowerCase();
      return l === 'critical' || l === 'high';
    }).length
  );
  criticalCount   = computed(() => this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'critical').length);
  highCount       = computed(() => this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'high').length);
  mediumCount     = computed(() => this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'medium' || r.residualRiskLevel?.toLowerCase() === 'moderate').length);
  lowCount        = computed(() => this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'low').length);

  toMitigateCount = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Mitigate').length);
  mitigateCount   = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Mitigate').length);
  acceptCount     = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Accept').length);
  avoidCount      = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Avoid').length);
  transferCount   = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Transfer').length);

  avgInherentRisk = computed(() => {
    const scored = this.risks().filter(r => r.inherentRiskScore != null);
    if (!scored.length) return 0;
    return scored.reduce((sum, r) => sum + (r.inherentRiskScore || 0), 0) / scored.length;
  });
  avgResidualRisk = computed(() => {
    const scored = this.risks().filter(r => r.residualRiskScore != null);
    if (!scored.length) return 0;
    return scored.reduce((sum, r) => sum + (r.residualRiskScore || 0), 0) / scored.length;
  });
  riskReductionPct = computed(() => {
    const inh = this.avgInherentRisk(), res = this.avgResidualRisk();
    if (!inh) return 0;
    return Math.round(((inh - res) / inh) * 100);
  });

  topRisks = computed(() =>
    [...this.risks()].sort((a, b) => (b.residualRiskScore || 0) - (a.residualRiskScore || 0)).slice(0, 10)
  );

  // ── Rows to display: live data when available, sample otherwise ───────────
  tableRows = computed<SampleRiskRow[]>(() => {
    const live = this.risks();
    if (live.length) {
      return live.map(r => ({
        id: `R-${String(r.riskId || r.id || 0).padStart(2, '0')}`,
        name: r.riskName || `${r.threatAgent} ${r.threatVerb}`,
        inherent: r.inherentRiskScore || 0,
        mitigated: 0,
        residual: r.residualRiskScore || 0,
        level: r.residualRiskLevel || 'Low',
        decision: r.riskManagementDecision || 'Accept'
      }));
    }
    return this.sampleRows;
  });

  // ── Rows grouped by management decision for chart ─────────────────────────
  chartRows = computed<SampleRiskRow[]>(() =>
    [...this.tableRows()].sort((a, b) => b.residual - a.residual)
  );

  // ── Vulnerability KPIs ────────────────────────────────────────────────────
  totalVulns    = computed(() => this.vulnerabilities().length);

  // ── Static sample data (shown when no live data is loaded) ────────────────
  sampleRows: SampleRiskRow[] = [
    { id: 'R-07', name: 'Fraudulent transaction injection',              inherent: 0.88, mitigated: 0.28, residual: 0.63, level: 'High',     decision: 'Mitigate' },
    { id: 'R-01', name: 'Cardholder data exfiltration via compromised API', inherent: 0.92, mitigated: 0.30, residual: 0.58, level: 'High',  decision: 'Mitigate' },
    { id: 'R-04', name: 'Denial of service on gateway',                 inherent: 0.55, mitigated: 0.10, residual: 0.48, level: 'Moderate', decision: 'Accept'   },
    { id: 'R-05', name: 'Insider misuse of administrative access',       inherent: 0.70, mitigated: 0.30, residual: 0.41, level: 'Moderate', decision: 'Mitigate' },
    { id: 'R-03', name: 'Cryptographic key compromise',                  inherent: 0.85, mitigated: 0.25, residual: 0.38, level: 'Moderate', decision: 'Transfer' },
    { id: 'R-08', name: 'Vulnerable third-party dependency',             inherent: 0.50, mitigated: 0.15, residual: 0.34, level: 'Moderate', decision: 'Accept'   },
    { id: 'R-10', name: 'Session hijacking',                             inherent: 0.72, mitigated: 0.40, residual: 0.31, level: 'Moderate', decision: 'Mitigate' },
    { id: 'R-06', name: 'PII leakage through verbose logging',           inherent: 0.65, mitigated: 0.35, residual: 0.27, level: 'Moderate', decision: 'Mitigate' },
    { id: 'R-02', name: 'Man-in-the-middle on payment channel',          inherent: 0.80, mitigated: 0.20, residual: 0.22, level: 'Low',      decision: 'Mitigate' },
    { id: 'R-09', name: 'PCI-DSS regulatory non-compliance',             inherent: 0.60, mitigated: 0.38, residual: 0.21, level: 'Low',      decision: 'Transfer' }
  ];

  constructor() {}

  ngOnInit(): void {
    const proj = this.activeProject();
    if (!proj?.id) return;
    this.riskService.getRisks(proj.id).subscribe({
      next: r => this.risks.set(r),
      error: () => this.snackBar.open('Failed to load risk data.', 'Dismiss', { duration: 3000 })
    });
    this.vulnService.getVulnerabilities(proj.id).subscribe({
      next: v => this.vulnerabilities.set(v),
      error: () => {}
    });
  }

  getLevelClass(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high':     return 'high';
      case 'medium':
      case 'moderate': return 'moderate';
      case 'low':      return 'low';
      default:         return 'none';
    }
  }

  getDecisionClass(decision: string | undefined): string {
    switch (decision?.toLowerCase()) {
      case 'mitigate': return 'mitigate';
      case 'accept':   return 'accept';
      case 'transfer': return 'transfer';
      case 'avoid':    return 'avoid';
      default:         return 'accept';
    }
  }

  // ── Chart helpers ─────────────────────────────────────────────────────────

  /** Returns only rows belonging to the given management decision column. */
  getColumnRows(decision: string): SampleRiskRow[] {
    return this.chartRows().filter(r => r.decision === decision);
  }

  /** CSS bottom % for a dot based on its residual score (0-1 scale). */
  getDotBottom(score: number): string {
    // Clamp and convert to percentage of chart height (0.05 bottom margin so dots don't clip)
    const pct = Math.max(0, Math.min(1, score)) * 90 + 5;
    return `${pct}%`;
  }

  getDotColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high':     return '#f97316';
      case 'moderate':
      case 'medium':   return '#f59e0b';
      case 'low':      return '#22c55e';
      default:         return '#94a3b8';
    }
  }

  // ── Export: CSV ──────────────────────────────────────────────────────────
  exportCsv() {
    if (!this.risks().length) {
      this.snackBar.open('No risks to export.', 'Dismiss', { duration: 2000 });
      return;
    }
    const headers = ['Risk ID','Risk Name','Threat Agent','Threat Verb','Business Asset',
      'Supporting Asset','Inherent Score','Residual Score','Residual Level','Management Decision'];
    const rows = this.risks().map(r => [
      `R.${r.riskId}`,
      `"${(r.riskName || '').replace(/"/g, '""')}"`,
      r.threatAgent || '', r.threatVerb || '',
      r.businessAssetRef?.assetName || '', r.supportingAssetRef?.assetName || '',
      r.inherentRiskScore ?? '', r.residualRiskScore ?? '',
      r.residualRiskLevel || '', r.riskManagementDecision || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    this.downloadBlob(csv, 'text/csv', `ISRA_Risks_${this.activeProject()?.projectName || 'export'}.csv`);
  }

  // ── Export: JSON (full assessment) ──────────────────────────────────────
  exportJson() {
    const proj = this.activeProject();
    if (!proj) { this.snackBar.open('No active project.', 'Dismiss', { duration: 2000 }); return; }
    const payload = {
      ISRAmeta: {
        projectName: proj.projectName,
        projectVersion: proj.projectVersion,
        projectOrganization: proj.projectOrganization,
        classification: proj.classification,
        schemaVersion: proj.schemaVersion,
        iteration: proj.iteration,
        exportedAt: new Date().toISOString()
      },
      Risk: this.risks(),
      Vulnerability: this.vulnerabilities()
    };
    const json = JSON.stringify(payload, null, 2);
    this.downloadBlob(json, 'application/json', `ISRA_Assessment_${proj.projectName || 'export'}.json`);
  }

  // ── Export: Vulnerability CSV ────────────────────────────────────────────
  exportVulnCsv() {
    if (!this.vulnerabilities().length) {
      this.snackBar.open('No vulnerabilities to export.', 'Dismiss', { duration: 2000 }); return;
    }
    const headers = ['ID','Name','Family','CVE Score','Overall Score','Level','CVE ID'];
    const rows = this.vulnerabilities().map(v => [
      `V.${v.vulnerabilityId}`,
      `"${(v.vulnerabilityName || '').replace(/"/g, '""')}"`,
      v.vulnerabilityFamily || '', v.cveScore ?? '', (v as any).overallScore ?? '',
      v.overallLevel || '', v.cve || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    this.downloadBlob(csv, 'text/csv', `ISRA_Vulnerabilities_${this.activeProject()?.projectName || 'export'}.csv`);
  }

  onBack(): void {
    this.router.navigate(['../vulnerabilities'], { relativeTo: this.route });
  }

  onFinish(): void {
    this.snackBar.open(
      'Assessment complete. You can export your report above.',
      'Dismiss',
      { duration: 4000 }
    );
  }

  private downloadBlob(content: string, mimeType: string, filename: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
