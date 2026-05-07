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

  GetAllCoupons(): Observable<Coupon[]> {
    return this.getAllForSeller();
  }

  create(request: CouponRequest): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, request);
  }

  addCoupon(request: CouponRequest): Observable<Coupon> {
    return this.create(request);
  }

  update(id: number, request: CouponRequest): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, request);
  }

  updateCoupon(request: CouponRequest, id: number): Observable<Coupon> {
    return this.update(id, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.delete(id);
  }
}
