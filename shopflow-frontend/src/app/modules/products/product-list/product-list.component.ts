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