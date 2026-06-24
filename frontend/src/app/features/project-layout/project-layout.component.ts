import {
  Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute, Router, RouterOutlet, RouterLink, RouterLinkActive
} from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { AiStatusService } from '../../core/services/ai-status.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface WizardStep {
  index: number;
  label: string;
  path: string;
  drawerTitle: string;
  drawerStepLabel: string;
  drawerIntro: string;
  drawerSections: { title: string; body: string }[];
}

@Component({
  selector: 'app-project-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './project-layout.component.html',
  styleUrls: ['./project-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectLayoutComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private aiService = inject(AiStatusService);
  private validationService = inject(WizardValidationService);
  private snackBar = inject(MatSnackBar);

  /** Reflects save-in-progress state of the active child component. */
  isSaving = this.validationService.isSaving;

  private _subs = new Subscription();
  private _pendingNextStep: WizardStep | null = null;

  projectId = signal<number | null>(null);
  activeProject = this.projectService.activeProject;
  isLoading = signal<boolean>(true);
  drawerOpen = signal<boolean>(false);

  aiState = this.aiService.aiState;
  aiStatusMessage = this.aiService.statusMessage;
  currentUser = this.authService.currentUser;

  showUserPopup = signal<boolean>(false);
  currentTheme = signal<string>(localStorage.getItem('isra-theme') || 'light');

  toggleTheme() {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
    localStorage.setItem('isra-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  toggleUserPopup(event: Event) {
    event.stopPropagation();
    this.showUserPopup.update(val => !val);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-avatar-wrapper')) {
      this.showUserPopup.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.showUserPopup.set(false);
  }

  steps: WizardStep[] = [
    {
      index: 1, label: 'Basic Info', path: 'basic-info',
      drawerTitle: 'Basic information',
      drawerStepLabel: 'STEP 01 · WHAT THIS COLLECTS',
      drawerIntro: 'Core project metadata — name, version, organization, and classification — used to identify and label the assessment.',
      drawerSections: [
        { title: 'Project name & version', body: 'The official project name and version number that this security assessment covers.' },
        { title: 'Organization', body: 'The business unit or team responsible for the project.' },
        { title: 'Classification', body: 'The security classification of this assessment document (e.g. Confidential, Restricted).' }
      ]
    },
    {
      index: 2, label: 'Project Context', path: 'context',
      drawerTitle: 'Project context',
      drawerStepLabel: 'STEP 02 · WHAT THIS COLLECTS',
      drawerIntro: 'Captures what the project does and the security outcomes it must achieve — the basis for identifying assets, risks and vulnerabilities.',
      drawerSections: [
        { title: 'Project description', body: 'Functional and technical overview. Can be typed, linked by URL, or uploaded as a document.' },
        { title: 'Reference URL / document', body: 'Source material the assessment draws on (design wiki, spec, architecture doc).' },
        { title: 'Security project objectives', body: 'The security goals from the product / project manager\'s perspective — what "good" looks like.' }
      ]
    },
    {
      index: 3, label: 'Business Assets', path: 'business-assets',
      drawerTitle: 'Business assets',
      drawerStepLabel: 'STEP 02 · WHAT THIS COLLECTS',
      drawerIntro: 'Business assets are the things of value the project must protect — data, services, and processes central to business operations.',
      drawerSections: [
        { title: 'Asset name & type', body: 'What the asset is and its category (Data, Service, Process, etc.).' },
        { title: 'Security ratings', body: 'Rate each security property: Confidentiality (C), Integrity (I), Availability (A), Authenticity (Au), Authorization (Az), Non-Repudiation (Nr) on a scale: None, Low, Moderate, High.' },
        { title: 'Description', body: 'Brief context — what this asset is and why it is important to protect.' }
      ]
    },
    {
      index: 4, label: 'Supporting Assets', path: 'supporting-assets',
      drawerTitle: 'Supporting assets',
      drawerStepLabel: 'STEP 04 · WHAT THIS COLLECTS',
      drawerIntro: 'Supporting assets are the technical components that host or process the business assets — servers, databases, APIs, networks.',
      drawerSections: [
        { title: 'Architecture diagram', body: 'Upload or describe how the supporting assets interconnect.' },
        { title: 'Asset list', body: 'Individual technical components with their type and security level.' }
      ]
    },
    {
      index: 5, label: 'Risks', path: 'risks',
      drawerTitle: 'Identified risks',
      drawerStepLabel: 'STEP 05 · WHAT THIS COLLECTS',
      drawerIntro: 'Risks represent realistic attack scenarios combining a threat agent, verb, and target. Each risk is scored for inherent, mitigated, and residual impact.',
      drawerSections: [
        { title: 'Risk title & description', body: 'A clear scenario describing the attack path and potential impact.' },
        { title: 'Risk scores', body: 'Inherent (before controls), Mitigation, and Residual (after controls) scores from 0–1.' },
        { title: 'Management decision', body: 'Accept, Transfer, or Mitigate — the chosen response to the residual risk.' }
      ]
    },
    {
      index: 6, label: 'Vulnerabilities', path: 'vulnerabilities',
      drawerTitle: 'Identified vulnerabilities',
      drawerStepLabel: 'STEP 06 · WHAT THIS COLLECTS',
      drawerIntro: 'Vulnerabilities are weaknesses in the supporting assets that could be exploited to realise a risk.',
      drawerSections: [
        { title: 'Vulnerability title', body: 'A concise description of the weakness.' },
        { title: 'Vulnerability family', body: 'The category of weakness (e.g. Injection, Authentication, Configuration).' },
        { title: 'Defect ID', body: 'Link to a defect tracking ticket if available.' }
      ]
    },
    {
      index: 7, label: 'ISRA Report', path: 'reports',
      drawerTitle: 'ISRA Report',
      drawerStepLabel: 'STEP 07 · SUMMARY',
      drawerIntro: 'The final security risk assessment report summarising all identified risks, their scores, and management decisions.',
      drawerSections: [
        { title: 'Risk chart', body: 'Visual scatter plot of residual risk scores by management decision.' },
        { title: 'Risk register', body: 'Tabular view of all risks with inherent, mitigated, and residual scores.' }
      ]
    }
  ];

  activeStepIndex = signal<number>(0);

  activeStep = computed(() => this.steps[this.activeStepIndex()]);

  constructor() {}

  ngOnInit(): void {
    this._subs.add(
      this.validationService.navigationGranted$.subscribe(canNavigate => {
        if (canNavigate && this._pendingNextStep) {
          this.navigateToStep(this._pendingNextStep);
          this._pendingNextStep = null;
        } else if (!canNavigate) {
          this._pendingNextStep = null;
        }
      })
    );

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('projectId');
      if (idStr) {
        const id = parseInt(idStr, 10);
        this.projectId.set(id);
        this.loadProjectDetails(id);
      }
    });
  }

  loadProjectDetails(id: number) {
    this.isLoading.set(true);
    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.projectService.activeProject.set(project);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      }
    });
  }

  navigateToStep(step: WizardStep) {
    const id = this.projectId();
    if (!id) return;
    this.activeStepIndex.set(step.index - 1);
    this.router.navigate(['/project', id, step.path]);
  }

  isStepActive(step: WizardStep): boolean {
    const url = this.router.url;
    return url.includes(step.path);
  }

  isStepCompleted(step: WizardStep): boolean {
    return step.index < this.getActiveStepNumber();
  }

  getActiveStepNumber(): number {
    const url = this.router.url;
    const found = this.steps.find(s => url.includes(s.path));
    return found ? found.index : 1;
  }

  goBack() {
    const current = this.getActiveStepNumber();
    if (current <= 1) {
      this.router.navigate(['/']);
      return;
    }
    const prev = this.steps[current - 2];
    this.navigateToStep(prev);
  }

  goNext() {
    const current = this.getActiveStepNumber();
    if (current >= this.steps.length) {
      // Last step — Finish
      this.snackBar.open(
        'Assessment complete. You can export your report above.',
        'Dismiss',
        { duration: 4000 }
      );
      return;
    }
    const next = this.steps[current];
    this._pendingNextStep = next;
    // Ask the active child component to validate and save itself.
    // Child calls validationService.reportResult(bool) → navigationGranted$ fires.
    this.validationService.requestContinue();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  openDrawer() {
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  goToDashboard() {
    this.router.navigate(['/']);
  }

  refreshAiStatus() {
    this.aiService.check(true);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    const name = user.username || '';
    if (!name) return 'U';
    const parts = name.split(/[\s._-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLastStep(): boolean {
    return this.getActiveStepNumber() === this.steps.length;
  }
}
