import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  AdminDashboardStats,
  CustomerDashboardStats,
  SellerDashboardStats
} from "../models/dashboard.model";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private apiUrl = "https://scarecrow-erratic-pessimist.ngrok-free.dev/api/dashboard";

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/admin`);
  }

  getSellerStats(): Observable<SellerDashboardStats> {
    return this.http.get<SellerDashboardStats>(`${this.apiUrl}/seller`);
  }

  getCustomerStats(): Observable<CustomerDashboardStats> {
    return this.http.get<CustomerDashboardStats>(`${this.apiUrl}/customer`);
  }
}
