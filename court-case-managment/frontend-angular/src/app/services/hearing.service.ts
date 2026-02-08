import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hearing, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HearingService {
  private apiUrl = '/api/hearings';

  constructor(private http: HttpClient) { }

  getAllHearings(filters?: any): Observable<ApiResponse<Hearing[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<ApiResponse<Hearing[]>>(this.apiUrl, { params });
  }

  getHearing(id: string): Observable<ApiResponse<Hearing>> {
    return this.http.get<ApiResponse<Hearing>>(`${this.apiUrl}/${id}`);
  }

  scheduleHearing(hearingData: Partial<Hearing>): Observable<ApiResponse<Hearing>> {
    return this.http.post<ApiResponse<Hearing>>(this.apiUrl, hearingData);
  }

  updateHearing(id: string, updates: Partial<Hearing>): Observable<ApiResponse<Hearing>> {
    return this.http.put<ApiResponse<Hearing>>(`${this.apiUrl}/${id}`, updates);
  }

  getUpcomingHearings(): Observable<ApiResponse<Hearing[]>> {
    return this.http.get<ApiResponse<Hearing[]>>(`${this.apiUrl}/upcoming/list`);
  }

  getMonthlyCalendar(month: number, year: number): Observable<ApiResponse<Hearing[]>> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    return this.http.get<ApiResponse<Hearing[]>>(`${this.apiUrl}/calendar/monthly`, { params });
  }
}
