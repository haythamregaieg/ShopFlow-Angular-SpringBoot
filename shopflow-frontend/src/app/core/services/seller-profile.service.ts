import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { SellerProfile, SellerProfileRequest } from '../models/seller-profile.model';

@Injectable({ providedIn: 'root' })
export class SellerProfileService {
  private apiUrl = 'https://scarecrow-erratic-pessimist.ngrok-free.dev/api/seller-profiles';
  private profileRefreshSubject = new Subject<SellerProfile>();
  profileRefresh$ = this.profileRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<SellerProfile> {
    return this.http.get<SellerProfile>(`${this.apiUrl}/me`);
  }

  updateMyProfile(request: SellerProfileRequest): Observable<SellerProfile> {
    return this.http.put<SellerProfile>(`${this.apiUrl}/me`, request).pipe(
      tap(profile => this.profileRefreshSubject.next(profile))
    );
  }
}
