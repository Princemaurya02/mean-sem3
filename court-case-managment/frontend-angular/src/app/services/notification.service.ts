import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notification, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  getNotifications(isRead?: boolean): Observable<ApiResponse<Notification[]>> {
    const url = isRead !== undefined ? `${this.apiUrl}?isRead=${isRead}` : this.apiUrl;
    return this.http.get<ApiResponse<Notification[]>>(url).pipe(
      tap(response => {
        if (response.success && response.unreadCount !== undefined) {
          this.unreadCountSubject.next(response.unreadCount);
        }
      })
    );
  }

  markAsRead(id: string): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  deleteNotification(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  private loadUnreadCount(): void {
    this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}?isRead=false`)
      .subscribe(response => {
        if (response.success && response.unreadCount !== undefined) {
          this.unreadCountSubject.next(response.unreadCount);
        }
      });
  }
}
