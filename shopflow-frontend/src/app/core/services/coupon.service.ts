import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponRequest } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private apiUrl = 'http://localhost:8081/api/coupons';

  constructor(private http: HttpClient) {}

  getAllForSeller(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  create(request: CouponRequest): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, request);
  }

  update(id: number, request: CouponRequest): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
