import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Product, PageResponse } from "../../../core/models/product.model";

@Component({
  selector: "app-admin-products",
  templateUrl: "./admin-products.component.html",
  styleUrls: ["./admin-products.component.css"]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
  }

  ngOnInit(): void {
    this.http.get<PageResponse<Product>>("http://localhost:8081/api/products?page=0&size=100")
      .subscribe(page => this.products = page.content);
  }

  delete(id: number): void {
    if (confirm("Desactiver ce produit ?")) {
      this.http.delete(`http://localhost:8081/api/products/${id}`, { headers: this.getHeaders() })
        .subscribe(() => this.products = this.products.filter(p => p.id !== id));
    }
  }
}