import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const rSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should return true when user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

    expect(result).toBeTrue();
  });

  it('should redirect to login when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(null as any, null as any));

    expect(result).toBe(mockUrlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
