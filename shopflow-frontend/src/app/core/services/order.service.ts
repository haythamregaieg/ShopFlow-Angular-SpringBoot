import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { Order } from "../models/order.model";

@Injectable({ providedIn: "root" })
export class OrderService {
  private apiUrl = "http://localhost:8081/api/orders";
  notificationRefreshSubject = new Subject<void>();

  constructor(private http: HttpClient) {}

  notificationRefresh$ = this.notificationRefreshSubject.asObservable();

  createOrder(payload: { addressId?: number; adresseTexte?: string; ville?: string; codePostal?: string; pays?: string }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, payload);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`);
  }

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/seller`);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  markAsSeen(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/seen`, {});
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}
