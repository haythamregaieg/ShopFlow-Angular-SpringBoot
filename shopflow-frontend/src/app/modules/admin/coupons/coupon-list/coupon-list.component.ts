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

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

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
      next: (coupons) => {
        this.coupons = coupons || [];
        this.totalPages = Math.ceil(this.coupons.length / this.pageSize);
        if (this.currentPage >= this.totalPages) this.currentPage = 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message = 'Erreur de chargement des coupons';
      }
    });
  }

  get paginatedCoupons(): Coupon[] {
    const start = this.currentPage * this.pageSize;
    return this.coupons.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
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
      next: () => {
        this.load();
        this.message = '';
      },
      error: () => this.message = 'Erreur lors de la suppression'
    });
  }
}
