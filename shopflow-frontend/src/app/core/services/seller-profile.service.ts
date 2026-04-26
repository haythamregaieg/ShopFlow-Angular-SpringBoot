import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SellerProfile, SellerProfileRequest } from '../models/seller-profile.model';

@Injectable({ providedIn: 'root' })
export class SellerProfileService {
  private apiUrl = 'http://localhost:8081/api/seller-profiles';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<SellerProfile> {
    return this.http.get<SellerProfile>(`${this.apiUrl}/me`);
  }

  updateMyProfile(request: SellerProfileRequest): Observable<SellerProfile> {
    return this.http.put<SellerProfile>(`${this.apiUrl}/me`, request);
  }
}
