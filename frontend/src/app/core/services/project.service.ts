import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IsraProject {
  id?: number;
  projectName: string;
  projectVersion?: string;
  projectOrganization?: string;
  classification?: string;
  schemaVersion?: number;
  iteration?: number;
  projectContext?: any;
  trackingList?: any[];
  businessAssets?: any[];
  supportingAssets?: any[];
  vulnerabilities?: any[];
  risks?: any[];
  createdAt?: string;
  updatedAt?: string;
}

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl: string;
  
  // Shared active project state signal
  activeProject = signal<IsraProject | null>(null);

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.getApiUrl()}/api/projects`;
  }

  getProjects(): Observable<IsraProject[]> {
    return this.http.get<IsraProject[]>(this.apiUrl);
  }

  getProject(id: number): Observable<IsraProject> {
    return this.http.get<IsraProject>(`${this.apiUrl}/${id}`);
  }

  createProject(project: IsraProject): Observable<IsraProject> {
    return this.http.post<IsraProject>(this.apiUrl, project);
  }

  updateProject(id: number, project: IsraProject): Observable<IsraProject> {
    return this.http.put<IsraProject>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateProjectContext(projectId: number, context: any): Observable<IsraProject> {
    return this.http.put<IsraProject>(`${this.apiUrl}/${projectId}/context`, context);
  }

  uploadContextAttachment(projectId: number, file: File): Observable<IsraProject> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IsraProject>(`${this.apiUrl}/${projectId}/context/attachment`, formData);
  }

  downloadContextAttachment(projectId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${projectId}/context/attachment`, {
      responseType: 'blob'
    });
  }
}
