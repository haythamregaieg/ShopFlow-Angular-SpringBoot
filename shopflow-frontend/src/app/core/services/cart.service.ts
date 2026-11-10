import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cart } from "../models/cart.model";

@Injectable({ providedIn: "root" })
export class CartService {
  private apiUrl = "https://scarecrow-erratic-pessimist.ngrok-free.dev/api/cart";

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  addItem(productId: number, quantite: number, variantId?: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantite, variantId });
  }

  updateItem(itemId: number, quantite: number, variantId?: number): Observable<Cart> {
    const variantQuery = variantId ? `&variantId=${variantId}` : "";
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}?quantite=${quantite}${variantQuery}`, {});
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`);
  }

  applyCoupon(code: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/coupon?code=${code}`, {});
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/coupon`);
  }
}
