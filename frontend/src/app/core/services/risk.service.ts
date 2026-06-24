import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessAsset, SupportingAsset } from './asset.service';
import { Vulnerability } from './vulnerability.service';

export interface RiskVulnerabilityRef {
  id?: number;
  vulnerability: Vulnerability;
  score?: number;
  name?: string;
}

export interface RiskAttackPath {
  id?: number;
  attackPathId?: number;
  attackPathName?: string;
  attackPathScore?: number;
  vulnerabilityRefs?: RiskVulnerabilityRef[];
}

export interface RiskMitigation {
  id?: number;
  mitigationId?: number;
  description?: string;
  benefits?: number;
  cost?: number;
  decision?: string;
  decisionDetail?: string;
}

export interface Risk {
  id?: number;
  riskId?: number;
  riskName?: string;
  threatAgent?: string;
  threatAgentDetail?: string;
  threatVerb?: string;
  threatVerbDetail?: string;
  motivation?: string;
  motivationDetail?: string;
  businessAssetRef?: BusinessAsset | null;
  supportingAssetRef?: SupportingAsset | null;
  isAutomaticRiskName?: boolean;
  
  // Likelihood
  riskLikelihood?: number;
  riskLikelihoodDetail?: string;
  skillLevel?: number;
  reward?: number;
  accessResources?: number;
  size?: number;
  intrusionDetection?: number;
  threatFactorScore?: number;
  threatFactorLevel?: string;
  occurrence?: number;
  occurrenceLevel?: string;
  isOwaspLikelihood?: boolean;

  // Impact Flags
  riskImpact?: number;
  confidentialityFlag?: number;
  integrityFlag?: number;
  availabilityFlag?: number;
  authenticityFlag?: number;
  authorizationFlag?: number;
  nonRepudiationFlag?: number;

  // Aggregate Scores
  allAttackPathsName?: string;
  allAttackPathsScore?: number;
  inherentRiskScore?: number;
  mitigationsBenefits?: number;
  mitigationsDoneBenefits?: number;
  mitigatedRiskScore?: number;

  // Management Decisions
  riskManagementDecision?: string;
  riskManagementDetail?: string;
  residualRiskScore?: number;
  residualRiskLevel?: string;

  riskAttackPaths?: RiskAttackPath[];
  riskMitigations?: RiskMitigation[];
}

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  private baseUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.baseUrl = `${this.configService.getApiUrl()}/api/projects`;
  }

  getRisks(projectId: number): Observable<Risk[]> {
    return this.http.get<Risk[]>(`${this.baseUrl}/${projectId}/risks`);
  }

  addRisk(projectId: number, risk: Risk): Observable<Risk> {
    return this.http.post<Risk>(`${this.baseUrl}/${projectId}/risks`, risk);
  }

  updateRisk(projectId: number, id: number, risk: Risk): Observable<Risk> {
    return this.http.put<Risk>(`${this.baseUrl}/${projectId}/risks/${id}`, risk);
  }

  batchUpdateRisks(projectId: number, risks: Risk[]): Observable<Risk[]> {
    return this.http.put<Risk[]>(`${this.baseUrl}/${projectId}/risks/batch`, risks);
  }

  deleteRisk(projectId: number, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${projectId}/risks/${id}`);
  }

  // Attack Path operations
  addAttackPath(projectId: number, riskId: number): Observable<Risk> {
    return this.http.post<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/attack-paths`, {});
  }

  deleteAttackPath(projectId: number, riskId: number, pathId: number): Observable<Risk> {
    return this.http.delete<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/attack-paths/${pathId}`);
  }

  addVulnerabilityToAttackPath(projectId: number, riskId: number, pathId: number, vulnerabilityId: number): Observable<Risk> {
    return this.http.post<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/attack-paths/${pathId}/vulnerabilities?vulnerabilityId=${vulnerabilityId}`, {});
  }

  removeVulnerabilityFromAttackPath(projectId: number, riskId: number, pathId: number, refId: number): Observable<Risk> {
    return this.http.delete<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/attack-paths/${pathId}/vulnerabilities/${refId}`);
  }

  // Mitigation operations
  addMitigation(projectId: number, riskId: number, mitigation: RiskMitigation): Observable<Risk> {
    return this.http.post<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/mitigations`, mitigation);
  }

  updateMitigation(projectId: number, riskId: number, mitId: number, mitigation: RiskMitigation): Observable<Risk> {
    return this.http.put<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/mitigations/${mitId}`, mitigation);
  }

  deleteMitigation(projectId: number, riskId: number, mitId: number): Observable<Risk> {
    return this.http.delete<Risk>(`${this.baseUrl}/${projectId}/risks/${riskId}/mitigations/${mitId}`);
  }
}
