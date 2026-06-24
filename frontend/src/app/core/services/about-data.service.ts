import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutDataDialogComponent } from '../../shared/components/about-data-dialog/about-data-dialog.component';

@Injectable({ providedIn: 'root' })
export class AboutDataService {
  private dialog = inject(MatDialog);

  private readonly content: Record<string, { title: string; body: string }> = {
    'basic-info': {
      title: 'Basic Project Information',
      body: 'Enter the fundamental project details including project name, version, owning organization, and security classification. This information forms the identification header of your ISRA report and helps scope the assessment.'
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
    this.dialog.open(AboutDataDialogComponent, { width: '520px', data });
  }
}
