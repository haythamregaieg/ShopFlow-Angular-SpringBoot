import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Order } from "../models/order.model";

@Injectable({ providedIn: "root" })
export class OrderService {
  private apiUrl = "http://localhost:8081/api/orders";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
  }

  createOrder(addressId: number): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, { addressId }, { headers: this.getHeaders() });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() });
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status?status=${status}`, {}, { headers: this.getHeaders() });
  }
}