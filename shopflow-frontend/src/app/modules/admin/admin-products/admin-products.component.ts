import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Product, PageResponse } from "../../../core/models/product.model";

@Component({
  selector: "app-admin-products",
  templateUrl: "./admin-products.component.html",
  styleUrls: ["./admin-products.component.css"]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    const url = `http://localhost:8081/api/products?page=${this.currentPage}&size=${this.pageSize}`;
    this.http.get<PageResponse<Product>>(url).subscribe({
      next: (page) => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  delete(id: number): void {
    if (confirm("Désactiver ce produit ?")) {
      this.http.delete(`http://localhost:8081/api/products/${id}`).subscribe(() => {
        // Recharge la page courante après suppression
        this.loadProducts();
      });
    }
  }
}
