import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AiStatusService } from './ai-status.service';
import { ConfigService } from './config.service';

describe('AiStatusService', () => {
  let service: AiStatusService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AiStatusService,
        ConfigService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AiStatusService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // Flush initial creation poll
    const req = httpMock.expectOne('http://localhost:8080/api/ai/status?refresh=false');
    req.flush({ status: 'not-configured', message: 'Not Configured' });
    expect(service).toBeTruthy();
  });

  it('should fetch status on creation and update signal', () => {
    const req = httpMock.expectOne('http://localhost:8080/api/ai/status?refresh=false');
    expect(req.request.method).toBe('GET');

    req.flush({ status: 'available', message: 'Online' });

    expect(service.aiState()).toBe('available');
    expect(service.statusMessage()).toBe('Online');
  });

  it('should handle errors gracefully and set status to offline', () => {
    const req = httpMock.expectOne('http://localhost:8080/api/ai/status?refresh=false');
    req.flush({ message: 'Service Unavailable' }, { status: 503, statusText: 'Service Unavailable' });

    expect(service.aiState()).toBe('offline');
    expect(service.statusMessage()).toBe('Service Unavailable');
  });
});
