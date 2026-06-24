import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { VulnerabilitiesComponent } from './vulnerabilities.component';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { AssetService, SupportingAsset } from '../../core/services/asset.service';
import { ProjectService } from '../../core/services/project.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';
import { AiStatusService } from '../../core/services/ai-status.service';
import { RiskAiService, VulnerabilitySuggestion } from '../../core/services/risk-ai.service';

describe('VulnerabilitiesComponent', () => {
  let component: VulnerabilitiesComponent;
  let fixture: ComponentFixture<VulnerabilitiesComponent>;
  let vulnServiceSpy: jasmine.SpyObj<VulnerabilityService>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;
  let riskAiServiceSpy: jasmine.SpyObj<RiskAiService>;
  let projectServiceMock: any;
  let validationServiceMock: any;
  let aiStatusServiceMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let continueClickedSubject: Subject<void>;

  const mockProject = { id: 123, projectName: 'Secure Corp' };
  const mockSupportingAssets: SupportingAsset[] = [
    { id: 1, assetName: 'Payment API', assetType: 'Software', securityLevel: 3 },
    { id: 2, assetName: 'Transaction Database', assetType: 'Hardware', securityLevel: 3 }
  ];

  const mockVulnerabilities: Vulnerability[] = [
    {
      id: 1,
      vulnerabilityId: 1,
      vulnerabilityName: 'Unpatched TLS 1.0 on payment API',
      vulnerabilityFamily: 'Cryptography',
      cveScore: 7.4,
      overallLevel: 'High',
      vulnerabilityDescription: 'TLS 1.0 is enabled.',
      trackingId: 'Open',
      supportingAssets: [{ id: 1, assetName: 'Payment API' }] as any
    }
  ];

  beforeEach(async () => {
    const vulnSpy = jasmine.createSpyObj('VulnerabilityService', [
      'getVulnerabilities',
      'addVulnerability',
      'batchUpdateVulnerabilities',
      'deleteVulnerability'
    ]);
    const assetSpy = jasmine.createSpyObj('AssetService', ['getSupportingAssets']);
    const riskAiSpy = jasmine.createSpyObj('RiskAiService', ['suggestVulnerabilities']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    continueClickedSubject = new Subject<void>();
    validationServiceMock = {
      continueClicked$: continueClickedSubject.asObservable(),
      reportResult: jasmine.createSpy('reportResult'),
      isSaving: signal<boolean>(false)
    };

    projectServiceMock = {
      activeProject: signal<any>(mockProject)
    };

    aiStatusServiceMock = {
      aiState: signal<'available' | 'offline' | 'not-configured'>('available'),
      statusMessage: signal<string>('AI assist is active')
    };

    vulnSpy.getVulnerabilities.and.returnValue(of(mockVulnerabilities));
    vulnSpy.addVulnerability.and.returnValue(of({ id: 99, vulnerabilityId: 99, vulnerabilityName: 'New Vulnerability', cveScore: 0 }));
    vulnSpy.batchUpdateVulnerabilities.and.returnValue(of(mockVulnerabilities));
    vulnSpy.deleteVulnerability.and.returnValue(of({}));
    assetSpy.getSupportingAssets.and.returnValue(of(mockSupportingAssets));
    riskAiSpy.suggestVulnerabilities.and.returnValue(of({ suggestions: [] }));

    await TestBed.configureTestingModule({
      imports: [
        VulnerabilitiesComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: VulnerabilityService, useValue: vulnSpy },
        { provide: AssetService, useValue: assetSpy },
        { provide: RiskAiService, useValue: riskAiSpy },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: WizardValidationService, useValue: validationServiceMock },
        { provide: AiStatusService, useValue: aiStatusServiceMock },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VulnerabilitiesComponent);
    component = fixture.componentInstance;
    vulnServiceSpy = TestBed.inject(VulnerabilityService) as jasmine.SpyObj<VulnerabilityService>;
    assetServiceSpy = TestBed.inject(AssetService) as jasmine.SpyObj<AssetService>;
    riskAiServiceSpy = TestBed.inject(RiskAiService) as jasmine.SpyObj<RiskAiService>;
    snackBarSpy = snackSpy;
    (component as any).snackBar = snackBarSpy;
    fixture.detectChanges();
  });

  it('should create and load data on init', () => {
    expect(component).toBeTruthy();
    expect(vulnServiceSpy.getVulnerabilities).toHaveBeenCalledWith(123);
    expect(assetServiceSpy.getSupportingAssets).toHaveBeenCalledWith(123);
    expect(component.vulnerabilities()).toEqual(mockVulnerabilities);
    expect(component.supportingAssets()).toEqual(mockSupportingAssets);
  });

  it('should fallback to default vulnerabilities on error', () => {
    vulnServiceSpy.getVulnerabilities.and.returnValue(throwError(() => new Error('Error fetching')));
    component.loadData();
    expect(component.vulnerabilities()).toEqual(component.defaultVulnerabilities);
  });

  it('should handle adding a vulnerability with active project', () => {
    component.onAddClick();
    expect(vulnServiceSpy.addVulnerability).toHaveBeenCalled();
    expect(component.vulnerabilities().length).toBe(2);
    expect(component.selectedVulnerability()?.id).toBe(99);
  });

  it('should handle adding a vulnerability in demo mode (no active project)', () => {
    projectServiceMock.activeProject.set(null);
    vulnServiceSpy.addVulnerability.calls.reset();
    component.onAddClick();
    expect(vulnServiceSpy.addVulnerability).not.toHaveBeenCalled();
    expect(component.selectedVulnerability()?.vulnerabilityName).toBe('New Vulnerability');
  });

  it('should remove asset from supporting assets control and clear suggestions', () => {
    component.vulnForm.patchValue({ supportingAssets: [1, 2] });
    component.aiSuggestions.set([{ vulnerabilityName: 'S1' } as any]);

    component.removeAsset(1);
    expect(component.vulnForm.get('supportingAssets')?.value).toEqual([2]);
    expect(component.aiSuggestions()).toEqual([]);
  });

  it('should helper getAssetName return appropriate name', () => {
    expect(component.getAssetName(1)).toBe('Payment API');
    expect(component.getAssetName(99)).toBe('Asset 99');
  });

  it('should getAffectedAssetName return appropriate name or default', () => {
    component.vulnForm.patchValue({ supportingAssets: [1] });
    expect(component.getAffectedAssetName()).toBe('Payment API');

    component.vulnForm.patchValue({ supportingAssets: [] }, { emitEvent: false });
    expect(component.getAffectedAssetName()).toBe('Payment API');

    component.selectedVulnerability.set(null);
    expect(component.getAffectedAssetName()).toBe('—');
  });

  it('should load AI suggestions successfully', () => {
    component.vulnForm.patchValue({ supportingAssets: [1] });
    const suggestions: VulnerabilitySuggestion[] = [
      {
        vulnerabilityName: 'S1',
        vulnerabilityFamily: 'Authorization',
        vulnerabilityDescription: 'Desc1',
        estimatedCveScore: 8.5,
        rationale: 'Rat1'
      }
    ];
    riskAiServiceSpy.suggestVulnerabilities.and.returnValue(of({ suggestions }));

    component.onSuggestVulnerabilities();

    expect(component.isLoadingSuggestions()).toBeFalse();
    expect(component.aiSuggestions()).toEqual(suggestions);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Vulnerability suggestions generated successfully.', 'Dismiss', jasmine.any(Object));
  });

  it('should handle AI suggest offline state', () => {
    aiStatusServiceMock.aiState.set('offline');
    component.vulnForm.patchValue({ supportingAssets: [1] });

    component.onSuggestVulnerabilities();

    expect(snackBarSpy.open).toHaveBeenCalledWith('AI service is offline.', 'Dismiss', jasmine.any(Object));
  });

  it('should apply AI suggestion to the form and clear suggestions list', () => {
    const suggestion: VulnerabilitySuggestion = {
      vulnerabilityName: 'S1',
      vulnerabilityFamily: 'Authorization',
      vulnerabilityDescription: 'Desc1',
      estimatedCveScore: 8.5,
      rationale: 'Rat1'
    };
    component.aiSuggestions.set([suggestion]);

    component.useSuggestion(suggestion);

    expect(component.vulnForm.get('vulnerabilityName')?.value).toBe('S1');
    expect(component.vulnForm.get('vulnerabilityFamily')?.value).toBe('Authorization');
    expect(component.vulnForm.get('vulnerabilityDescription')?.value).toBe('Desc1');
    expect(component.vulnForm.get('cveScore')?.value).toBe(8.5);
    expect(component.aiSuggestions()).toEqual([]);
  });

  it('should return correct severity color and classes', () => {
    expect(component.getExploitabilityLevel(9.5)).toBe('Critical');
    expect(component.getExploitabilityLevel(7.5)).toBe('High');
    expect(component.getExploitabilityLevel(5.0)).toBe('Moderate');
    expect(component.getExploitabilityLevel(2.0)).toBe('Low');

    expect(component.getSeverityColor('Critical')).toBe('#c81e1e');
    expect(component.getSeverityColor('High')).toBe('#8e4b10');
    expect(component.getSeverityColor('Moderate')).toBe('#92610a');
    expect(component.getSeverityColor('Low')).toBe('#065f46');
    expect(component.getSeverityColor('Unknown')).toBe('var(--text-primary)');

    expect(component.getSeverityClass('Critical')).toBe('critical');
    expect(component.getSeverityClass('High')).toBe('high');
    expect(component.getSeverityClass('Moderate')).toBe('moderate');
    expect(component.getSeverityClass('Medium')).toBe('moderate');
    expect(component.getSeverityClass('Low')).toBe('low');

    expect(component.getStatusClass('Open')).toBe('open');
    expect(component.getStatusClass('Mitigated')).toBe('mitigated');
    expect(component.getStatusClass('Accepted')).toBe('accepted');
    expect(component.getStatusClass('Unknown')).toBe('open');
  });

  it('should handle delete vulnerability with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteVulnerability(1, new Event('click'));
    expect(vulnServiceSpy.deleteVulnerability).toHaveBeenCalledWith(123, 1);
    expect(component.vulnerabilities().length).toBe(0);
  });

  it('should handle delete vulnerability without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDeleteVulnerability(1, new Event('click'));
    expect(vulnServiceSpy.deleteVulnerability).not.toHaveBeenCalled();
  });

  it('should validate and batch update on wizard continueClicked', () => {
    component.vulnForm.patchValue({
      vulnerabilityName: 'Updated Vuln',
      vulnerabilityFamily: 'Other',
      trackingId: 'Open',
      cveScore: 5.0,
      supportingAssets: [1]
    });

    continueClickedSubject.next();

    expect(vulnServiceSpy.batchUpdateVulnerabilities).toHaveBeenCalled();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(true);
  });

  it('should report false if continueClicked with invalid form', () => {
    component.vulnForm.patchValue({
      vulnerabilityName: '', // Invalid as required
      supportingAssets: []   // Invalid as required
    });

    continueClickedSubject.next();

    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(false);
  });
});
