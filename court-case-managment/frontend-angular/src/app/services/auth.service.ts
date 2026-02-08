import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(user: User): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`);
  }

  updateProfile(updates: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/updateProfile`, updates);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
