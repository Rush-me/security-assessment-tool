import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { BasicInfoComponent } from './basic-info.component';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { signal } from '@angular/core';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;
  let fixture: ComponentFixture<BasicInfoComponent>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let validationServiceSpy: jasmine.SpyObj<WizardValidationService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let continueClickedSubject: Subject<void>;

  beforeEach(async () => {
    continueClickedSubject = new Subject<void>();
    const projSpy = jasmine.createSpyObj('ProjectService', ['updateProject']);
    projSpy.activeProject = signal<any>({
      id: 1,
      projectName: 'Test Project',
      projectVersion: '1.0',
      projectOrganization: 'Thales',
      classification: 'Internal'
    });

    const valSpy = jasmine.createSpyObj('WizardValidationService', ['reportResult']);
    valSpy.continueClicked$ = continueClickedSubject.asObservable();

    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        BasicInfoComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ProjectService, useValue: projSpy },
        { provide: WizardValidationService, useValue: valSpy },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).overrideComponent(BasicInfoComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useValue: snackSpy }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;
    projectServiceSpy = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    validationServiceSpy = TestBed.inject(WizardValidationService) as jasmine.SpyObj<WizardValidationService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and patch form values from activeProject signal', () => {
    expect(component).toBeTruthy();
    expect(component.basicForm.get('projectName')!.value).toBe('Test Project');
    expect(component.basicForm.get('projectVersion')!.value).toBe('1.0');
    expect(component.basicForm.get('projectOrganization')!.value).toBe('Thales');
    expect(component.basicForm.get('classification')!.value).toBe('Internal');
  });

  it('should mark fields as invalid on submit with invalid form', () => {
    component.basicForm.get('projectName')!.setValue('');
    continueClickedSubject.next();

    expect(component.isFieldInvalid('projectName')).toBeTrue();
    expect(validationServiceSpy.reportResult).toHaveBeenCalledWith(false);
  });

  it('should save and proceed on continueClicked$ when form is valid', () => {
    projectServiceSpy.updateProject.and.returnValue(of({
      id: 1,
      projectName: 'Updated Proj',
      projectVersion: '1.0',
      projectOrganization: 'Thales',
      classification: 'Internal'
    }));

    component.basicForm.patchValue({ projectName: 'Updated Proj' });
    continueClickedSubject.next();

    expect(projectServiceSpy.updateProject).toHaveBeenCalled();
    expect(projectServiceSpy.activeProject()?.projectName).toBe('Updated Proj');
    expect(validationServiceSpy.reportResult).toHaveBeenCalledWith(true);
  });

  it('should handle update failure on saveAndProceed', () => {
    projectServiceSpy.updateProject.and.returnValue(throwError(() => new Error('Save error')));

    continueClickedSubject.next();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to save basic info.', 'Dismiss', jasmine.any(Object));
    expect(validationServiceSpy.reportResult).toHaveBeenCalledWith(false);
  });

  it('should proceed immediately if there is no active project id', () => {
    projectServiceSpy.activeProject.set({
      projectName: 'New Proj',
      projectVersion: '1.0',
      projectOrganization: 'Thales',
      classification: 'Internal'
    });
    fixture.detectChanges();

    continueClickedSubject.next();

    expect(projectServiceSpy.updateProject).not.toHaveBeenCalled();
    expect(validationServiceSpy.reportResult).toHaveBeenCalledWith(true);
  });
});
