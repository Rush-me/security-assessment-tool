import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProjectService, IsraProject } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  projects = signal<IsraProject[]>([]);
  showCreateForm = signal<boolean>(false);
  searchQuery = '';
  projectForm: FormGroup;
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

  classifications = ['Public', 'Internal Use Only', 'Restricted', 'Confidential', 'Secret'];
  displayedColumns = ['expand', 'project', 'department', 'risks', 'vulns', 'topRisk', 'status', 'updated', 'actions'];

  filteredProjects = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.projects();
    return this.projects().filter(p =>
      p.projectName.toLowerCase().includes(q) ||
      (p.projectOrganization || '').toLowerCase().includes(q)
    );
  });

  constructor() {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.minLength(3)]],
      projectVersion: ['1.0', [Validators.required]],
      projectOrganization: ['', [Validators.required]],
      classification: ['Confidential', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (projects) => this.projects.set(projects),
      error: () => this.snackBar.open('Failed to load projects.', 'Dismiss', { duration: 3000 })
    });
  }

  openProject(proj: IsraProject) {
    this.router.navigate(['/project', proj.id, 'context']);
  }

  onCreateProject() {
    if (this.projectForm.invalid) return;
    this.projectService.createProject(this.projectForm.value).subscribe({
      next: (newProj) => {
        this.showCreateForm.set(false);
        this.projectForm.reset({ projectVersion: '1.0', classification: 'Confidential' });
        this.loadProjects();
        this.router.navigate(['/project', newProj.id, 'context']);
      },
      error: (err) => this.snackBar.open(err.error || 'Failed to create project.', 'Dismiss', { duration: 4000 })
    });
  }

  onDeleteProject(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this assessment? This cannot be undone.')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => { this.snackBar.open('Project deleted.', 'Dismiss', { duration: 3000 }); this.loadProjects(); },
        error: () => this.snackBar.open('Failed to delete project.', 'Dismiss', { duration: 3000 })
      });
    }
  }

  getTopRiskLevel(proj: IsraProject): string {
    const risks = proj.risks || [];
    if (!risks.length) return 'none';
    const max = Math.max(...risks.map((r: any) => r.residualRiskScore || r.inherentRiskScore || 0));
    if (max >= 0.7) return 'critical';
    if (max >= 0.5) return 'high';
    if (max >= 0.3) return 'moderate';
    return 'low';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
