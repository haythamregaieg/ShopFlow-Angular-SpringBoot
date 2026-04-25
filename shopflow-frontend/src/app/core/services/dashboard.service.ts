import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private apiUrl = "http://localhost:8081/api/dashboard";

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin`);
  }

  getSellerStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seller`);
  }

  getCustomerStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customer`);
  }
}
