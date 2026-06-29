import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskService, Risk } from '../../core/services/risk.service';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { ProjectService } from '../../core/services/project.service';
import { AboutDataService } from '../../core/services/about-data.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

export interface RiskRow {
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
    MatDividerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private riskService      = inject(RiskService);
  private vulnService      = inject(VulnerabilityService);
  private projectService   = inject(ProjectService);
  private aboutDataService = inject(AboutDataService);
  private snackBar         = inject(MatSnackBar);
  private router           = inject(Router);
  private route            = inject(ActivatedRoute);
  yAxisTicks = Array.from({ length: 15 }, (_, i) => 15 - i);

  risks           = signal<Risk[]>([]);
  vulnerabilities = signal<Vulnerability[]>([]);
  activeProject   = this.projectService.activeProject;

  // ── Risk KPIs ──────────────────────────────────────────────────────────────
  totalRisks = computed(() => this.risks().length);

  highAndCriticalCount = computed(() =>
    this.risks().filter(r => {
      const l = r.residualRiskLevel?.toLowerCase();
      return l === 'critical' || l === 'high';
    }).length
  );

  criticalCount = computed(() =>
    this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'critical').length
  );
  highCount = computed(() =>
    this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'high').length
  );
  mediumCount = computed(() =>
    this.risks().filter(r => {
      const l = r.residualRiskLevel?.toLowerCase();
      return l === 'medium' || l === 'moderate';
    }).length
  );
  lowCount = computed(() =>
    this.risks().filter(r => r.residualRiskLevel?.toLowerCase() === 'low').length
  );

  mitigateCount  = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Mitigate').length);
  acceptCount    = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Accept').length);
  avoidCount     = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Avoid').length);
  transferCount  = computed(() => this.risks().filter(r => r.riskManagementDecision === 'Transfer').length);

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
    [...this.risks()]
      .sort((a, b) => (b.residualRiskScore || 0) - (a.residualRiskScore || 0))
      .slice(0, 10)
  );

  // ── Risk table rows — live data only ──────────────────────────────────────
  tableRows = computed<RiskRow[]>(() =>
    this.risks().map(r => ({
      id:       `R-${String(r.riskId || r.id || 0).padStart(2, '0')}`,
      name:     r.riskName || `${r.threatAgent} ${r.threatVerb}`,
      inherent: r.inherentRiskScore || 0,
      mitigated: r.mitigatedRiskScore || 0,
      residual:  r.residualRiskScore || 0,
      level:     r.residualRiskLevel || '',
      decision:  r.riskManagementDecision || ''
    }))
  );

  // ── Chart rows sorted by residual descending ───────────────────────────────
  chartRows = computed<RiskRow[]>(() =>
    [...this.tableRows()].sort((a, b) => b.residual - a.residual)
  );

  // ── Vulnerability KPIs ────────────────────────────────────────────────────
  totalVulns = computed(() => this.vulnerabilities().length);

  // ── Vulnerability table rows — live data only ─────────────────────────────
  vulnRows = computed(() =>
    this.vulnerabilities().map(v => ({
      id:       v.id,
      name:     v.vulnerabilityName,
      cve:      v.cve || '',
      family:   v.vulnerabilityFamily || '',
      cvss:     v.cveScore || 0,
      severity: v.overallLevel || '',
      status:   v.trackingId || 'Open',
      assets:   (v.supportingAssets || []).map((a: any) => a.assetName).join(', ')
    }))
  );

  constructor() {}

  ngOnInit(): void {
    const proj = this.activeProject();
    if (!proj?.id) return;

    this.riskService.getRisks(proj.id).subscribe({
      next:  r => this.risks.set(r),
      error: () => this.snackBar.open('Failed to load risk data.', 'Dismiss', { duration: 3000 })
    });

    this.vulnService.getVulnerabilities(proj.id).subscribe({
      next:  v => this.vulnerabilities.set(v),
      error: () => this.snackBar.open('Failed to load vulnerability data.', 'Dismiss', { duration: 3000 })
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

  // ── Chart helpers ──────────────────────────────────────────────────────────

  getColumnRows(decision: string): RiskRow[] {
    return this.chartRows().filter(r => r.decision === decision);
  }

 getDotBottom(score: number): string {
  const min = 1;
  const max = 15;

  const normalized = (score - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));

  const pct = clamped * 90 + 5;
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

  // ── Export: CSV ───────────────────────────────────────────────────────────
  exportCsv(): void {
    if (!this.risks().length) {
      this.snackBar.open('No risks to export.', 'Dismiss', { duration: 2000 });
      return;
    }
    const headers = ['Risk ID', 'Risk Name', 'Threat Agent', 'Threat Verb', 'Business Asset',
      'Supporting Asset', 'Inherent Score', 'Residual Score', 'Residual Level', 'Management Decision'];
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

  // ── Export: JSON (full assessment) ───────────────────────────────────────
  exportJson(): void {
    const proj = this.activeProject();
    if (!proj) { this.snackBar.open('No active project.', 'Dismiss', { duration: 2000 }); return; }
    const payload = {
      ISRAmeta: {
        projectName:          proj.projectName,
        projectVersion:       proj.projectVersion,
        projectOrganization:  proj.projectOrganization,
        classification:       proj.classification,
        schemaVersion:        proj.schemaVersion,
        iteration:            proj.iteration,
        exportedAt:           new Date().toISOString()
      },
      Risk:          this.risks(),
      Vulnerability: this.vulnerabilities()
    };
    const json = JSON.stringify(payload, null, 2);
    this.downloadBlob(json, 'application/json', `ISRA_Assessment_${proj.projectName || 'export'}.json`);
  }

  // ── Export: Vulnerability CSV ─────────────────────────────────────────────
  exportVulnCsv(): void {
    if (!this.vulnerabilities().length) {
      this.snackBar.open('No vulnerabilities to export.', 'Dismiss', { duration: 2000 });
      return;
    }
    const headers = ['ID', 'Name', 'Family', 'CVE Score', 'Overall Score', 'Level', 'CVE ID'];
    const rows = this.vulnerabilities().map(v => [
      `V.${v.vulnerabilityId}`,
      `"${(v.vulnerabilityName || '').replace(/"/g, '""')}"`,
      v.vulnerabilityFamily || '', v.cveScore ?? '', (v as any).overallScore ?? '',
      v.overallLevel || '', v.cve || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    this.downloadBlob(csv, 'text/csv', `ISRA_Vulnerabilities_${this.activeProject()?.projectName || 'export'}.csv`);
  }

  // ── About This Data ───────────────────────────────────────────────────────
  openAbout(): void {
    this.aboutDataService.open('reports');
  }

  // ── Export: PDF ───────────────────────────────────────────────────────────
  async exportPdf(): Promise<void> {
    const proj = this.activeProject();
    if (!proj) { this.snackBar.open('No active project.', 'Dismiss', { duration: 2000 }); return; }
    try {
      const { jsPDF }   = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = 297;

      // Cover page
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, H, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(30);
      doc.setFont('helvetica', 'bold');
      doc.text(proj.projectName || 'Security Assessment', W / 2, 90, { align: 'center' });
      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Version ${proj.projectVersion || '1.0'}`, W / 2, 104, { align: 'center' });
      doc.text(
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        W / 2, 113, { align: 'center' }
      );
      if (proj.classification) {
        doc.text(proj.classification.toUpperCase(), W / 2, 122, { align: 'center' });
      }

      // KPI boxes
      const kpis = [
        { label: 'TOTAL RISKS',     value: String(this.totalRisks()) },
        { label: 'HIGH / CRITICAL', value: String(this.highAndCriticalCount()) },
        { label: 'AVG RESIDUAL',    value: this.avgResidualRisk().toFixed(2) },
        { label: 'TO MITIGATE',     value: String(this.mitigateCount()) }
      ];
      const boxW = 40, boxH = 28, startX = 15, startY = 155, gap = 5;
      kpis.forEach((kpi, i) => {
        const x = startX + i * (boxW + gap);
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(x, startY, boxW, boxH, 3, 3, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.label, x + boxW / 2, startY + 8, { align: 'center' });
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text(kpi.value, x + boxW / 2, startY + 21, { align: 'center' });
      });

      // Screenshot pages
      const el = document.querySelector('.reports-container') as HTMLElement | null;
      if (el) {
        const canvas  = await html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgW    = W;
        const imgH    = (canvas.height / canvas.width) * imgW;
        const pages   = Math.ceil(imgH / H);
        for (let i = 0; i < pages; i++) {
          doc.addPage();
          doc.addImage(imgData, 'JPEG', 0, -(i * H), imgW, imgH);
        }
      }
      doc.save(`ISRA_${proj.projectName || 'Report'}_Report.pdf`);
    } catch {
      this.snackBar.open('Export failed. Please try again.', 'Dismiss', { duration: 4000 });
    }
  }

  // ── Export: Word (.docx) ──────────────────────────────────────────────────
  async exportWord(): Promise<void> {
    const proj = this.activeProject();
    if (!proj) { this.snackBar.open('No active project.', 'Dismiss', { duration: 2000 }); return; }
    try {
      const {
        Document, Packer, Paragraph, Table, TableRow, TableCell,
        TextRun, HeadingLevel, WidthType
      } = await import('docx');

      const hCell = (text: string) =>
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })] });
      const dCell = (text: string) =>
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text })] })] });

      const riskHeaderRow = new TableRow({
        children: ['Risk', 'ID', 'Inherent', 'Mitigated', 'Residual', 'Level', 'Decision'].map(hCell)
      });
      const riskDataRows = this.tableRows().map(r => new TableRow({
        children: [
          dCell(r.name), dCell(r.id),
          dCell(r.inherent.toFixed(2)), dCell(r.mitigated.toFixed(2)), dCell(r.residual.toFixed(2)),
          dCell(r.level), dCell(r.decision)
        ]
      }));

      const vulnHeaderRow = new TableRow({
        children: ['Vulnerability', 'CVE', 'Family', 'CVSS', 'Severity', 'Status', 'Assets'].map(hCell)
      });
      const vulnDataRows = this.vulnRows().map(v => new TableRow({
        children: [
          dCell(v.name), dCell(v.cve), dCell(v.family),
          dCell(v.cvss.toFixed(1)), dCell(v.severity), dCell(v.status), dCell(v.assets)
        ]
      }));

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: proj.projectName || 'Security Assessment', heading: HeadingLevel.TITLE }),
            new Paragraph({
              children: [new TextRun(
                `${proj.projectVersion || ''} | ${new Date().toLocaleDateString()} | ${proj.classification || ''}`
              )]
            }),
            new Paragraph({ text: 'Executive Summary', heading: HeadingLevel.HEADING_1 }),
            new Paragraph({
              children: [new TextRun(
                `Total Risks: ${this.totalRisks()}  |  High/Critical: ${this.highAndCriticalCount()}  |  ` +
                `Avg Residual: ${this.avgResidualRisk().toFixed(2)}  |  To Mitigate: ${this.mitigateCount()}`
              )]
            }),
            new Paragraph({ text: 'Risk Register', heading: HeadingLevel.HEADING_1 }),
            new Table({ rows: [riskHeaderRow, ...riskDataRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
            new Paragraph({ text: 'Vulnerability Register', heading: HeadingLevel.HEADING_1 }),
            new Table({ rows: [vulnHeaderRow, ...vulnDataRows], width: { size: 100, type: WidthType.PERCENTAGE } })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `ISRA_${proj.projectName || 'Report'}_Report.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      this.snackBar.open('Export failed. Please try again.', 'Dismiss', { duration: 4000 });
    }
  }

  // ── Export: HTML ──────────────────────────────────────────────────────────
  exportHtml(): void {
    const proj = this.activeProject();
    if (!proj) { this.snackBar.open('No active project.', 'Dismiss', { duration: 2000 }); return; }
    try {
      const levelColors: Record<string, { bg: string; color: string }> = {
        'Critical': { bg: '#fde8e8', color: '#c81e1e' },
        'High':     { bg: '#fdf0d5', color: '#8e4b10' },
        'Moderate': { bg: '#fef3cd', color: '#92610a' },
        'Medium':   { bg: '#fef3cd', color: '#92610a' },
        'Low':      { bg: '#d1fae5', color: '#065f46' }
      };
      const decisionColors: Record<string, { bg: string; color: string }> = {
        'Mitigate': { bg: '#d1fae5', color: '#065f46' },
        'Accept':   { bg: '#e0f2fe', color: '#0369a1' },
        'Transfer': { bg: '#ede9fe', color: '#5b21b6' },
        'Avoid':    { bg: '#fef3cd', color: '#92610a' }
      };
      const pill = (text: string, map: Record<string, { bg: string; color: string }>): string => {
        const c = map[text] ?? { bg: '#f1f5f9', color: '#64748b' };
        return `<span style="display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:500;background:${c.bg};color:${c.color}">${text}</span>`;
      };

      const kpiHtml = [
        { label: 'TOTAL RISKS',     value: String(this.totalRisks()),           color: '#1a56db' },
        { label: 'HIGH / CRITICAL', value: String(this.highAndCriticalCount()), color: '#c81e1e' },
        { label: 'AVG RESIDUAL',    value: this.avgResidualRisk().toFixed(2),   color: '#065f46' },
        { label: 'TO MITIGATE',     value: String(this.mitigateCount()),         color: '#1a56db' }
      ].map(k => `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;flex:1">
        <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin-bottom:8px">${k.label}</div>
        <div style="font-size:28px;font-weight:700;color:${k.color}">${k.value}</div>
      </div>`).join('');

      const riskTableRows = this.tableRows().map(r => `<tr>
        <td style="padding:10px 14px"><strong style="color:#1a56db;font-size:13px">${r.name}</strong><br><small style="color:#94a3b8">${r.id}</small></td>
        <td style="padding:10px 14px;text-align:center;font-size:13px">${r.inherent.toFixed(2)}</td>
        <td style="padding:10px 14px;text-align:center;font-size:13px;color:#94a3b8">${r.mitigated.toFixed(2)}</td>
        <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:700">${r.residual.toFixed(2)}</td>
        <td style="padding:10px 14px;text-align:center">${pill(r.level, levelColors)}</td>
        <td style="padding:10px 14px;text-align:center">${pill(r.decision, decisionColors)}</td>
      </tr>`).join('');

      const vulnTableRows = this.vulnRows().map(v => `<tr>
        <td style="padding:10px 14px;font-size:13px">${v.name}</td>
        <td style="padding:10px 14px;text-align:center;font-size:12px;color:#64748b">${v.cve || '—'}</td>
        <td style="padding:10px 14px;font-size:12px">${v.family}</td>
        <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:600">${v.cvss.toFixed(1)}</td>
        <td style="padding:10px 14px;text-align:center">${pill(v.severity, levelColors)}</td>
        <td style="padding:10px 14px;text-align:center;font-size:12px">${v.status}</td>
        <td style="padding:10px 14px;font-size:12px;color:#64748b">${v.assets}</td>
      </tr>`).join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ISRA Report — ${proj.projectName || 'Assessment'}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b}
    table{width:100%;border-collapse:collapse}
    th{background:#f8fafc;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;padding:10px 14px;text-align:left;border-bottom:1px solid #e2e8f0}
    tr:not(:last-child) td{border-bottom:1px solid #f1f5f9}
    tr:hover td{background:#f8fafc}
  </style>
</head>
<body>
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:#fff;padding:60px 40px;margin-bottom:32px">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:16px">Information Security Risk Assessment</div>
    <h1 style="font-size:36px;font-weight:700;margin-bottom:12px">${proj.projectName || 'Security Assessment'}</h1>
    <div style="color:#94a3b8;font-size:14px">Version ${proj.projectVersion || '1.0'} &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; ${proj.classification || ''}</div>
  </div>
  <div style="padding:0 40px 40px">
    <div style="display:flex;gap:14px;margin-bottom:32px">${kpiHtml}</div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px">
      <div style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0">Detailed Risk Register</div>
      <table>
        <thead><tr>
          <th style="width:40%">RISK DESCRIPTION</th>
          <th style="text-align:center">INHERENT</th><th style="text-align:center">MITIGATED</th>
          <th style="text-align:center">RESIDUAL</th><th style="text-align:center">RISK LEVEL</th>
          <th style="text-align:center">DECISION</th>
        </tr></thead>
        <tbody>${riskTableRows || '<tr><td colspan="6" style="padding:20px;text-align:center;color:#94a3b8">No risks recorded.</td></tr>'}</tbody>
      </table>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0">Vulnerability Register</div>
      <table>
        <thead><tr>
          <th>VULNERABILITY</th><th style="text-align:center">CVE</th><th>FAMILY</th>
          <th style="text-align:center">CVSS</th><th style="text-align:center">SEVERITY</th>
          <th style="text-align:center">STATUS</th><th>ASSETS</th>
        </tr></thead>
        <tbody>${vulnTableRows || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#94a3b8">No vulnerabilities recorded.</td></tr>'}</tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
      this.downloadBlob(html, 'text/html', `ISRA_${proj.projectName || 'Report'}_Report.html`);
    } catch {
      this.snackBar.open('Export failed. Please try again.', 'Dismiss', { duration: 4000 });
    }
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

  private downloadBlob(content: string, mimeType: string, filename: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}