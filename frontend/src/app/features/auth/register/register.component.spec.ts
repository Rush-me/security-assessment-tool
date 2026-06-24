import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: Router;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router);
    spyOn(routerSpy, 'navigate');
    snackBarSpy = snackSpy;
    (component as any).snackBar = snackBarSpy;
    fixture.detectChanges();
  });

  it('should create and initialize registerForm', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('username')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
  });

  it('should validate form constraints', () => {
    const form = component.registerForm;
    expect(form.valid).toBeFalse();

    form.get('username')!.setValue('al');
    expect(form.get('username')!.hasError('minlength')).toBeTrue();

    form.get('username')!.setValue('alice');
    expect(form.get('username')!.valid).toBeTrue();

    form.get('email')!.setValue('invalid-email');
    expect(form.get('email')!.hasError('email')).toBeTrue();

    form.get('email')!.setValue('alice@example.com');
    expect(form.get('email')!.valid).toBeTrue();

    form.get('password')!.setValue('12345');
    expect(form.get('password')!.hasError('minlength')).toBeTrue();

    form.get('password')!.setValue('123456');
    expect(form.get('password')!.valid).toBeTrue();

    expect(form.valid).toBeTrue();
  });

  it('should not call authService.register if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should handle successful registration', () => {
    const form = component.registerForm;
    form.get('username')!.setValue('alice');
    form.get('email')!.setValue('alice@example.com');
    form.get('password')!.setValue('password');

    const mockUser = { username: 'alice', email: 'alice@example.com', role: 'USER' };
    authServiceSpy.register.and.returnValue(of(mockUser));

    component.onSubmit();

    expect(component.isLoading()).toBeFalse();
    expect(authServiceSpy.register).toHaveBeenCalledWith({ username: 'alice', email: 'alice@example.com', password: 'password' });
    expect(snackBarSpy.open).toHaveBeenCalledWith('Account created! Welcome, alice!', 'Dismiss', jasmine.any(Object));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle failed registration', () => {
    const form = component.registerForm;
    form.get('username')!.setValue('alice');
    form.get('email')!.setValue('alice@example.com');
    form.get('password')!.setValue('password');

    authServiceSpy.register.and.returnValue(throwError(() => ({ error: 'Username taken' })));

    component.onSubmit();

    expect(component.isLoading()).toBeFalse();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Username taken', 'Dismiss', jasmine.any(Object));
  });
});
