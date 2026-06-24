import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { ProjectService, IsraProject } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let authServiceMock: any;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockUser = { username: 'alice.smith', email: 'alice@test.com' };
  const mockProjects: IsraProject[] = [
    {
      id: 1,
      projectName: 'Alpha System',
      projectVersion: '1.0',
      projectOrganization: 'Thales',
      classification: 'Confidential',
      risks: [
        { id: 1, riskName: 'XSS', residualRiskScore: 0.8 },
        { id: 2, riskName: 'SQLi', residualRiskScore: 0.4 }
      ]
    },
    {
      id: 2,
      projectName: 'Beta Platform',
      projectVersion: '2.0',
      projectOrganization: 'Defense',
      classification: 'Secret',
      risks: []
    }
  ];

  beforeEach(async () => {
    const projSpy = jasmine.createSpyObj('ProjectService', ['getProjects', 'createProject', 'deleteProject']);
    const rotSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    authServiceMock = {
      currentUser: signal<any>(mockUser),
      logout: jasmine.createSpy('logout')
    };

    projSpy.getProjects.and.returnValue(of(mockProjects));
    projSpy.createProject.and.returnValue(of(mockProjects[0]));
    projSpy.deleteProject.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        { provide: ProjectService, useValue: projSpy },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: rotSpy },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).overrideComponent(DashboardComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useValue: snackSpy }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    projectServiceSpy = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and load projects on init', () => {
    expect(component).toBeTruthy();
    expect(projectServiceSpy.getProjects).toHaveBeenCalled();
    expect(component.projects()).toEqual(mockProjects);
  });

  it('should filter projects based on search query', () => {
    component.searchQuery = 'beta';
    component.projects.set([...mockProjects]);
    fixture.detectChanges();
    const filtered = component.filteredProjects();
    expect(filtered.length).toBe(1);
    expect(filtered[0].projectName).toBe('Beta Platform');

    component.searchQuery = '';
    component.projects.set([...mockProjects]);
    expect(component.filteredProjects().length).toBe(2);
  });

  it('should calculate user initials', () => {
    expect(component.getUserInitials()).toBe('AS');

    authServiceMock.currentUser.set({ username: 'bob' });
    expect(component.getUserInitials()).toBe('BO');

    authServiceMock.currentUser.set(null);
    expect(component.getUserInitials()).toBe('U');
  });

  it('should toggle theme and store it in localStorage', () => {
    const initialTheme = component.currentTheme();
    component.toggleTheme();
    const expected = initialTheme === 'light' ? 'dark' : 'light';
    expect(component.currentTheme()).toBe(expected);
    expect(localStorage.getItem('isra-theme')).toBe(expected);
  });

  it('should open project and navigate to wizard', () => {
    component.openProject(mockProjects[0]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/project', 1, 'context']);
  });

  it('should create project when form is valid', () => {
    component.showCreateForm.set(true);
    component.projectForm.patchValue({
      projectName: 'Gamma Service',
      projectVersion: '1.0',
      projectOrganization: 'Space',
      classification: 'Secret'
    });

    component.onCreateProject();

    expect(projectServiceSpy.createProject).toHaveBeenCalledWith(jasmine.objectContaining({
      projectName: 'Gamma Service'
    }));
    expect(component.showCreateForm()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/project', 1, 'context']);
  });

  it('should not create project if form is invalid', () => {
    component.projectForm.patchValue({ projectName: '' });
    component.onCreateProject();
    expect(projectServiceSpy.createProject).not.toHaveBeenCalled();
  });

  it('should delete project on confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);

    component.onDeleteProject(1, mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(projectServiceSpy.deleteProject).toHaveBeenCalledWith(1);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Project deleted.', 'Dismiss', jasmine.any(Object));
  });

  it('should calculate top risk level correctly', () => {
    expect(component.getTopRiskLevel(mockProjects[0])).toBe('critical'); // Max is 0.8 which is >= 0.7
    expect(component.getTopRiskLevel(mockProjects[1])).toBe('none'); // No risks
  });

  it('should close popup on outside document click', () => {
    component.showUserPopup.set(true);
    const mockClickEvent = {
      target: document.createElement('div')
    } as any;
    component.onDocumentClick(mockClickEvent);
    expect(component.showUserPopup()).toBeFalse();
  });

  it('should close popup on Escape key', () => {
    component.showUserPopup.set(true);
    component.onEscape();
    expect(component.showUserPopup()).toBeFalse();
  });

  it('should logout and redirect', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
