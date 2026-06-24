import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutDataDialogComponent } from '../../shared/components/about-data-dialog/about-data-dialog.component';

@Injectable({ providedIn: 'root' })
export class AboutDataService {
  private dialog = inject(MatDialog);

  private readonly content: Record<string, { title: string; body: string; showDiagram?: boolean }> = {
    'basic-info': {
      title: 'ISRA Methodology — Purpose & Data Flow',
      body: 'Risk is a combination of five dimensions: Business Assets, Supporting Assets, Vulnerabilities, Threats, and Threat Agents. Each dimension must be evaluated to compute the overall risk level per ISO/IEC 27005:2022.',
      showDiagram: true
    },
    'project-context': {
      title: 'Project Context',
      body: "Describe the business context, project URL, and security objectives. Capture the security officer's objectives, project-level security goals, and key assumptions that frame the overall risk assessment."
    },
    'business-assets': {
      title: 'Business Assets',
      body: 'Business assets are the valuable resources requiring protection — data, services, processes, or functions. Define their CIA ratings (Confidentiality, Integrity, Availability, Authenticity, Authorization, Non-Repudiation) to drive risk impact calculations per ISO 27005.'
    },
    'supporting-assets': {
      title: 'Supporting Assets',
      body: 'Supporting assets are the technical components (systems, hardware, software) that host or process business assets. Link them to business assets to establish the attack surface for risk modelling.'
    },
    'vulnerabilities': {
      title: 'Vulnerabilities',
      body: 'Document known weaknesses in supporting assets. Each vulnerability carries a CVSS score that feeds directly into attack path scoring and inherent risk calculations across all linked risk scenarios.'
    },
    'risks': {
      title: 'Risk Scenarios',
      body: 'Model threat scenarios by combining a threat agent, verb, and target asset. Link attack paths (chains of vulnerabilities) and security controls (mitigations) to compute inherent, mitigated, and residual risk scores per ISO 27005.'
    },
    'reports': {
      title: 'ISRA Report',
      body: 'The final risk assessment report aggregates all project data into executive KPIs, a risk scatter chart, and detailed risk and vulnerability registers. Export in PDF, Word, HTML, CSV, or JSON formats for stakeholder distribution.'
    }
  };

  open(page: string): void {
    const data = this.content[page] ?? { title: 'About', body: '' };
    const width = data.showDiagram ? '820px' : '520px';
    this.dialog.open(AboutDataDialogComponent, { width, maxWidth: '95vw', data });
  }
}
