import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';

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
  prixMin?: number;
  prixMax?: number;
  promoOnly = false;
  sortBy: 'prix_asc' | 'prix_desc' | 'popularite' | 'nouveautes' = 'nouveautes';
  categories: Category[] = [];
  selectedCategoryIds: number[] = [];
  pageSize = 12;
  loading = false;
  isLoggedIn = false;
  isAdmin = false;
  isSeller = false;
  message = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.isSeller = this.authService.getRole() === 'SELLER';
    this.categoryService.getAll().subscribe(c => this.categories = c || []);
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.search({
      q: this.searchQuery || undefined,
      prixMin: this.prixMin,
      prixMax: this.prixMax,
      categoryIds: this.selectedCategoryIds,
      promoOnly: this.promoOnly,
      sortBy: this.sortBy,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (page) => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  search(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.prixMin = undefined;
    this.prixMax = undefined;
    this.promoOnly = false;
    this.sortBy = 'nouveautes';
    this.selectedCategoryIds = [];
    this.currentPage = 0;
    this.loadProducts();
  }

  toggleCategory(categoryId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedCategoryIds.includes(categoryId)) {
        this.selectedCategoryIds.push(categoryId);
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    }
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(product.id, 1).subscribe({
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