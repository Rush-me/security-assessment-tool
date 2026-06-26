import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ReportsComponent } from './reports.component';
import { RiskService, Risk } from '../../core/services/risk.service';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { ProjectService } from '../../core/services/project.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let riskServiceSpy: jasmine.SpyObj<RiskService>;
  let vulnServiceSpy: jasmine.SpyObj<VulnerabilityService>;
  let projectServiceMock: any;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProject = { id: 101, projectName: 'Shield Guard API' };
  const mockRisks: Risk[] = [
    {
      id: 1,
      riskId: 1,
      riskName: 'Injection Attack on DB',
      inherentRiskScore: 0.9,
      residualRiskScore: 0.3,
      residualRiskLevel: 'High',
      riskManagementDecision: 'Mitigate',
      threatAgent: 'Hacker',
      threatVerb: 'injects SQL',
      businessAssetRef: { id: 1, assetName: 'Main Database' } as any,
      supportingAssetRef: { id: 2, assetName: 'Database Server' }
    },
    {
      id: 2,
      riskId: 2,
      riskName: 'Phishing Target Admin',
      inherentRiskScore: 0.7,
      residualRiskScore: 0.1,
      residualRiskLevel: 'Low',
      riskManagementDecision: 'Accept',
      threatAgent: 'Phisher',
      threatVerb: 'emails',
      businessAssetRef: { id: 3, assetName: 'Admin Credentials' } as any,
      supportingAssetRef: { id: 4, assetName: 'Mail Server' }
    }
  ];

  const mockVulns: Vulnerability[] = [
    {
      id: 1,
      vulnerabilityId: 10,
      vulnerabilityName: 'Outdated SQL Lib',
      vulnerabilityFamily: 'Injection',
      cveScore: 7.5,
      overallLevel: 'High',
      cve: 'CVE-2023-1234'
    }
  ];

  beforeEach(async () => {
    const riskSpy = jasmine.createSpyObj('RiskService', ['getRisks']);
    const vulnSpy = jasmine.createSpyObj('VulnerabilityService', ['getVulnerabilities']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const rotSpy = jasmine.createSpyObj('Router', ['navigate']);

    projectServiceMock = {
      activeProject: signal<any>(mockProject)
    };

    riskSpy.getRisks.and.returnValue(of(mockRisks));
    vulnSpy.getVulnerabilities.and.returnValue(of(mockVulns));

    await TestBed.configureTestingModule({
      imports: [
        ReportsComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: RiskService, useValue: riskSpy },
        { provide: VulnerabilityService, useValue: vulnSpy },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: Router, useValue: rotSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    riskServiceSpy = TestBed.inject(RiskService) as jasmine.SpyObj<RiskService>;
    vulnServiceSpy = TestBed.inject(VulnerabilityService) as jasmine.SpyObj<VulnerabilityService>;
    snackBarSpy = snackSpy;
    (component as any).snackBar = snackBarSpy;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create and load risks and vulnerabilities KPIs on init', () => {
    expect(component).toBeTruthy();
    expect(riskServiceSpy.getRisks).toHaveBeenCalledWith(101);
    expect(vulnServiceSpy.getVulnerabilities).toHaveBeenCalledWith(101);

    expect(component.totalRisks()).toBe(2);
    expect(component.totalVulns()).toBe(1);
    expect(component.criticalCount()).toBe(0);
    expect(component.highCount()).toBe(1); // One high risk
    expect(component.lowCount()).toBe(1);  // One low risk
  });

  it('should calculate averages and reduction correctly', () => {
    expect(component.avgInherentRisk()).toBe(0.8); // (0.9 + 0.7) / 2
    expect(component.avgResidualRisk()).toBe(0.2); // (0.3 + 0.1) / 2
    expect(component.riskReductionPct()).toBe(75); // Math.round(((0.8 - 0.2) / 0.8) * 100)
  });

  it('should format CSS class name helpers', () => {
    expect(component.getLevelClass('High')).toBe('high');
    expect(component.getLevelClass('CRITICAL')).toBe('critical');
    expect(component.getLevelClass('moderate')).toBe('moderate');
    expect(component.getLevelClass('unknown')).toBe('none');

    expect(component.getDecisionClass('Mitigate')).toBe('mitigate');
    expect(component.getDecisionClass('Accept')).toBe('accept');
  });

  it('should handle chart dot bottom mapping clamping', () => {
    expect(component.getDotBottom(0.5)).toBe('50%'); // 0.5 * 90 + 5 = 50
    expect(component.getDotBottom(1)).toBe('95%');   // 1 * 90 + 5 = 95
  });

  it('should export risk register to CSV', () => {
    spyOn(component as any, 'downloadBlob');
    component.exportCsv();
    expect((component as any).downloadBlob).toHaveBeenCalledWith(
      jasmine.stringMatching('Risk ID,Risk Name'),
      'text/csv',
      jasmine.stringMatching('ISRA_Risks_Shield Guard API.csv')
    );
  });

  it('should export full assessment to JSON', () => {
    spyOn(component as any, 'downloadBlob');
    component.exportJson();
    expect((component as any).downloadBlob).toHaveBeenCalledWith(
      jasmine.stringMatching('"projectName": "Shield Guard API"'),
      'application/json',
      jasmine.stringMatching('ISRA_Assessment_Shield Guard API.json')
    );
  });

  it('should export vulnerabilities to CSV', () => {
    spyOn(component as any, 'downloadBlob');
    component.exportVulnCsv();
    expect((component as any).downloadBlob).toHaveBeenCalledWith(
      jasmine.stringMatching('ID,Name,Family'),
      'text/csv',
      jasmine.stringMatching('ISRA_Vulnerabilities_Shield Guard API.csv')
    );
  });

  it('should trigger router navigate on Back button', () => {
    component.onBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['../vulnerabilities'], jasmine.any(Object));
  });

  it('should trigger finish snackbar info on Finish click', () => {
    component.onFinish();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Assessment complete. You can export your report above.',
      'Dismiss',
      jasmine.any(Object)
    );
  });
});
