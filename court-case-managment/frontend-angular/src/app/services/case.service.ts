import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Case, ApiResponse, CaseStats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = '/api/cases';

  constructor(private http: HttpClient) { }

  getAllCases(filters?: any): Observable<ApiResponse<Case[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<ApiResponse<Case[]>>(this.apiUrl, { params });
  }

  getCase(id: string): Observable<ApiResponse<Case>> {
    return this.http.get<ApiResponse<Case>>(`${this.apiUrl}/${id}`);
  }

  createCase(caseData: Partial<Case>): Observable<ApiResponse<Case>> {
    return this.http.post<ApiResponse<Case>>(this.apiUrl, caseData);
  }

  updateCase(id: string, updates: Partial<Case>): Observable<ApiResponse<Case>> {
    return this.http.put<ApiResponse<Case>>(`${this.apiUrl}/${id}`, updates);
  }

  uploadDocument(caseId: string, file: File, documentType: string): Observable<ApiResponse<Case>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    
    return this.http.post<ApiResponse<Case>>(`${this.apiUrl}/${caseId}/documents`, formData);
  }

  getCaseStats(): Observable<ApiResponse<CaseStats>> {
    return this.http.get<ApiResponse<CaseStats>>(`${this.apiUrl}/stats/dashboard`);
  }
}
