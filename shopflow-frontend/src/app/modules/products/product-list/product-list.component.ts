import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product, ProductVariant } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';

interface ProductGroup {
  categoryName: string;
  products: Product[];
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  groupedProducts: ProductGroup[] = []; // ✅ FIX IMPORTANT

  totalPages = 0;
  currentPage = 0;
  totalElements = 0;

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

  variantsByProduct: Record<number, ProductVariant[]> = {};
  selectedVariantByProduct: Record<number, number | undefined> = {};

  // ✅ optimisation
  private categoryMap: Record<number, string> = {};

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

    this.categoryService.getAll().subscribe(c => {
      this.categories = c || [];

      // ✅ optimisation map
      this.categories.forEach(cat => {
        this.categoryMap[cat.id] = cat.nom;
      });

      this.loadProducts();
    });
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
        this.products = page.content || [];
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements || 0;

        this.computeGroupedProducts(); // ✅ FIX

        this.loadProductVariants(this.products);

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  // ✅ VERSION OPTIMISÉE (plus de getter)
  computeGroupedProducts(): void {
    if (!this.products.length) {
      this.groupedProducts = [];
      return;
    }

    // Pre-compute image lists and a thumbnail for each product to avoid
    // doing work in the template. Images are stored as a CSV on the model.
    this.products.forEach(product => {
      const imgs = this.parseImageList((product as any).images);
      (product as any)._imageList = imgs;
      (product as any)._thumbnail = imgs.length > 0 ? imgs[0] : null;
    });

    const map = new Map<string, Product[]>();

    this.products.forEach(product => {
      const catName: string =
        (product as any).categoryNom
        ?? (product as any).categorie?.nom
        ?? (product as any).category?.nom
        ?? this.categoryMap[(product as any).categoryId]
        ?? 'Autres';

      if (!map.has(catName)) map.set(catName, []);
      map.get(catName)!.push(product);
    });

    this.groupedProducts = Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === 'Autres') return 1;
        if (b === 'Autres') return -1;
        return a.localeCompare(b, 'fr');
      })
      .map(([categoryName, products]) => ({ categoryName, products }));
  }

  /**
   * Parse a CSV-style images string into an array of valid image URIs.
   * Accepts http(s) URLs and data URIs.
   */
  private parseImageList(images?: string): string[] {
    if (!images) return [];
    const imgs = images.split(',').map(s => s.trim()).filter(Boolean);
    return imgs.filter(s => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:'));
  }

  pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
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
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const selectedVariant = this.selectedVariantByProduct[product.id];

    this.cartService.addItem(product.id, 1, selectedVariant).subscribe({
      next: () => {
        this.message = product.nom + ' ajouté au panier';
        setTimeout(() => this.message = '', 3000);
      },
      error: () => {
        this.message = 'Erreur lors de l\'ajout';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  // Compute the displayed price for a product card, taking the first available variant into account
  // variant-aware card price (removed per user request)

  onVariantChange(productId: number, variantId?: number): void {
    this.selectedVariantByProduct[productId] = variantId;
  }

  deleteProduct(id: number): void {
    if (confirm('Désactiver ce produit ?')) {
      this.productService.delete(id).subscribe(() => this.loadProducts());
    }
  }

  private loadProductVariants(products: Product[]): void {
    products.forEach((product) => {
      this.productService.getVariants(product.id).subscribe({
        next: (variants) => {
          const available = (variants || []).filter(v => (v.stock ?? 0) > 0);

          this.variantsByProduct[product.id] = available;
          this.selectedVariantByProduct[product.id] =
            available.length > 0 ? available[0].id : undefined;
        },
        error: () => {
          this.variantsByProduct[product.id] = [];
        }
      });
    });
  }
}
