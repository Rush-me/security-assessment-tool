import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RiskAiService, ThreatSuggestionResponse, VulnerabilitySuggestionResponse } from './risk-ai.service';
import { ConfigService } from './config.service';

describe('RiskAiService', () => {
  let service: RiskAiService;
  let httpTestingController: HttpTestingController;

  const mockThreatResponse: ThreatSuggestionResponse = {
    suggestions: [
      {
        threatAgent: 'External Attacker',
        threatVerb: 'Exfiltrates',
        motivation: 'Espionage',
        rationale: 'Database contains high value data'
      }
    ]
  };

  const mockVulnResponse: VulnerabilitySuggestionResponse = {
    suggestions: [
      {
        vulnerabilityName: 'SQL Injection',
        vulnerabilityFamily: 'Input Validation',
        vulnerabilityDescription: 'User inputs are not sanitized',
        estimatedCveScore: 9.8,
        rationale: 'Exposed endpoint'
      }
    ]
  };

  beforeEach(() => {
    const configSpy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    configSpy.getApiUrl.and.returnValue('http://localhost:8080');

    TestBed.configureTestingModule({
      providers: [
        RiskAiService,
        { provide: ConfigService, useValue: configSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RiskAiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should suggest threats via POST', () => {
    service.suggestThreats(1, 2).subscribe(res => {
      expect(res).toEqual(mockThreatResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/ai/suggest-threats');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ businessAssetId: 1, supportingAssetId: 2 });
    req.flush(mockThreatResponse);
  });

  it('should suggest vulnerabilities via POST', () => {
    service.suggestVulnerabilities(3).subscribe(res => {
      expect(res).toEqual(mockVulnResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/ai/suggest-vulnerabilities');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ supportingAssetId: 3 });
    req.flush(mockVulnResponse);
  });
});
