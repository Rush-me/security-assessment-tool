import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { RisksComponent } from './risks.component';
import { RiskService, Risk, RiskMitigation } from '../../core/services/risk.service';
import { AssetService, BusinessAsset, SupportingAsset } from '../../core/services/asset.service';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { ProjectService } from '../../core/services/project.service';
import { AiStatusService } from '../../core/services/ai-status.service';
import { RiskAiService } from '../../core/services/risk-ai.service';
import { WizardValidationService } from '../../core/services/wizard-validation.service';

describe('RisksComponent', () => {
  let component: RisksComponent;
  let fixture: ComponentFixture<RisksComponent>;

  let riskServiceSpy: jasmine.SpyObj<RiskService>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;
  let vulnServiceSpy: jasmine.SpyObj<VulnerabilityService>;
  let aiStatusServiceMock: any;
  let riskAiServiceSpy: jasmine.SpyObj<RiskAiService>;
  let validationServiceMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  let continueClickedSubject: Subject<void>;

  const mockProject = { id: 101, projectName: 'Risk Sandbox' };
  const mockBusinessAssets: BusinessAsset[] = [
    { id: 1, assetName: 'Cardholder Data', assetType: 'Data', confidentiality: 3 } as any
  ];
  const mockSupportingAssets: SupportingAsset[] = [
    { id: 10, assetName: 'Payment API Gateway', assetType: 'Service', securityLevel: 3 } as any
  ];
  const mockVulns: Vulnerability[] = [
    { id: 50, vulnerabilityId: 50, vulnerabilityName: 'Weak TLS', vulnerabilityFamily: 'Crypto', cveScore: 5.0 }
  ];

  const mockRisks: Risk[] = [
    {
      id: 201,
      riskId: 1,
      riskName: 'Hacker intercepts Payment API Gateway',
      threatAgent: 'External Attacker',
      threatVerb: 'steal',
      motivation: 'Financial theft',
      isAutomaticRiskName: true,
      inherentRiskScore: 6.0,
      riskLikelihood: 6.0,
      riskImpact: 6.0,
      residualRiskScore: 6.0,
      residualRiskLevel: 'Moderate',
      riskManagementDecision: 'Accept',
      businessAssetRef: { id: 1 } as any,
      supportingAssetRef: { id: 10 } as any,
      riskAttackPaths: [
        {
          id: 301,
          attackPathId: 1,
          attackPathScore: 5.0,
          vulnerabilityRefs: [
            { id: 50, score: 5.0, name: 'Weak TLS', vulnerability: { id: 50 } as any }
          ]
        }
      ],
      riskMitigations: [
        { id: 401, description: 'Upgrade TLS', benefits: 0.5, decision: 'Proposed' }
      ]
    }
  ];

  beforeEach(async () => {
    const riskSpy = jasmine.createSpyObj('RiskService', [
      'getRisks', 'addRisk', 'deleteRisk', 'batchUpdateRisks',
      'addAttackPath', 'deleteAttackPath', 'addVulnerabilityToAttackPath', 'removeVulnerabilityFromAttackPath',
      'addMitigation', 'updateMitigation', 'deleteMitigation'
    ]);
    const assetSpy = jasmine.createSpyObj('AssetService', ['getBusinessAssets', 'getSupportingAssets']);
    const vulnSpy = jasmine.createSpyObj('VulnerabilityService', ['getVulnerabilities']);
    const aiSpy = jasmine.createSpyObj('RiskAiService', ['suggestThreats']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    continueClickedSubject = new Subject<void>();
    validationServiceMock = {
      continueClicked$: continueClickedSubject.asObservable(),
      reportResult: jasmine.createSpy('reportResult'),
      isSaving: signal<boolean>(false)
    };

    aiStatusServiceMock = {
      aiState: signal<any>('connected'),
      statusMessage: signal<string>('AI connected')
    };

    riskSpy.getRisks.and.returnValue(of(mockRisks));
    riskSpy.addRisk.and.returnValue(of(mockRisks[0]));
    riskSpy.deleteRisk.and.returnValue(of({}));
    riskSpy.batchUpdateRisks.and.returnValue(of(mockRisks));
    riskSpy.addAttackPath.and.returnValue(of(mockRisks[0]));
    riskSpy.deleteAttackPath.and.returnValue(of(mockRisks[0]));
    riskSpy.addVulnerabilityToAttackPath.and.returnValue(of(mockRisks[0]));
    riskSpy.removeVulnerabilityFromAttackPath.and.returnValue(of(mockRisks[0]));
    riskSpy.addMitigation.and.returnValue(of(mockRisks[0]));
    riskSpy.updateMitigation.and.returnValue(of(mockRisks[0]));
    riskSpy.deleteMitigation.and.returnValue(of(mockRisks[0]));

    assetSpy.getBusinessAssets.and.returnValue(of(mockBusinessAssets));
    assetSpy.getSupportingAssets.and.returnValue(of(mockSupportingAssets));
    vulnSpy.getVulnerabilities.and.returnValue(of(mockVulns));

    aiSpy.suggestThreats.and.returnValue(of({
      suggestions: [
        { threatAgent: 'External Attacker', threatVerb: 'steal', motivation: 'Get Card Data' }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [
        RisksComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: RiskService, useValue: riskSpy },
        { provide: AssetService, useValue: assetSpy },
        { provide: VulnerabilityService, useValue: vulnSpy },
        { provide: ProjectService, useValue: { activeProject: signal<any>(mockProject) } },
        { provide: AiStatusService, useValue: aiStatusServiceMock },
        { provide: RiskAiService, useValue: aiSpy },
        { provide: WizardValidationService, useValue: validationServiceMock },
        { provide: MatSnackBar, useValue: snackSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RisksComponent);
    component = fixture.componentInstance;
    riskServiceSpy = TestBed.inject(RiskService) as jasmine.SpyObj<RiskService>;
    assetServiceSpy = TestBed.inject(AssetService) as jasmine.SpyObj<AssetService>;
    vulnServiceSpy = TestBed.inject(VulnerabilityService) as jasmine.SpyObj<VulnerabilityService>;
    riskAiServiceSpy = TestBed.inject(RiskAiService) as jasmine.SpyObj<RiskAiService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create and load risks, assets, and vulnerabilities', () => {
    expect(component).toBeTruthy();
    expect(riskServiceSpy.getRisks).toHaveBeenCalledWith(101);
    expect(assetServiceSpy.getBusinessAssets).toHaveBeenCalledWith(101);
    expect(assetServiceSpy.getSupportingAssets).toHaveBeenCalledWith(101);
    expect(vulnServiceSpy.getVulnerabilities).toHaveBeenCalledWith(101);

    expect(component.risks()).toEqual(mockRisks);
    expect(component.selectedRisk()?.id).toEqual(mockRisks[0].id);
  });

  it('should validate form and batch save on continueClicked$', () => {
    component.riskForm.patchValue({ motivation: 'Financial heist' });
    continueClickedSubject.next();
    expect(riskServiceSpy.batchUpdateRisks).toHaveBeenCalled();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(true);
  });

  it('should report failure on continueClicked$ if form is invalid', () => {
    component.riskForm.patchValue({ motivation: '' }); // Invalid: required
    continueClickedSubject.next();
    expect(validationServiceMock.reportResult).toHaveBeenCalledWith(false);
  });

  it('should add a risk correctly', () => {
    component.onAddRisk();
    expect(riskServiceSpy.addRisk).toHaveBeenCalled();
  });

  it('should delete a risk with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteRisk(201);
    expect(riskServiceSpy.deleteRisk).toHaveBeenCalledWith(101, 201);
  });

  it('should manage attack path creations and deletions', () => {
    component.addAttackPath(201);
    expect(riskServiceSpy.addAttackPath).toHaveBeenCalledWith(101, 201);

    component.deleteAttackPath(201, 301);
    expect(riskServiceSpy.deleteAttackPath).toHaveBeenCalledWith(101, 201, 301);
  });

  it('should map and unmap vulnerability refs from attack paths', () => {
    component.addVulnToPath(201, 301, 50);
    expect(riskServiceSpy.addVulnerabilityToAttackPath).toHaveBeenCalledWith(101, 201, 301, 50);

    component.removeVulnRef(201, 301, 50);
    expect(riskServiceSpy.removeVulnerabilityFromAttackPath).toHaveBeenCalledWith(101, 201, 301, 50);
  });

  it('should manage mitigations submissions and updates', () => {
    // Add mitigation
    component.onAddMitigation(201);
    expect(component.editingMitigation()?.riskId).toBe(201);
    expect(component.editingMitigation()?.mitId).toBeNull();

    component.mitigationForm.patchValue({
      description: 'Deploy patch',
      benefits: 0.7,
      decision: 'Done'
    });
    component.onSubmitMitigation();
    expect(riskServiceSpy.addMitigation).toHaveBeenCalledWith(101, 201, jasmine.objectContaining({
      description: 'Deploy patch',
      benefits: 0.7
    }));

    // Edit mitigation
    const targetMit = mockRisks[0].riskMitigations![0];
    component.onEditMitigation(201, targetMit);
    expect(component.editingMitigation()?.mitId).toBe(401);

    component.mitigationForm.patchValue({
      description: 'Upgrade TLS 1.3'
    });
    component.onSubmitMitigation();
    expect(riskServiceSpy.updateMitigation).toHaveBeenCalledWith(101, 201, 401, jasmine.objectContaining({
      description: 'Upgrade TLS 1.3'
    }));

    // Delete mitigation
    component.onDeleteMitigation(201, 401);
    expect(riskServiceSpy.deleteMitigation).toHaveBeenCalledWith(101, 201, 401);
  });

  it('should fetch and use AI suggestions', () => {
    component.riskForm.patchValue({
      businessAssetRefId: 1,
      supportingAssetRefId: 10
    });

    component.onSuggestThreats();

    expect(riskAiServiceSpy.suggestThreats).toHaveBeenCalledWith(1, 10);
    expect(component.aiSuggestions().length).toBe(1);

    // Apply suggestion
    component.useThreatSuggestion(component.aiSuggestions()[0]);
    expect(component.riskForm.get('motivation')?.value).toBe('Get Card Data');
  });

  it('should return correct severity classes and colors', () => {
    expect(component.getResidualClass('Critical')).toBe('critical');
    expect(component.getResidualClass('high')).toBe('high');
    expect(component.getSeverityColor('critical')).toBe('#c81e1e');
    expect(component.getSeverityColor('low')).toBe('#065f46');
  });
});
