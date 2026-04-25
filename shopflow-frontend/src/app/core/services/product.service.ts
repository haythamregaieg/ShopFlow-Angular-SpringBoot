import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product, ProductRequest, PageResponse, ProductSearchParams, ProductVariant } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class ProductService {
  private apiUrl = "http://localhost:8081/api/products";

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12): Observable<PageResponse<Product>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  search(paramsInput: ProductSearchParams): Observable<PageResponse<Product>> {
    let params = new HttpParams();
    if (paramsInput.q) params = params.set("q", paramsInput.q);
    if (paramsInput.prixMin !== undefined && paramsInput.prixMin !== null) params = params.set("prixMin", paramsInput.prixMin);
    if (paramsInput.prixMax !== undefined && paramsInput.prixMax !== null) params = params.set("prixMax", paramsInput.prixMax);
    if (paramsInput.promoOnly) params = params.set("promoOnly", "true");
    if (paramsInput.sortBy) params = params.set("sortBy", paramsInput.sortBy);
    if (paramsInput.page !== undefined) params = params.set("page", paramsInput.page);
    if (paramsInput.size !== undefined) params = params.set("size", paramsInput.size);
    (paramsInput.categoryIds || []).forEach(id => {
      params = params.append("categoryIds", id);
    });
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/search`, { params });
  }

  create(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVariants(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.apiUrl}/${productId}/variants`);
  }

  createVariant(productId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.apiUrl}/${productId}/variants`, variant);
  }

  updateVariant(productId: number, variantId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.apiUrl}/${productId}/variants/${variantId}`, variant);
  }

  deleteVariant(productId: number, variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/variants/${variantId}`);
  }
}
