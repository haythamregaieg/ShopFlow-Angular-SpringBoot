import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getById(+id).subscribe(p => this.product = p);
    }
  }

  decrement(): void {
    if (this.quantity > 1) this.quantity = this.quantity - 1;
  }

  increment(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity = this.quantity + 1;
    }
  }

  addToCart(): void {
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(this.product!.id, this.quantity).subscribe({
      next: () => {
        this.message = 'Ajouté au panier ✅';
        setTimeout(() => this.message = '', 3000);
      },
      error: () => this.message = 'Erreur lors de l\'ajout'
    });
  }
}