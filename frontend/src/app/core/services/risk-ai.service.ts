import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface ThreatSuggestion {
  threatAgent: string;
  threatVerb: string;
  motivation: string;
  rationale: string;
}

export interface ThreatSuggestionResponse {
  suggestions: ThreatSuggestion[];
}

export interface VulnerabilitySuggestion {
  vulnerabilityName: string;
  vulnerabilityFamily: string;
  vulnerabilityDescription: string;
  estimatedCveScore: number;
  rationale: string;
}

export interface VulnerabilitySuggestionResponse {
  suggestions: VulnerabilitySuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class RiskAiService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private baseUrl = this.configService.getApiUrl();

  suggestThreats(businessAssetId: number | null, supportingAssetId: number | null): Observable<ThreatSuggestionResponse> {
    return this.http.post<ThreatSuggestionResponse>(`${this.baseUrl}/api/ai/suggest-threats`, {
      businessAssetId,
      supportingAssetId
    });
  }

  suggestVulnerabilities(supportingAssetId: number | null): Observable<VulnerabilitySuggestionResponse> {
    return this.http.post<VulnerabilitySuggestionResponse>(`${this.baseUrl}/api/ai/suggest-vulnerabilities`, {
      supportingAssetId
    });
  }
}
