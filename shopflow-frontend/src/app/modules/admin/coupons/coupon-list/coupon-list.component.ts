import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Coupon } from '../../../../core/models/coupon.model';
import { CouponService } from '../../../../core/services/coupon.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.css']
})
export class CouponListComponent implements OnInit {
  coupons: Coupon[] = [];
  loading = false;
  message = '';

  constructor(
    private couponService: CouponService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.couponService.getAllForSeller().subscribe({
      next: (c) => {
        this.coupons = c || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  create(): void {
    this.router.navigate(['/admin/coupons/new']);
  }

  edit(id: number): void {
    this.router.navigate(['/admin/coupons', id]);
  }

  deleteCoupon(id: number): void {
    if (!confirm('Supprimer ce coupon ?')) return;
    this.couponService.delete(id).subscribe({
      next: () => this.load(),
      error: () => this.message = 'Erreur lors de la suppression'
    });
  }
}
