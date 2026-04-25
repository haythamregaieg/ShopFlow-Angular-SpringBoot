import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductVariant } from '../../../core/models/product.model';
import { Review } from '../../../core/models/review.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  message = '';
  isLoggedIn = false;
  variants: ProductVariant[] = [];
  selectedVariantId?: number;
  reviews: Review[] = [];
  newReview = { note: 5, commentaire: '' };
  showReviewForm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const productId = +id;
      this.productService.getById(productId).subscribe(p => this.product = p);
      this.productService.getVariants(productId).subscribe(v => {
        this.variants = v || [];
        this.selectedVariantId = this.variants[0]?.id;
      });
      this.loadReviews(productId);
    }
  }

  loadReviews(productId: number): void {
    this.reviewService.getProductReviews(productId).subscribe(r => this.reviews = r || []);
  }

  submitReview(): void {
    if (!this.product) return;
    this.reviewService.addReview({
      productId: this.product.id,
      note: this.newReview.note,
      commentaire: this.newReview.commentaire
    }).subscribe({
      next: () => {
        this.message = 'Avis envoyé ! Il sera visible après modération. ✅';
        this.newReview = { note: 5, commentaire: '' };
        this.showReviewForm = false;
        setTimeout(() => this.message = '', 5000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Erreur lors de l\'envoi de l\'avis. Assurez-vous d\'avoir acheté ce produit.';
        setTimeout(() => this.message = '', 5000);
      }
    });
  }

  decrement(): void {
    if (this.quantity > 1) this.quantity = this.quantity - 1;
  }

  increment(): void {
    if (!this.product) return;

    let maxStock = this.product.stock;
    if (this.selectedVariantId) {
      const variant = this.variants.find(v => v.id === this.selectedVariantId);
      if (variant) {
        maxStock = variant.stock;
      }
    }

    if (this.quantity < maxStock) {
      this.quantity = this.quantity + 1;
    } else {
      this.message = 'Stock maximum atteint';
      setTimeout(() => this.message = '', 3000);
    }
  }

  onVariantChange(): void {
    this.quantity = 1;
  }

  addToCart(): void {
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(this.product!.id, this.quantity, this.selectedVariantId).subscribe({
      next: () => {
        this.message = 'Ajouté au panier ✅';
        setTimeout(() => this.message = '', 3000);
      },
      error: () => this.message = 'Erreur lors de l\'ajout'
    });
  }
}
