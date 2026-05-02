import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cart } from '../../../core/models/cart.model';
import { Address } from '../../../core/models/order.model';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { AddressService } from '../../../core/services/address.service';
import { ProductVariant } from '../../../core/models/product.model';

export interface VilleTunisie {
  nom: string;
  frais: number;
}

export const VILLES_TUNISIE: VilleTunisie[] = [
  { nom: 'Tunis',       frais: 3.00 },
  { nom: 'Ariana',      frais: 3.00 },
  { nom: 'Ben Arous',   frais: 3.00 },
  { nom: 'Manouba',     frais: 3.00 },
  { nom: 'Nabeul',      frais: 5.00 },
  { nom: 'Zaghouan',    frais: 5.00 },
  { nom: 'Bizerte',     frais: 5.00 },
  { nom: 'Beja',        frais: 7.00 },
  { nom: 'Jendouba',    frais: 7.00 },
  { nom: 'Le Kef',      frais: 7.00 },
  { nom: 'Siliana',     frais: 7.00 },
  { nom: 'Sousse',      frais: 5.00 },
  { nom: 'Monastir',    frais: 5.00 },
  { nom: 'Mahdia',      frais: 6.00 },
  { nom: 'Sfax',        frais: 6.00 },
  { nom: 'Kairouan',    frais: 6.00 },
  { nom: 'Kasserine',   frais: 8.00 },
  { nom: 'Sidi Bouzid', frais: 8.00 },
  { nom: 'Gabes',       frais: 8.00 },
  { nom: 'Medenine',    frais: 9.00 },
  { nom: 'Tataouine',   frais: 10.00 },
  { nom: 'Gafsa',       frais: 8.00 },
  { nom: 'Tozeur',      frais: 9.00 },
  { nom: 'Kebili',      frais: 9.00 },
];

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

  // Delivery form
  savedAddresses: Address[] = [];
  selectedAddressId: number | null = null;
  adresseTexte = '';
  ville = 'Tunis';
  codePostal = '';
  telephone = '';

  readonly villes = VILLES_TUNISIE;

  get selectedAddress(): Address | null {
    if (this.selectedAddressId == null) return null;
    // eslint-disable-next-line eqeqeq
    return this.savedAddresses.find(a => a.id == this.selectedAddressId) ?? null;
  }

  onAddressSelect(id: number | null): void {
    this.selectedAddressId = id != null ? Number(id) : null;
  }

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) { this.router.navigate(['/auth/login']); return; }
    this.loadCart();
    this.addressService.getMyAddresses().subscribe({
      next: (addrs) => {
        this.savedAddresses = addrs || [];
        const principal = this.savedAddresses.find(a => a.principal);
        if (principal) this.selectedAddressId = principal.id;
      },
      error: () => {}
    });
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => { this.cart = cart; this.loadVariantsForCart(cart); },
      error: () => { this.error = 'Erreur chargement panier'; }
    });
  }

  /** Frais de livraison preview (client-side) */
  get fraisPreview(): number {
    if (!this.cart) return 0;
    const sousApresRemise = Math.max((this.cart.sousTotal || 0) - (this.cart.remise || 0), 0);
    if (sousApresRemise >= 100) return 0;
    if (this.selectedAddressId != null) {
      // eslint-disable-next-line eqeqeq
      const addr = this.savedAddresses.find(a => a.id == this.selectedAddressId);
      if (addr) {
        const villeNorm = (addr.ville || '').trim().toLowerCase();
        const v = this.villes.find(v => v.nom.toLowerCase() === villeNorm);
        return v ? v.frais : 7.99;
      }
    }
    const v = this.villes.find(v => v.nom === this.ville);
    return v ? v.frais : 7.99;
  }

  get totalPreview(): number {
    if (!this.cart) return 0;
    const sousApresRemise = Math.max((this.cart.sousTotal || 0) - (this.cart.remise || 0), 0);
    return sousApresRemise + this.fraisPreview;
  }

  updateQuantity(itemId: number, qty: number): void {
    if (qty < 1) return;
    this.cartService.updateItem(itemId, qty).subscribe(cart => this.cart = cart);
  }

  updateVariant(itemId: number, qty: number, variantId?: number): void {
    this.cartService.updateItem(itemId, qty, variantId).subscribe({
      next: cart => { this.cart = cart; this.loadVariantsForCart(cart); },
      error: err => {
        this.error = err?.error?.error || 'Variante invalide ou stock insuffisant.';
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe(cart => this.cart = cart);
  }

  applyCoupon(): void {
    if (!this.couponCode) return;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: (cart) => { this.cart = cart; this.message = 'Coupon applique !'; },
      error: () => { this.error = 'Coupon invalide'; setTimeout(() => this.error = '', 3000); }
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
    if (!this.telephone.trim()) {
      this.error = 'Veuillez saisir un numero de telephone';
      return;
    }
    if (!this.selectedAddressId && !this.adresseTexte.trim()) {
      this.error = 'Veuillez saisir ou choisir une adresse de livraison';
      return;
    }
    this.loading = true;
    this.error = '';

    const payload: any = { telephone: this.telephone };
    if (this.selectedAddressId) {
      payload.addressId = this.selectedAddressId;
    } else {
      payload.adresseTexte = this.adresseTexte;
      payload.ville = this.ville;
      payload.codePostal = this.codePostal;
      payload.pays = 'Tunisie';
    }

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        this.message = `Commande ${order.numeroCommande} creee !`;
        this.loadCart();
        setTimeout(() => this.router.navigate(['/orders']), 1500);
      },
      error: (err) => {
        this.error = err?.error?.error || 'Erreur lors de la commande';
        this.loading = false;
      }
    });
  }

  isImageUrl(value?: string): boolean {
    if (!value) return false;
    const v = value.trim().toLowerCase();
    return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:image/');
  }

  private loadVariantsForCart(cart: Cart): void {
    const productIds = Array.from(new Set((cart.lignes || []).map(i => i.productId)));
    productIds.forEach(productId => {
      this.productService.getVariants(productId).subscribe({
        next: (variants) => {
          const currentVariantId = (cart.lignes || []).find(i => i.productId === productId)?.variantId;
          this.variantsByProduct[productId] = (variants || []).filter(v => (v.stock ?? 0) > 0 || v.id === currentVariantId);
        },
        error: () => { this.variantsByProduct[productId] = []; }
      });
    });
  }
}
