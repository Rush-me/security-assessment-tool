import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusinessAsset {
  id?: number;
  assetId?: number;
  assetName: string;
  assetType?: string;
  assetDescription?: string;
  confidentiality: number;
  integrity: number;
  availability: number;
  authenticity: number;
  authorization: number;
  nonRepudiation: number;
}

export interface SupportingAsset {
  id?: number;
  assetId?: number;
  hldId?: string;
  assetName: string;
  assetType?: string;
  securityLevel?: number;
  businessAssets?: BusinessAsset[];
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private baseUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.baseUrl = `${this.configService.getApiUrl()}/api/projects`;
  }

  // Business Assets API
  getBusinessAssets(projectId: number): Observable<BusinessAsset[]> {
    return this.http.get<BusinessAsset[]>(`${this.baseUrl}/${projectId}/business-assets`);
  }

  addBusinessAsset(projectId: number, asset: BusinessAsset): Observable<BusinessAsset> {
    return this.http.post<BusinessAsset>(`${this.baseUrl}/${projectId}/business-assets`, asset);
  }

  updateBusinessAsset(projectId: number, id: number, asset: BusinessAsset): Observable<BusinessAsset> {
    return this.http.put<BusinessAsset>(`${this.baseUrl}/${projectId}/business-assets/${id}`, asset);
  }

  deleteBusinessAsset(projectId: number, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${projectId}/business-assets/${id}`);
  }

  // Supporting Assets API
  getSupportingAssets(projectId: number): Observable<SupportingAsset[]> {
    return this.http.get<SupportingAsset[]>(`${this.baseUrl}/${projectId}/supporting-assets`);
  }

  addSupportingAsset(projectId: number, asset: SupportingAsset): Observable<SupportingAsset> {
    return this.http.post<SupportingAsset>(`${this.baseUrl}/${projectId}/supporting-assets`, asset);
  }

  updateSupportingAsset(projectId: number, id: number, asset: SupportingAsset): Observable<SupportingAsset> {
    return this.http.put<SupportingAsset>(`${this.baseUrl}/${projectId}/supporting-assets/${id}`, asset);
  }

  deleteSupportingAsset(projectId: number, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${projectId}/supporting-assets/${id}`);
  }
}
