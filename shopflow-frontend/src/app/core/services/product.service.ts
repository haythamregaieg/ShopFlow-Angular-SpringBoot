import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product, ProductRequest, PageResponse } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class ProductService {
  private apiUrl = "http://localhost:8081/api/products";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return token ? new HttpHeaders({ Authorization: "Bearer " + token }) : new HttpHeaders();
  }

  getAll(page = 0, size = 12): Observable<PageResponse<Product>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  search(q: string, prixMin?: number, prixMax?: number): Observable<PageResponse<Product>> {
    let params = new HttpParams().set("q", q);
    if (prixMin) params = params.set("prixMin", prixMin);
    if (prixMax) params = params.set("prixMax", prixMax);
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/search`, { params });
  }

  create(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, { headers: this.getHeaders() });
  }

  update(id: number, product: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}