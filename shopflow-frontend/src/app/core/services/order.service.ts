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

  addOrder(payload: { addressId?: number; adresseTexte?: string; ville?: string; codePostal?: string; pays?: string }): Observable<Order> {
    return this.createOrder(payload);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`);
  }

  GetMyOrders(): Observable<Order[]> {
    return this.getMyOrders();
  }

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/seller`);
  }

  GetSellerOrders(): Observable<Order[]> {
    return this.getSellerOrders();
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.getById(id);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  GetAllOrders(): Observable<Order[]> {
    return this.getAllOrders();
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  updateOrderCancel(id: number): Observable<Order> {
    return this.cancelOrder(id);
  }

  markAsSeen(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/seen`, {});
  }

  updateOrderSeen(id: number): Observable<Order> {
    return this.markAsSeen(id);
  }

  markAsSeenBySeller(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/seller-seen`, {});
  }

  updateOrderSeenBySeller(id: number): Observable<Order> {
    return this.markAsSeenBySeller(id);
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  updateOrderStatus(status: string, id: number): Observable<Order> {
    return this.updateStatus(id, status);
  }
}
