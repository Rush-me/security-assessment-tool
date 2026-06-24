import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';
import { ProjectContextComponent } from './project-context.component';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';

describe('ProjectContextComponent', () => {
  let component: ProjectContextComponent;
  let fixture: ComponentFixture<ProjectContextComponent>;
  let projectServiceMock: any;
  let validationServiceMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let continueClickedSubject: Subject<void>;
  let queryParamsSubject: Subject<any>;

  const mockProject = {
    id: 1,
    projectName: 'Enterprise Security Portal',
    projectVersion: '1.2.3',
    projectOrganization: 'Cyber Security Unit',
    projectContext: {
      projectDescription: 'Core perimeter defense systems',
      projectUrl: 'https://security.example.com',
      securityProjectObjectives: 'To guard outer gateways',
      securityOfficerObjectives: 'Minimize false negatives',
      securityAssumptions: 'Incoming requests are untrusted',
      projectDescriptionAttachmentPath: '/var/attachments/secure_context_file.pdf'
    }
  };

  beforeEach(async () => {
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    continueClickedSubject = new Subject<void>();
    queryParamsSubject = new Subject<any>();

    validationServiceMock = {
      continueClicked$: continueClickedSubject.asObservable(),
      reportResult: jasmine.createSpy('reportResult'),
      isSaving: signal<boolean>(false)
    };

    projectServiceMock = {
      activeProject: signal<any>(mockProject),
      updateProject: jasmine.createSpy('updateProject').and.returnValue(of(mockProject)),
      updateProjectContext: jasmine.createSpy('updateProjectContext').and.returnValue(of(mockProject)),
      uploadContextAttachment: jasmine.createSpy('uploadContextAttachment').and.returnValue(of(mockProject)),
      downloadContextAttachment: jasmine.createSpy('downloadContextAttachment').and.returnValue(of(new Blob(['hello'], { type: 'application/pdf' })))
    };

    await TestBed.configureTestingModule({
      imports: [
        ProjectContextComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: WizardValidationService, useValue: validationServiceMock },
        { provide: MatSnackBar, useValue: snackSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ]
    }).overrideComponent(ProjectContextComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useValue: snackSpy }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectContextComponent);
    component = fixture.componentInstance;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and patch form with active project values', () => {
    expect(component).toBeTruthy();
    expect(component.contextForm.get('projectName')?.value).toBe('Enterprise Security Portal');
    expect(component.contextForm.get('projectDescription')?.value).toBe('Core perimeter defense systems');
    expect(component.contextForm.get('projectUrl')?.value).toBe('https://security.example.com');
  });

  it('should read step from query parameters', () => {
    queryParamsSubject.next({ step: '3' });
    expect(component.currentStep()).toBe(3);
  });

  it('should mark all fields touched and report failure on invalid continue', () => {
    component.contextForm.patchValue({ projectName: '', projectDescription: '' });
    continueClickedSubject.next();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(false);
  });

  it('should save and continue when wizard navigation triggers with valid form', () => {
    component.contextForm.patchValue({
      projectName: 'Updated Project',
      projectDescription: 'Updated Desc'
    });
    continueClickedSubject.next();
    expect(projectServiceMock.updateProject).toHaveBeenCalled();
    expect(projectServiceMock.updateProjectContext).toHaveBeenCalled();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(true);
  });

  it('should show snackbar on save failure', () => {
    projectServiceMock.updateProjectContext.and.returnValue(throwError(() => new Error('Save error')));
    continueClickedSubject.next();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to save context. Please try again.', 'Dismiss', jasmine.any(Object));
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(false);
  });

  it('should save context manually on Save Context click', () => {
    component.onSaveContext();
    expect(projectServiceMock.updateProject).toHaveBeenCalled();
    expect(projectServiceMock.updateProjectContext).toHaveBeenCalled();
  });

  it('should select file and trigger upload successfully', () => {
    const mockFile = new File(['testing'], 'testfile.txt', { type: 'text/plain' });
    component.selectedFile.set(mockFile);
    component.onUploadAttachment();
    expect(projectServiceMock.uploadContextAttachment).toHaveBeenCalledWith(1, mockFile);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Attachment uploaded.', 'Dismiss', jasmine.any(Object));
  });

  it('should trigger attachment download successfully', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:testurl');
    spyOn(window.URL, 'revokeObjectURL');
    component.onDownloadAttachment();
    expect(projectServiceMock.downloadContextAttachment).toHaveBeenCalledWith(1);
  });

  it('should parse attachment basename correctly', () => {
    expect(component.attachmentName()).toBe('secure_context_file.pdf');
  });
});
