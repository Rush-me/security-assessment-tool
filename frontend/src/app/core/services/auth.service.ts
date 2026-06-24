import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConfigService } from './config.service';

export interface UserDto {
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;

  currentUser = signal<UserDto | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  userRole = computed(() => this.currentUser()?.role || '');

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.getApiUrl()}/api/auth`;
    // Restore session from localStorage on boot
    const stored = localStorage.getItem('isra_user');
    if (stored) {
      try { this.currentUser.set(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }

  login(credentials: { username: string; password: string }): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => this.setSession(user)),
      catchError(err => throwError(() => err.error || 'Authentication failed.'))
    );
  }

  register(userData: { username: string; email: string; password: string }): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => this.setSession(user)),
      catchError(err => throwError(() => err.error || 'Registration failed.'))
    );
  }

  logout() {
    localStorage.removeItem('isra_user');
    this.currentUser.set(null);
  }

  private setSession(user: UserDto) {
    localStorage.setItem('isra_user', JSON.stringify(user));
    this.currentUser.set(user);
  }
}
