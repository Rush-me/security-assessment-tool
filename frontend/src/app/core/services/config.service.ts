import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  getApiUrl(): string {
    // Check if we are running in Electron and the preload script injected electronAPI
    if (window && (window as any).electronAPI && typeof (window as any).electronAPI.getApiPort === 'function') {
      const port = (window as any).electronAPI.getApiPort();
      if (port) {
        return `http://localhost:${port}`;
      }
    }
    // Fallback for standard Angular dev mode
    return 'http://localhost:8080';
  }
}
