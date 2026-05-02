import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { Coupon, CouponRequest, CouponType } from '../../../core/models/coupon.model';
import { ProductService } from '../../../core/services/product.service';
import { CouponService } from '../../../core/services/coupon.service';
import { AuthService } from '../../../core/services/auth.service';
import { SellerProfileService } from '../../../core/services/seller-profile.service';

@Component({
  selector: 'app-seller-management',
  templateUrl: './seller-management.component.html',
  styleUrls: ['./seller-management.component.css']
})
export class SellerManagementComponent implements OnInit {
  products: Product[] = [];
  coupons: Coupon[] = [];
  couponForm: FormGroup;
  sellerProfileForm: FormGroup;
  selectedCouponId: number | null = null;

  loadingProducts = false;
  loadingCoupons = false;
  savingCoupon = false;
  error = '';
  success = '';

  readonly couponTypes: CouponType[] = ['PERCENT', 'FIXED'];

  constructor(
    private productService: ProductService,
    private couponService: CouponService,
    private authService: AuthService,
    private sellerProfileService: SellerProfileService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['PERCENT', Validators.required],
      valeur: [0, [Validators.required, Validators.min(0.01)]],
      dateExpiration: [''],
      usagesMax: [null as number | null, [Validators.min(0)]],
      actif: [true]
    });
    this.sellerProfileForm = this.fb.group({
      nomBoutique: ['', Validators.required],
      description: [''],
      logo: ['']
    });
  }

  ngOnInit(): void {
    const role = this.authService.getRole();
    if (role !== 'SELLER' && role !== 'ADMIN') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadProducts();
    this.loadCoupons();
    this.loadSellerProfile();
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getSellerProducts(0, 100).subscribe({
      next: (page) => {
        this.products = page.content || [];
        this.loadingProducts = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos produits.';
        this.loadingProducts = false;
      }
    });
  }

  loadCoupons(): void {
    this.loadingCoupons = true;
    this.couponService.getAllForSeller().subscribe({
      next: (data) => {
        this.coupons = data || [];
        this.loadingCoupons = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos coupons.';
        this.loadingCoupons = false;
      }
    });
  }

  loadSellerProfile(): void {
    this.sellerProfileService.getMyProfile().subscribe({
      next: (profile) => this.sellerProfileForm.patchValue(profile),
      error: () => {}
    });
  }

  editProduct(productId: number): void {
    this.router.navigate(['/products', productId, 'edit']);
  }

  addProduct(): void {
    this.router.navigate(['/products/new/create']);
  }

  deleteProduct(productId: number): void {
    if (!confirm('Supprimer ce produit ?')) {
      return;
    }

    this.productService.delete(productId).subscribe({
      next: () => {
        this.success = 'Produit supprime.';
        this.loadProducts();
      },
      error: () => {
        this.error = 'La suppression du produit a echoue.';
      }
    });
  }

  deactivateProduct(productId: number): void {
    if (!confirm('Desactiver ce produit ? Il ne sera plus visible sur le site.')) {
      return;
    }
    // Backend delete is a soft-delete (sets actif=false)
    this.productService.delete(productId).subscribe({
      next: () => {
        this.success = 'Produit desactive.';
        this.loadProducts();
      },
      error: () => {
        this.error = 'La desactivation du produit a echoue.';
      }
    });
  }

  activateProduct(productId: number): void {
    if (!confirm('Reactiver ce produit ? Il redeviendra visible sur le site.')) {
      return;
    }
    this.productService.activate(productId).subscribe({
      next: () => {
        this.success = 'Produit reactive.';
        this.loadProducts();
      },
      error: () => {
        this.error = 'La reactivation du produit a echoue.';
      }
    });
  }

  submitCoupon(): void {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    this.savingCoupon = true;
    this.error = '';
    this.success = '';

    const request = this.buildCouponRequest();
    const action = this.selectedCouponId
      ? this.couponService.update(this.selectedCouponId, request)
      : this.couponService.create(request);

    action.subscribe({
      next: () => {
        this.savingCoupon = false;
        this.success = this.selectedCouponId ? 'Coupon modifie.' : 'Coupon ajoute.';
        this.resetCouponForm();
        this.loadCoupons();
      },
      error: () => {
        this.savingCoupon = false;
        this.error = 'La sauvegarde du coupon a echoue.';
      }
    });
  }

  editCoupon(coupon: Coupon): void {
    this.selectedCouponId = coupon.id;
    this.couponForm.patchValue({
      code: coupon.code,
      type: coupon.type,
      valeur: coupon.valeur,
      dateExpiration: this.toDateInputValue(coupon.dateExpiration),
      usagesMax: coupon.usagesMax ?? null,
      actif: coupon.actif
    });
  }

  deleteCoupon(couponId: number): void {
    if (!confirm('Supprimer ce coupon ?')) {
      return;
    }

    this.couponService.delete(couponId).subscribe({
      next: () => {
        this.success = 'Coupon supprime.';
        if (this.selectedCouponId === couponId) {
          this.resetCouponForm();
        }
        this.loadCoupons();
      },
      error: () => {
        this.error = 'La suppression du coupon a echoue.';
      }
    });
  }

  resetCouponForm(): void {
    this.selectedCouponId = null;
    this.couponForm.reset({
      code: '',
      type: 'PERCENT',
      valeur: 0,
      dateExpiration: '',
      usagesMax: null,
      actif: true
    });
  }

  saveSellerProfile(): void {
    if (this.sellerProfileForm.invalid) {
      this.sellerProfileForm.markAllAsTouched();
      return;
    }
    this.sellerProfileService.updateMyProfile(this.sellerProfileForm.value).subscribe({
      next: () => {
        this.success = 'Profil boutique mis a jour.';
        this.error = '';
      },
      error: () => {
        this.error = 'La mise a jour de la boutique a echoue.';
      }
    });
  }

  private buildCouponRequest(): CouponRequest {
    const raw = this.couponForm.value as {
      code: string;
      type: CouponType;
      valeur: number;
      dateExpiration: string;
      usagesMax: number | null;
      actif: boolean;
    };

    return {
      code: (raw.code || '').trim(),
      type: raw.type,
      valeur: Number(raw.valeur),
      dateExpiration: raw.dateExpiration || null,
      usagesMax: raw.usagesMax !== null && raw.usagesMax !== undefined ? Number(raw.usagesMax) : null,
      actif: !!raw.actif
    };
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
