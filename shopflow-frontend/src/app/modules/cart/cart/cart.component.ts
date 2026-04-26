import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cart } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ProductVariant } from '../../../core/models/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  couponCode = '';
  message = '';
  error = '';
  loading = false;
  variantsByProduct: Record<number, ProductVariant[]> = {};
  adresseTexte = '';
  ville = '';
  codePostal = '';
  pays = 'Tunisie';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loadVariantsForCart(cart);
      },
      error: (err) => {
        console.error('Cart error:', err);
        this.error = 'Erreur chargement panier';
      }
    });
  }

  updateQuantity(itemId: number, qty: number): void {
    if (qty < 1) return;
    this.cartService.updateItem(itemId, qty).subscribe(cart => this.cart = cart);
  }

  updateVariant(itemId: number, qty: number, variantId?: number): void {
    this.cartService.updateItem(itemId, qty, variantId).subscribe(cart => {
      this.cart = cart;
      this.loadVariantsForCart(cart);
    }, (err) => {
      this.error = err?.error?.error || 'Impossible de changer la variante (stock insuffisant ou variante invalide).';
      setTimeout(() => this.error = '', 4000);
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe(cart => this.cart = cart);
  }

  applyCoupon(): void {
    if (!this.couponCode) return;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: (cart) => { this.cart = cart; this.message = 'Coupon applique ✅'; },
      error: () => this.error = 'Coupon invalide'
    });
  }

  removeCoupon(): void {
    this.cartService.removeCoupon().subscribe(cart => {
      this.cart = cart;
      this.couponCode = '';
      this.message = '';
    });
  }

  checkout(): void {
    if (!this.adresseTexte.trim()) {
      this.error = 'Saisissez une adresse de livraison';
      return;
    }
    this.loading = true;
    this.orderService.createOrder({
      adresseTexte: this.adresseTexte,
      ville: this.ville,
      codePostal: this.codePostal,
      pays: this.pays
    }).subscribe({
      next: (order) => {
        this.message = `Commande ${order.numeroCommande} creee ✅`;
        this.loadCart();
        setTimeout(() => this.router.navigate(['/orders']), 2000);
      },
      error: () => {
        this.error = 'Erreur lors de la commande';
        this.loading = false;
      }
    });
  }

  private loadVariantsForCart(cart: Cart): void {
    const productIds = Array.from(new Set((cart.lignes || []).map(i => i.productId)));
    productIds.forEach(productId => {
      this.productService.getVariants(productId).subscribe({
        next: (variants) => {
          const currentVariantId = (cart.lignes || []).find(i => i.productId === productId)?.variantId;
          this.variantsByProduct[productId] = (variants || []).filter(v => (v.stock ?? 0) > 0 || v.id === currentVariantId);
        },
        error: () => {
          this.variantsByProduct[productId] = [];
        }
      });
    });
  }

  isImageUrl(value?: string): boolean {
    if (!value) {
      return false;
    }
    const v = value.trim().toLowerCase();
    return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:image/');
  }
}
