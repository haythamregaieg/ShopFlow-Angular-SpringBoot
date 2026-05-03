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
  imageUrlToShow?: string | null = null;
  imageList: string[] = [];
  selectedImageIndex = 0;

  selectImage(index: number) {
    if (index >= 0 && index < this.imageList.length) {
      this.selectedImageIndex = index;
      this.imageUrlToShow = this.imageList[index] || null;
    }
  }
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
      this.productService.getById(productId).subscribe(p => {
        this.product = p;
        // determine image to show: images may be comma-separated list or data URI
        const imgs = (p.images || '').split(',').map(s => s.trim()).filter(Boolean);
        // keep only valid image URIs (http(s) or data URI)
        this.imageList = imgs.filter(s => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:'));
        if (this.imageList.length > 0) {
          this.selectedImageIndex = 0;
          this.imageUrlToShow = this.imageList[0];
        } else {
          this.imageList = [];
          this.imageUrlToShow = null;
        }
      });
      this.productService.getVariants(productId).subscribe(v => {
        this.variants = (v || []).filter(x => (x.stock ?? 0) > 0);
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
    const payload = {
      productId: this.product.id,
      note: this.newReview.note,
      commentaire: this.newReview.commentaire
    };
    // Debug: log outgoing payload so we can reproduce server error
    console.log('Submitting review', payload);
    this.reviewService.addReview(payload).subscribe({
      next: () => {
        this.message = 'Avis envoyé ! Il sera visible après modération. ✅';
        this.newReview = { note: 5, commentaire: '' };
        this.showReviewForm = false;
        setTimeout(() => this.message = '', 5000);
      },
      error: (err) => {
        // Print full error to console for debugging (status, body, headers)
        console.error('Review POST error', err);
        // Prefer server-provided message when present
        const serverMsg = err?.error?.error || err?.error?.message || err?.message || (err?.error ? JSON.stringify(err.error) : null);
        this.message = serverMsg || 'Erreur lors de l\'envoi de l\'avis. Assurez-vous d\'avoir acheté ce produit.';
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

  // Return effective unit price considering variant price delta and promotions
  // (variant price computation was removed per user request)
}
