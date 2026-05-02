import { Component, OnInit } from "@angular/core";
import { Product } from "../../../core/models/product.model";
import { ProductService } from "../../../core/services/product.service";

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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllForAdmin(this.currentPage, this.pageSize).subscribe({
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

  deactivate(id: number): void {
    if (!confirm("Désactiver ce produit ?")) return;
    this.productService.deactivate(id).subscribe(() => this.loadProducts());
  }

  activate(id: number): void {
    if (!confirm("Activer ce produit ?")) return;
    this.productService.activate(id).subscribe(() => this.loadProducts());
  }
}
