import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, UserDto } from './auth.service';
import { ConfigService } from './config.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  const mockUser: UserDto = {
    username: 'alice',
    email: 'alice@example.com',
    role: 'USER'
  };

  beforeEach(() => {
    localStorage.clear();
    const configSpy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    configSpy.getApiUrl.and.returnValue('http://localhost:8080');

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should be created and restore user from localStorage on boot as null if empty', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.userRole()).toBe('');
  });

  it('should boot restore user from localStorage if present', () => {
    localStorage.setItem('isra_user', JSON.stringify(mockUser));
    const configSpy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    configSpy.getApiUrl.and.returnValue('http://localhost:8080');

    const httpClient = TestBed.inject(HttpClient);
    const localService = new AuthService(httpClient, configSpy);
    expect(localService.currentUser()).toEqual(mockUser);
    expect(localService.isAuthenticated()).toBeTrue();
    expect(localService.userRole()).toBe('USER');
  });

  it('should login successfully and save session', () => {
    const creds = { username: 'alice', password: 'password' };
    service.login(creds).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
      expect(JSON.parse(localStorage.getItem('isra_user')!)).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creds);
    req.flush(mockUser);
  });

  it('should fail login and propagate error message', () => {
    const creds = { username: 'alice', password: 'wrong' };
    service.login(creds).subscribe({
      next: () => fail('Login should have failed'),
      error: err => {
        expect(err).toBe('Invalid credentials');
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBeFalse();
      }
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/auth/login');
    req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
  });

  it('should register successfully and save session', () => {
    const data = { username: 'alice', email: 'alice@example.com', password: 'password' };
    service.register(data).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
      expect(JSON.parse(localStorage.getItem('isra_user')!)).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(mockUser);
  });

  it('should fail registration and propagate error message', () => {
    const data = { username: 'alice', email: 'alice@example.com', password: 'password' };
    service.register(data).subscribe({
      next: () => fail('Registration should have failed'),
      error: err => {
        expect(err).toBe('Username taken');
        expect(service.currentUser()).toBeNull();
      }
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/auth/register');
    req.flush('Username taken', { status: 400, statusText: 'Bad Request' });
  });

  it('should logout and clear session', () => {
    localStorage.setItem('isra_user', JSON.stringify(mockUser));
    service.currentUser.set(mockUser);

    service.logout();
    expect(localStorage.getItem('isra_user')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
