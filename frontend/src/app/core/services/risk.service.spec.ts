import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RiskService, Risk, RiskMitigation } from './risk.service';
import { ConfigService } from './config.service';

describe('RiskService', () => {
  let service: RiskService;
  let httpTestingController: HttpTestingController;

  const mockRisk: Risk = {
    id: 100,
    threatAgent: 'Hacker',
    riskName: 'Hacker disrupts database'
  };

  beforeEach(() => {
    const configSpy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    configSpy.getApiUrl.and.returnValue('http://localhost:8080');

    TestBed.configureTestingModule({
      providers: [
        RiskService,
        { provide: ConfigService, useValue: configSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RiskService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get risks', () => {
    const risks = [mockRisk];
    service.getRisks(1).subscribe(res => expect(res).toEqual(risks));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks');
    expect(req.request.method).toBe('GET');
    req.flush(risks);
  });

  it('should add a risk', () => {
    service.addRisk(1, mockRisk).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRisk);
    req.flush(mockRisk);
  });

  it('should update a risk', () => {
    service.updateRisk(1, 100, mockRisk).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100');
    expect(req.request.method).toBe('PUT');
    req.flush(mockRisk);
  });

  it('should batch update risks', () => {
    const risks = [mockRisk];
    service.batchUpdateRisks(1, risks).subscribe(res => expect(res).toEqual(risks));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/batch');
    expect(req.request.method).toBe('PUT');
    req.flush(risks);
  });

  it('should delete a risk', () => {
    service.deleteRisk(1, 100).subscribe(res => expect(res).toBeNull());

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should add attack path', () => {
    service.addAttackPath(1, 100).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/attack-paths');
    expect(req.request.method).toBe('POST');
    req.flush(mockRisk);
  });

  it('should delete attack path', () => {
    service.deleteAttackPath(1, 100, 5).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/attack-paths/5');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockRisk);
  });

  it('should add vulnerability to attack path', () => {
    service.addVulnerabilityToAttackPath(1, 100, 5, 200).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/attack-paths/5/vulnerabilities?vulnerabilityId=200');
    expect(req.request.method).toBe('POST');
    req.flush(mockRisk);
  });

  it('should remove vulnerability from attack path', () => {
    service.removeVulnerabilityFromAttackPath(1, 100, 5, 10).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/attack-paths/5/vulnerabilities/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockRisk);
  });

  it('should add mitigation', () => {
    const mit: RiskMitigation = { description: 'Mitigate' };
    service.addMitigation(1, 100, mit).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/mitigations');
    expect(req.request.method).toBe('POST');
    req.flush(mockRisk);
  });

  it('should update mitigation', () => {
    const mit: RiskMitigation = { description: 'Updated Mitigate' };
    service.updateMitigation(1, 100, 50, mit).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/mitigations/50');
    expect(req.request.method).toBe('PUT');
    req.flush(mockRisk);
  });

  it('should delete mitigation', () => {
    service.deleteMitigation(1, 100, 50).subscribe(res => expect(res).toEqual(mockRisk));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/risks/100/mitigations/50');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockRisk);
  });
});
