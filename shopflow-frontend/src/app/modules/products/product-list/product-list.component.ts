import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product, ProductVariant } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';

export interface ProductGroup {
  categoryName: string;
  subCategoryName?: string;
  products: Product[];
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  groupedProducts: ProductGroup[] = [];

  totalPages = 0;
  currentPage = 0;
  totalElements = 0;

  searchQuery = '';
  prixMin?: number;
  prixMax?: number;
  promoOnly = false;

  sliderMin = 0;
  sliderMax = 500;
  readonly PRIX_MAX = 500;

  sortBy: 'prix_asc' | 'prix_desc' | 'popularite' | 'nouveautes' = 'nouveautes';

  /** Arbre des catégories (racines + sousCategories) */
  categories: Category[] = [];
  /** Catégories racines dont le panneau sous-catégories est ouvert */
  expandedCategories: Set<number> = new Set();
  /** IDs sélectionnés pour le filtre (peuvent être parents ou sous-catégories) */
  selectedCategoryIds: number[] = [];
  /** Map id → {nom, parentNom?} construite depuis l'arbre */
  private catInfoMap = new Map<number, { nom: string; parentNom?: string }>();

  pageSize = 12;
  loading = false;

  isLoggedIn = false;
  isAdmin = false;
  isSeller = false;

  message = '';

  variantsByProduct: Record<number, ProductVariant[]> = {};
  selectedVariantByProduct: Record<number, number | undefined> = {};

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

    // Charger les produits immédiatement sans attendre les catégories
    this.loadProducts();

    // Charger les catégories pour le filtre sidebar en parallèle
    this.categoryService.getAll().subscribe({
      next: c => {
        this.categories = c || [];
        this.buildCatInfoMap();
      },
      error: () => { this.categories = []; }
    });
  }

  // ---- Helpers filtres catégories ----

  /** Tous les IDs à envoyer au backend : si parent sélectionné, on inclut ses sous-cat aussi */
  private resolvedCategoryIds(): number[] {
    if (this.selectedCategoryIds.length === 0) return [];

    const all = new Set<number>(this.selectedCategoryIds);
    this.selectedCategoryIds.forEach(id => {
      const parent = this.categories.find(c => c.id === id);
      if (parent?.sousCategories) {
        parent.sousCategories.forEach(sub => all.add(sub.id));
      }
    });
    return Array.from(all);
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategoryIds.includes(id);
  }

  isCategoryExpanded(id: number): boolean {
    return this.expandedCategories.has(id);
  }

  toggleExpand(id: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedCategories.has(id)) {
      this.expandedCategories.delete(id);
    } else {
      this.expandedCategories.add(id);
    }
  }

  toggleCategory(id: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedCategoryIds.includes(id)) {
        this.selectedCategoryIds.push(id);
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(i => i !== id);
    }
  }

  /** Vérifie si une catégorie racine a au moins une sous-catégorie sélectionnée */
  hasSubSelected(cat: Category): boolean {
    return (cat.sousCategories || []).some(s => this.selectedCategoryIds.includes(s.id));
  }

  // ---- Chargement produits ----

  loadProducts(): void {
    this.loading = true;

    this.productService.search({
      q: this.searchQuery || undefined,
      prixMin: this.prixMin,
      prixMax: this.prixMax,
      categoryIds: this.resolvedCategoryIds(),
      promoOnly: this.promoOnly,
      sortBy: this.sortBy,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (page) => {
        this.products = page.content || [];
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements || 0;
        this.computeGroupedProducts();
        this.loadProductVariants(this.products);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.products = [];
        this.groupedProducts = [];
        this.loading = false;
      }
    });
  }

  // ---- Groupement ----

  computeGroupedProducts(): void {
    if (!this.products.length) {
      this.groupedProducts = [];
      return;
    }

    this.products.forEach(product => {
      const imgs = this.parseImageList((product as any).images);
      (product as any)._imageList = imgs;
      (product as any)._thumbnail = imgs.length > 0 ? imgs[0] : null;
    });

    // Clé de groupe : "Parent" ou "Parent > Sous-cat"
    const map = new Map<string, Product[]>();

    this.products.forEach(product => {
      const key = this.groupKeyForProduct(product);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(product);
    });

    this.groupedProducts = Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === 'Autres') return 1;
        if (b === 'Autres') return -1;
        return a.localeCompare(b, 'fr');
      })
      .map(([categoryName, products]) => ({ categoryName, products }));
  }

  /** Construit la map id → {nom, parentNom} depuis l'arbre de catégories */
  private buildCatInfoMap(): void {
    this.catInfoMap.clear();
    this.categories.forEach(cat => {
      this.catInfoMap.set(cat.id, { nom: cat.nom });
      (cat.sousCategories || []).forEach(sub => {
        this.catInfoMap.set(sub.id, { nom: sub.nom, parentNom: cat.nom });
      });
    });
  }

  private groupKeyForProduct(product: Product): string {
    // Utilise la map locale (category tree) pour le nom de groupe
    if (product.categoryIds && product.categoryIds.length > 0) {
      const info = this.catInfoMap.get(product.categoryIds[0]);
      if (info) {
        return info.parentNom ? `${info.parentNom} › ${info.nom}` : info.nom;
      }
    }
    // Fallback : nom de catégorie texte retourné par le backend
    if (product.categories && product.categories.length > 0) {
      return product.categories[0];
    }
    return 'Autres';
  }

  private parseImageList(images?: string): string[] {
    if (!images) return [];
    return images.split(',').map(s => s.trim()).filter(
      s => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')
    );
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
    this.sliderMin = 0;
    this.sliderMax = this.PRIX_MAX;
    this.promoOnly = false;
    this.sortBy = 'nouveautes';
    this.selectedCategoryIds = [];
    this.expandedCategories.clear();
    this.currentPage = 0;
    this.loadProducts();
  }

  get sliderFillLeft(): number { return (this.sliderMin / this.PRIX_MAX) * 100; }
  get sliderFillRight(): number { return 100 - (this.sliderMax / this.PRIX_MAX) * 100; }

  onMinRange(val: string): void {
    const n = Math.min(Number(val), this.sliderMax - 5);
    this.sliderMin = n;
    this.prixMin = n > 0 ? n : undefined;
  }

  onMaxRange(val: string): void {
    const n = Math.max(Number(val), this.sliderMin + 5);
    this.sliderMax = n;
    this.prixMax = n < this.PRIX_MAX ? n : undefined;
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
        error: () => { this.variantsByProduct[product.id] = []; }
      });
    });
  }
}
