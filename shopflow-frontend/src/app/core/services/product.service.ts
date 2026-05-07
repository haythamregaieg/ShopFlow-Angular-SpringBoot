import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product, ProductRequest, PageResponse, ProductSearchParams, ProductVariant } from "../models/product.model";

@Injectable({ providedIn: "root" })
export class ProductService {
  private apiUrl = "http://localhost:8081/api/products";

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12): Observable<PageResponse<Product>> {
    const params = new HttpParams().set("page", String(page)).set("size", String(size));
    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }

  GetAllProducts(page = 0, size = 12): Observable<PageResponse<Product>> {
    return this.getAll(page, size);
  }

  getAllForAdmin(page = 0, size = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams().set("page", String(page)).set("size", String(size));
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/all`, { params });
  }

  GetAllProductsForAdmin(page = 0, size = 20): Observable<PageResponse<Product>> {
    return this.getAllForAdmin(page, size);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductById(id: number): Observable<Product> {
    return this.getById(id);
  }

  search(paramsInput: ProductSearchParams): Observable<PageResponse<Product>> {
    let params = new HttpParams();
    if (paramsInput.q) params = params.set("q", paramsInput.q);
    if (paramsInput.prixMin !== undefined && paramsInput.prixMin !== null) params = params.set("prixMin", String(paramsInput.prixMin));
    if (paramsInput.prixMax !== undefined && paramsInput.prixMax !== null) params = params.set("prixMax", String(paramsInput.prixMax));
    if (paramsInput.promoOnly) params = params.set("promoOnly", "true");
    if (paramsInput.sortBy) params = params.set("sortBy", paramsInput.sortBy);
    if (paramsInput.page !== undefined) params = params.set("page", String(paramsInput.page));
    if (paramsInput.size !== undefined) params = params.set("size", String(paramsInput.size));
    (paramsInput.categoryIds || []).forEach(id => {
      params = params.append("categoryIds", String(id));
    });
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/search`, { params });
  }

  searchProducts(paramsInput: ProductSearchParams): Observable<PageResponse<Product>> {
    return this.search(paramsInput);
  }

  create(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  addProduct(product: ProductRequest): Observable<Product> {
    return this.create(product);
  }

  update(id: number, product: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  updateProduct(product: ProductRequest, id: number): Observable<Product> {
    return this.update(id, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(id: number): Observable<void> {
    return this.delete(id);
  }

  deactivate(id: number): Observable<void> {
    return this.delete(id);
  }

  deactivateProduct(id: number): Observable<void> {
    return this.deactivate(id);
  }

  activate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  activateProduct(id: number): Observable<void> {
    return this.activate(id);
  }

  getSellerProducts(page = 0, size = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams().set("page", String(page)).set("size", String(size));
    return this.http.get<PageResponse<Product>>(`${this.apiUrl}/seller`, { params });
  }

  GetSellerProducts(page = 0, size = 20): Observable<PageResponse<Product>> {
    return this.getSellerProducts(page, size);
  }

  getVariants(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.apiUrl}/${productId}/variants`);
  }

  GetProductVariants(productId: number): Observable<ProductVariant[]> {
    return this.getVariants(productId);
  }

  createVariant(productId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.apiUrl}/${productId}/variants`, variant);
  }

  addProductVariant(productId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.createVariant(productId, variant);
  }

  updateVariant(productId: number, variantId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.apiUrl}/${productId}/variants/${variantId}`, variant);
  }

  updateProductVariant(productId: number, variantId: number, variant: ProductVariant): Observable<ProductVariant> {
    return this.updateVariant(productId, variantId, variant);
  }

  deleteVariant(productId: number, variantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/variants/${variantId}`);
  }

  deleteProductVariant(productId: number, variantId: number): Observable<void> {
    return this.deleteVariant(productId, variantId);
  }
}
