import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getUserFromStorage());

  currentUser$ = this.currentUserSubject.asObservable();
//partager les données utilisateur,détecter login/logout en temps réel
  constructor(private http: HttpClient) {}

  private getUserFromStorage(): AuthResponse | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.accessToken);
        this.currentUserSubject.next(response);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.accessToken);
        this.currentUserSubject.next(response);
      })
    );
  }

  registerSeller(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register-seller`, request).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response));
        localStorage.setItem('token', response.accessToken);
        this.currentUserSubject.next(response);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string; token: string }> {
    return this.http.post<{ message: string; token: string }>(`${this.apiUrl}/forgot-password?email=${encodeURIComponent(email)}`, {});
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    return this.currentUserSubject.value?.role || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
