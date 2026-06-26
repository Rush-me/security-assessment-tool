import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { ProjectLayoutComponent } from './project-layout.component';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { AiStatusService } from '../../core/services/ai-status.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';

describe('ProjectLayoutComponent', () => {
  let component: ProjectLayoutComponent;
  let fixture: ComponentFixture<ProjectLayoutComponent>;
  let projectServiceMock: any;
  let authServiceMock: any;
  let aiServiceMock: any;
  let validationServiceMock: any;
  let routerMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  let navigationGrantedSubject: Subject<boolean>;
  let paramMapSubject: Subject<any>;

  const mockProject = { id: 123, projectName: 'Project Layout Spec' };

  beforeEach(async () => {
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const projSpy = jasmine.createSpyObj('ProjectService', ['getProject']);

    navigationGrantedSubject = new Subject<boolean>();
    paramMapSubject = new Subject<any>();

    validationServiceMock = {
      isSaving: signal<boolean>(false),
      navigationGranted$: navigationGrantedSubject.asObservable(),
      requestContinue: jasmine.createSpy('requestContinue')
    };

    projectServiceMock = {
      activeProject: signal<any>(mockProject),
      getProject: projSpy.getProject
    };
    projectServiceMock.getProject.and.returnValue(of(mockProject));

    authServiceMock = {
      currentUser: signal<any>({ username: 'layout.tester' }),
      logout: jasmine.createSpy('logout')
    };

    aiServiceMock = {
      aiState: signal<any>({ status: 'connected' }),
      statusMessage: signal<string>('AI system active'),
      check: jasmine.createSpy('check')
    };

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    Object.defineProperty(routerMock, 'url', { value: '/project/123/basic-info', writable: true });

    await TestBed.configureTestingModule({
      imports: [
        ProjectLayoutComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AiStatusService, useValue: aiServiceMock },
        { provide: WizardValidationService, useValue: validationServiceMock },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectLayoutComponent);
    component = fixture.componentInstance;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and load project from route params', () => {
    expect(component).toBeTruthy();
    paramMapSubject.next({ get: (key: string) => '123' });
    expect(component.projectId()).toEqual(123);
    expect(projectServiceMock.getProject).toHaveBeenCalledWith(123);
  });

  it('should handle navigation success inside wizard steps', () => {
    paramMapSubject.next({ get: (key: string) => '123' });
    component.goNext(); // Triggers continue request and stores pending step index 2 (context)

    expect(validationServiceMock.requestContinue).toHaveBeenCalled();

    navigationGrantedSubject.next(true); // Grant navigation
    expect(routerMock.navigate).toHaveBeenCalledWith(['/project', 123, 'context']);
  });

  it('should handle navigation block inside wizard steps', () => {
    paramMapSubject.next({ get: (key: string) => '123' });
    component.goNext();

    navigationGrantedSubject.next(false); // Reject navigation
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/project', 123, 'context']);
  });

  it('should navigate to dashboard on goBack from first step', () => {
    routerMock.url = '/project/123/basic-info';
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to previous step on goBack from middle step', () => {
    routerMock.url = '/project/123/context'; // Step 2
    paramMapSubject.next({ get: (key: string) => '123' });
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/project', 123, 'basic-info']);
  });

  it('should toggle theme correctly', () => {
    const isLight = component.currentTheme() === 'light';
    component.toggleTheme();
    expect(component.currentTheme()).toBe(isLight ? 'dark' : 'light');
  });

  it('should handle drawer operations', () => {
    expect(component.drawerOpen()).toBeFalse();
    component.openDrawer();
    expect(component.drawerOpen()).toBeTrue();
    component.closeDrawer();
    expect(component.drawerOpen()).toBeFalse();
  });

  it('should call aiService check on refresh', () => {
    component.refreshAiStatus();
    expect(aiServiceMock.check).toHaveBeenCalledWith(true);
  });

  it('should navigate to login on logout', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
