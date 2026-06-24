import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { catchError, of } from 'rxjs';

export type AiState = 'available' | 'offline' | 'not-configured';

interface AiStatusResponse {
  status: AiState;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiStatusService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private destroyRef = inject(DestroyRef);

  private baseUrl = this.configService.getApiUrl();

  aiState = signal<AiState>('not-configured');
  statusMessage = signal<string>('Initializing AI assist status...');

  private pollIntervalId: any;

  constructor() {
    this.check(false);
    this.pollIntervalId = setInterval(() => {
      this.check(false);
    }, 15000); // poll every 15s fallback

    // Add browser status listeners
    window.addEventListener('online', () => this.check(true));
    window.addEventListener('offline', () => this.aiState.set('offline'));

    this.destroyRef.onDestroy(() => {
      if (this.pollIntervalId) {
        clearInterval(this.pollIntervalId);
      }
    });
  }

  check(forceRefresh = false): void {
    this.http.get<AiStatusResponse>(`${this.baseUrl}/api/ai/status?refresh=${forceRefresh}`)
      .pipe(
        catchError((err) => {
          const fallbackMsg = (err.status === 503 && err.error && err.error.message)
            ? err.error.message
            : 'Cannot reach the AI status endpoint.';
          return of({ status: 'offline' as AiState, message: fallbackMsg });
        })
      )
      .subscribe((res) => {
        this.aiState.set(res.status);
        if (res.status === 'available') {
          this.statusMessage.set(res.message);
        } else if (res.status === 'not-configured') {
          this.statusMessage.set('AI Assist feature is not configured (ISRA_AI_API_KEY environment variable is missing).');
        } else {
          this.statusMessage.set(res.message || 'AI service is offline.');
        }
      });
  }
}
