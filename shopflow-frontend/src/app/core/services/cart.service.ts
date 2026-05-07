import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cart } from "../models/cart.model";

@Injectable({ providedIn: "root" })
export class CartService {
  private apiUrl = "http://localhost:8081/api/cart";

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  GetCart(): Observable<Cart> {
    return this.getCart();
  }

  addItem(productId: number, quantite: number, variantId?: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantite, variantId });
  }

  addCartItem(productId: number, quantite: number, variantId?: number): Observable<Cart> {
    return this.addItem(productId, quantite, variantId);
  }

  updateItem(itemId: number, quantite: number, variantId?: number): Observable<Cart> {
    const variantQuery = variantId ? `&variantId=${variantId}` : "";
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}?quantite=${quantite}${variantQuery}`, {});
  }

  updateCartItem(itemId: number, quantite: number, variantId?: number): Observable<Cart> {
    return this.updateItem(itemId, quantite, variantId);
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`);
  }

  deleteCartItem(itemId: number): Observable<Cart> {
    return this.removeItem(itemId);
  }

  applyCoupon(code: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/coupon?code=${code}`, {});
  }

  addCoupon(code: string): Observable<Cart> {
    return this.applyCoupon(code);
  }

  removeCoupon(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/coupon`);
  }

  deleteCoupon(): Observable<Cart> {
    return this.removeCoupon();
  }
}
