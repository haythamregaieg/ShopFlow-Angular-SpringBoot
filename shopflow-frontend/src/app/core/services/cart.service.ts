import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cart } from "../models/cart.model";

@Injectable({ providedIn: "root" })
export class CartService {
  private apiUrl = "http://localhost:8081/api/cart";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl, { headers: this.getHeaders() });
  }

  addItem(productId: number, quantite: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantite }, { headers: this.getHeaders() });
  }

  updateItem(itemId: number, quantite: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}?quantite=${quantite}`, {}, { headers: this.getHeaders() });
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`, { headers: this.getHeaders() });
  }

  applyCoupon(code: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/coupon?code=${code}`, {}, { headers: this.getHeaders() });
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/coupon`, { headers: this.getHeaders() });
  }
}