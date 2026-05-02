import { Component, OnInit } from '@angular/core';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategoryId = '';
  loadingProducts = false;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories || [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  loadProducts(categoryId?: number): void {
    this.loadingProducts = true;
    const request = categoryId
      ? this.productService.search({ categoryIds: [categoryId], page: 0, size: 8, sortBy: 'popularite' })
      : this.productService.getAll(0, 8);

    request.subscribe({
      next: (response) => {
        this.products = response?.content || [];
        this.products.forEach(p => {
          const imgs = this.parseImageList((p as any).images);
          (p as any)._thumbnail = imgs.length > 0 ? imgs[0] : null;
        });
        this.loadingProducts = false;
      },
      error: () => {
        this.products = [];
        this.loadingProducts = false;
      }
    });
  }

  private parseImageList(images?: any): string[] {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images !== 'string') return [];
    const imgs = images.split(',').map((s: string) => s.trim()).filter(Boolean);
    return imgs.filter((s: string) =>
      s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')
    );
  }

  onCategoryChange(event: Event): void {
    const selected = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId = selected;
    this.loadProducts(selected ? Number(selected) : undefined);
  }

  getDisplayPrice(product: Product): number {
    return product.prixPromo ?? product.prix;
  }

  getPromoPercent(product: Product): number {
    if (!product.prixPromo) return 0;
    return Math.round((1 - product.prixPromo / product.prix) * 100);
  }
}
