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
  private apiUrl = "http://localhost:8081/api/dashboard";

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/admin`);
  }

  GetAdminStats(): Observable<AdminDashboardStats> {
    return this.getAdminStats();
  }

  getSellerStats(): Observable<SellerDashboardStats> {
    return this.http.get<SellerDashboardStats>(`${this.apiUrl}/seller`);
  }

  GetSellerStats(): Observable<SellerDashboardStats> {
    return this.getSellerStats();
  }

  getCustomerStats(): Observable<CustomerDashboardStats> {
    return this.http.get<CustomerDashboardStats>(`${this.apiUrl}/customer`);
  }

  GetCustomerStats(): Observable<CustomerDashboardStats> {
    return this.getCustomerStats();
  }
}
