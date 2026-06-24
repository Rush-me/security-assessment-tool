import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should add X-Username header if user is in localStorage', () => {
    const mockUser = { username: 'john_doe' };
    localStorage.setItem('isra_user', JSON.stringify(mockUser));

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('X-Username')).toBeTrue();
    expect(req.request.headers.get('X-Username')).toBe('john_doe');
    req.flush({});
  });

  it('should not add X-Username header if user is not in localStorage', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('X-Username')).toBeFalse();
    req.flush({});
  });

  it('should not add X-Username header if user in localStorage is malformed JSON', () => {
    localStorage.setItem('isra_user', '{invalid_json');

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('X-Username')).toBeFalse();
    req.flush({});
  });
});
