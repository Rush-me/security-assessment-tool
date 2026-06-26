import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { SupportingAssetsComponent } from './supporting-assets.component';
import { AssetService, BusinessAsset, SupportingAsset } from '../../core/services/asset.service';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';

describe('SupportingAssetsComponent', () => {
  let component: SupportingAssetsComponent;
  let fixture: ComponentFixture<SupportingAssetsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;
  let validationServiceMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let continueClickedSubject: Subject<void>;

  const mockProject = { id: 777, projectName: 'Support Core' };
  const mockBusinessAssets: BusinessAsset[] = [
    { id: 10, assetName: 'Card Details DB', assetType: 'Data', confidentiality: 3 } as any
  ];
  const mockSupportingAssets: SupportingAsset[] = [
    {
      id: 1,
      hldId: 'HLD-101',
      assetName: 'Core Payment Microservice',
      assetType: 'Service',
      securityLevel: 3,
      businessAssets: [mockBusinessAssets[0]]
    }
  ];

  beforeEach(async () => {
    const assetSpy = jasmine.createSpyObj('AssetService', [
      'getSupportingAssets',
      'getBusinessAssets',
      'addSupportingAsset',
      'updateSupportingAsset',
      'deleteSupportingAsset'
    ]);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    continueClickedSubject = new Subject<void>();
    validationServiceMock = {
      continueClicked$: continueClickedSubject.asObservable(),
      reportResult: jasmine.createSpy('reportResult')
    };

    assetSpy.getSupportingAssets.and.returnValue(of(mockSupportingAssets));
    assetSpy.getBusinessAssets.and.returnValue(of(mockBusinessAssets));
    assetSpy.addSupportingAsset.and.returnValue(of({}));
    assetSpy.updateSupportingAsset.and.returnValue(of({}));
    assetSpy.deleteSupportingAsset.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        SupportingAssetsComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AssetService, useValue: assetSpy },
        { provide: ProjectService, useValue: { activeProject: signal<any>(mockProject) } },
        { provide: WizardValidationService, useValue: validationServiceMock },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).overrideComponent(SupportingAssetsComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useValue: snackSpy }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(SupportingAssetsComponent);
    component = fixture.componentInstance;
    assetServiceSpy = TestBed.inject(AssetService) as jasmine.SpyObj<AssetService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and load assets on init', () => {
    expect(component).toBeTruthy();
    expect(assetServiceSpy.getSupportingAssets).toHaveBeenCalledWith(777);
    expect(assetServiceSpy.getBusinessAssets).toHaveBeenCalledWith(777);
    expect(component.assets()).toEqual(mockSupportingAssets);
  });

  it('should display snackbar on loadAssets error', () => {
    assetServiceSpy.getSupportingAssets.and.returnValue(throwError(() => new Error('Error')));
    component.loadAssets();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to load supporting assets.', 'Dismiss', jasmine.any(Object));
  });

  it('should validate and add a new supporting asset', () => {
    component.onAddAssetClick();
    expect(component.showForm()).toBeTrue();
    expect(component.editMode()).toBeFalse();

    component.assetForm.patchValue({
      hldId: 'HLD-202',
      assetName: 'Auth Web Server',
      assetType: 'Application',
      securityLevel: 2,
      businessAssets: [10]
    });

    component.onSubmit();

    expect(assetServiceSpy.addSupportingAsset).toHaveBeenCalledWith(777, jasmine.objectContaining({
      assetName: 'Auth Web Server',
      securityLevel: 2,
      businessAssets: [{ id: 10 }]
    }));
    expect(component.showForm()).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Supporting asset added!', 'Dismiss', jasmine.any(Object));
  });

  it('should validate and edit an existing supporting asset', () => {
    const targetAsset = mockSupportingAssets[0];
    component.onEditAsset(targetAsset);

    expect(component.showForm()).toBeTrue();
    expect(component.editMode()).toBeTrue();
    expect(component.editingAssetId()).toEqual(targetAsset.id!);

    component.assetForm.patchValue({
      assetName: 'Updated Payment Microservice'
    });

    component.onSubmit();

    expect(assetServiceSpy.updateSupportingAsset).toHaveBeenCalledWith(777, targetAsset.id!, jasmine.objectContaining({
      assetName: 'Updated Payment Microservice'
    }));
    expect(component.showForm()).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Supporting asset updated!', 'Dismiss', jasmine.any(Object));
  });

  it('should not add supporting asset if form is invalid', () => {
    component.onAddAssetClick();
    component.assetForm.patchValue({ assetName: '' }); // required
    component.onSubmit();
    expect(assetServiceSpy.addSupportingAsset).not.toHaveBeenCalled();
  });

  it('should delete asset with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteAsset(1);
    expect(assetServiceSpy.deleteSupportingAsset).toHaveBeenCalledWith(777, 1);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Asset removed.', 'Dismiss', jasmine.any(Object));
  });

  it('should format business asset names and security labels correctly', () => {
    expect(component.getBusinessAssetNames(mockBusinessAssets)).toBe('Card Details DB');
    expect(component.getSecurityLevelLabel(3)).toBe('SL3 - Advanced');
    expect(component.getSecurityLevelLabel(99)).toBe('SL99');
  });

  it('should handle wizard navigation clicked with valid supporting assets', () => {
    continueClickedSubject.next();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(true);
  });

  it('should handle wizard navigation clicked with zero assets', () => {
    component.assets.set([]);
    continueClickedSubject.next();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(false);
  });
});
