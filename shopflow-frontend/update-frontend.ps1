$utf8NoBOM = New-Object System.Text.UTF8Encoding $false
$base = "src\app"

# product-list.component.ts
[System.IO.File]::WriteAllText("$PWD\$base\modules\products\product-list\product-list.component.ts", @"
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  totalPages = 0;
  currentPage = 0;
  searchQuery = '';
  loading = false;
  isLoggedIn = false;
  isAdmin = false;
  isSeller = false;
  message = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.getRole() === 'ADMIN';
    this.isSeller = this.authService.getRole() === 'SELLER';
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll(this.currentPage).subscribe({
      next: (page) => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  search(): void {
    if (!this.searchQuery.trim()) { this.loadProducts(); return; }
    this.productService.search(this.searchQuery).subscribe(page => {
      this.products = page.content;
      this.totalPages = page.totalPages;
    });
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') });
    this.http.post<any>('http://localhost:8081/api/cart/items', { productId: product.id, quantite: 1 }, { headers }).subscribe({
      next: () => {
        this.message = product.nom + ' ajoute au panier';
        setTimeout(() => this.message = '', 3000);
      },
      error: () => this.message = 'Erreur ajout panier'
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Desactiver ce produit ?')) {
      this.productService.delete(id).subscribe(() => this.loadProducts());
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) { this.currentPage = this.currentPage - 1; this.loadProducts(); }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) { this.currentPage = this.currentPage + 1; this.loadProducts(); }
  }
}
"@, $utf8NoBOM)

# product-list.component.html
[System.IO.File]::WriteAllText("$PWD\$base\modules\products\product-list\product-list.component.html", @"
<div class="products-page">
  <div class="container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Catalogue Produits</h1>
        <p class="page-subtitle">Decouvrez notre selection de produits</p>
      </div>
      <button *ngIf="isAdmin || isSeller" routerLink="/products/new/create" class="btn btn-primary btn-lg">+ Nouveau Produit</button>
    </div>

    <div class="alert alert-success" *ngIf="message">{{ message }}</div>

    <div class="search-section">
      <input class="search-input" type="text" [(ngModel)]="searchQuery" placeholder="Rechercher un produit..." (keyup.enter)="search()" />
      <button class="btn btn-primary" (click)="search()">Rechercher</button>
      <button class="btn btn-ghost" (click)="searchQuery = ''; loadProducts()">Reinitialiser</button>
    </div>

    <p class="results-count" *ngIf="!loading">{{ products.length }} produit(s)</p>

    <div class="loading" *ngIf="loading">
      <div class="spinner"></div> Chargement...
    </div>

    <div class="products-grid" *ngIf="!loading">
      <div class="product-card" *ngFor="let product of products">
        <div class="promo-tag" *ngIf="product.prixPromo">PROMO</div>
        <div class="product-image" [routerLink]="['/products', product.id]">
          <span class="product-letter">{{ product.nom.charAt(0) }}</span>
        </div>
        <div class="product-body">
          <h3 class="product-name" [routerLink]="['/products', product.id]">{{ product.nom }}</h3>
          <p class="product-seller">Par {{ product.sellerNom || 'ShopFlow' }}</p>
          <div class="product-rating" *ngIf="product.noteMoyenne">{{ product.noteMoyenne | number:'1.1-1' }}/5</div>
          <div class="product-price">
            <span class="price-promo" *ngIf="product.prixPromo">{{ product.prixPromo | number:'1.2-2' }} EUR</span>
            <span [class]="product.prixPromo ? 'price-striked' : 'price-original'">{{ product.prix | number:'1.2-2' }} EUR</span>
          </div>
          <div class="stock-status" [class]="product.stock === 0 ? 'out-stock' : 'in-stock'">
            {{ product.stock === 0 ? 'Rupture de stock' : 'En stock (' + product.stock + ')' }}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" (click)="addToCart(product)" [disabled]="product.stock === 0">Ajouter</button>
            <button class="btn btn-ghost btn-sm" [routerLink]="['/products', product.id]">Voir</button>
            <ng-container *ngIf="isAdmin || isSeller">
              <button class="btn btn-ghost btn-sm" [routerLink]="['/products', product.id, 'edit']">Edit</button>
              <button class="btn btn-danger btn-sm" (click)="deleteProduct(product.id)">Suppr</button>
            </ng-container>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && products.length === 0">
      <div class="icon">Aucun produit disponible</div>
    </div>

    <div class="pagination" *ngIf="totalPages > 1">
      <button class="btn btn-ghost" (click)="prevPage()" [disabled]="currentPage === 0">Precedent</button>
      <span class="page-info">Page {{ currentPage + 1 }} / {{ totalPages }}</span>
      <button class="btn btn-primary" (click)="nextPage()" [disabled]="currentPage === totalPages - 1">Suivant</button>
    </div>
  </div>
</div>
"@, $utf8NoBOM)

# app.component.css
[System.IO.File]::WriteAllText("$PWD\src\app\app.component.css", @"
.main-content {
  min-height: calc(100vh - 68px);
  padding-top: 68px;
}
"@, $utf8NoBOM)

Write-Host "Fichiers crees avec succes"
