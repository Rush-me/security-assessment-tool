import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: Router;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
    snackBarSpy = snackSpy;
    (component as any).snackBar = snackBarSpy;
    fixture.detectChanges();
  });

  it('should create and initialize loginForm', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('username')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate password length', () => {
    const password = component.loginForm.get('password')!;
    password.setValue('123');
    expect(password.valid).toBeFalse();
    expect(password.hasError('minlength')).toBeTrue();

    password.setValue('1234');
    expect(password.valid).toBeTrue();
  });

  it('should not call authService.login if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should handle successful login', () => {
    component.loginForm.get('username')!.setValue('alice');
    component.loginForm.get('password')!.setValue('password');
    
    const mockUser = { username: 'alice', email: 'alice@example.com', role: 'USER' };
    authServiceSpy.login.and.returnValue(of(mockUser));

    component.onSubmit();

    expect(component.isLoading()).toBeFalse();
    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'alice', password: 'password' });
    expect(snackBarSpy.open).toHaveBeenCalledWith('Welcome back, alice!', 'Dismiss', jasmine.any(Object));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle failed login', () => {
    component.loginForm.get('username')!.setValue('alice');
    component.loginForm.get('password')!.setValue('password');

    authServiceSpy.login.and.returnValue(throwError(() => ({ error: 'Wrong password' })));

    component.onSubmit();

    expect(component.isLoading()).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Wrong password', 'Dismiss', jasmine.any(Object));
  });
});
