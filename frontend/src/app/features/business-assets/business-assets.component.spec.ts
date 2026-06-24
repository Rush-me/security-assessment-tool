import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { BusinessAssetsComponent } from './business-assets.component';
import { AssetService, BusinessAsset } from '../../core/services/asset.service';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';

describe('BusinessAssetsComponent', () => {
  let component: BusinessAssetsComponent;
  let fixture: ComponentFixture<BusinessAssetsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;
  let projectServiceMock: any;
  let validationServiceMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let continueClickedSubject: Subject<void>;

  const mockProject = { id: 123, projectName: 'Secure Corp' };
  const mockAssets: BusinessAsset[] = [
    {
      id: 1,
      assetName: 'User Database',
      assetType: 'Data',
      assetDescription: 'Contains credentials',
      confidentiality: 3,
      integrity: 3,
      availability: 2,
      authenticity: 2,
      authorization: 2,
      nonRepudiation: 1
    }
  ];

  beforeEach(async () => {
    const assetSpy = jasmine.createSpyObj('AssetService', [
      'getBusinessAssets',
      'addBusinessAsset',
      'updateBusinessAsset',
      'deleteBusinessAsset'
    ]);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    continueClickedSubject = new Subject<void>();
    validationServiceMock = {
      continueClicked$: continueClickedSubject.asObservable(),
      reportResult: jasmine.createSpy('reportResult')
    };

    projectServiceMock = {
      activeProject: signal<any>(mockProject)
    };

    assetSpy.getBusinessAssets.and.returnValue(of(mockAssets));
    assetSpy.addBusinessAsset.and.returnValue(of({}));
    assetSpy.updateBusinessAsset.and.returnValue(of({}));
    assetSpy.deleteBusinessAsset.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        BusinessAssetsComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AssetService, useValue: assetSpy },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: WizardValidationService, useValue: validationServiceMock },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).overrideComponent(BusinessAssetsComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useValue: snackSpy }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessAssetsComponent);
    component = fixture.componentInstance;
    assetServiceSpy = TestBed.inject(AssetService) as jasmine.SpyObj<AssetService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and load assets on init', () => {
    expect(component).toBeTruthy();
    expect(assetServiceSpy.getBusinessAssets).toHaveBeenCalledWith(123);
    expect(component.assets()).toEqual(mockAssets);
  });

  it('should handle loadAssets failure', () => {
    assetServiceSpy.getBusinessAssets.and.returnValue(throwError(() => new Error('DB Error')));
    component.loadAssets();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to load assets.', 'Dismiss', jasmine.any(Object));
  });

  it('should validate and submit a new asset', () => {
    component.onAddAssetClick();
    expect(component.showForm()).toBeTrue();
    expect(component.editMode()).toBeFalse();

    component.assetForm.patchValue({
      assetName: 'API Endpoint',
      assetType: 'Service',
      assetDescription: 'Public facing API'
    });

    component.onSubmit();

    expect(assetServiceSpy.addBusinessAsset).toHaveBeenCalledWith(123, jasmine.objectContaining({
      assetName: 'API Endpoint',
      assetType: 'Service'
    }));
    expect(component.showForm()).toBeFalse();
  });

  it('should validate and edit an existing asset', () => {
    const targetAsset = mockAssets[0];
    component.onEditAsset(targetAsset);

    expect(component.showForm()).toBeTrue();
    expect(component.editMode()).toBeTrue();
    expect(component.editingAssetId()).toEqual(targetAsset.id!);

    component.assetForm.patchValue({
      assetName: 'User DB Updated'
    });

    component.onSubmit();

    expect(assetServiceSpy.updateBusinessAsset).toHaveBeenCalledWith(123, targetAsset.id!, jasmine.objectContaining({
      assetName: 'User DB Updated'
    }));
  });

  it('should not submit if form is invalid', () => {
    component.onAddAssetClick();
    component.assetForm.patchValue({
      assetName: '' // Invalid as required
    });
    component.onSubmit();
    expect(assetServiceSpy.addBusinessAsset).not.toHaveBeenCalled();
  });

  it('should cycle asset rating values', () => {
    const targetAsset = mockAssets[0];
    // confidentiality is 3. (3 + 1) % 4 = 0.
    component.cycleRating(targetAsset, 'confidentiality');

    expect(assetServiceSpy.updateBusinessAsset).toHaveBeenCalledWith(123, targetAsset.id!, jasmine.objectContaining({
      confidentiality: 0
    }));
  });

  it('should delete asset with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteAsset(1);
    expect(assetServiceSpy.deleteBusinessAsset).toHaveBeenCalledWith(123, 1);
  });

  it('should handle wizard navigation clicked with valid assets', () => {
    continueClickedSubject.next();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(true);
  });

  it('should handle wizard navigation clicked with zero assets', () => {
    component.assets.set([]);
    continueClickedSubject.next();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(false);
  });
});
