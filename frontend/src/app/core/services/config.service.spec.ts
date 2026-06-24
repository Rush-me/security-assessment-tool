import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
    // Cleanup any mocked window.electronAPI
    delete (window as any).electronAPI;
  });

  afterEach(() => {
    delete (window as any).electronAPI;
  });

  it('should return default fallback URL if electronAPI is not present', () => {
    expect(service.getApiUrl()).toBe('http://localhost:8080');
  });

  it('should return electronAPI based URL if electronAPI.getApiPort() is available', () => {
    (window as any).electronAPI = {
      getApiPort: () => 9091
    };
    expect(service.getApiUrl()).toBe('http://localhost:9091');
  });

  it('should return default fallback URL if electronAPI.getApiPort() returns undefined', () => {
    (window as any).electronAPI = {
      getApiPort: () => undefined
    };
    expect(service.getApiUrl()).toBe('http://localhost:8080');
  });
});
