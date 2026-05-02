import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CouponService } from '../../../../core/services/coupon.service';
import { CouponRequest, Coupon } from '../../../../core/models/coupon.model';

@Component({
  selector: 'app-coupon-form',
  templateUrl: './coupon-form.component.html',
  styleUrls: ['./coupon-form.component.css']
})
export class CouponFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEdit = false;
  couponId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      type: ['PERCENT', Validators.required],
      valeur: [0, [Validators.required, Validators.min(0)]],
      usagesMax: [null],
      dateExpiration: [null],
      actif: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.couponId = +id;
      this.loadCoupon(this.couponId);
    }
  }

  loadCoupon(id: number): void {
    this.loading = true;
    this.couponService.getAllForSeller().subscribe({
      next: (list) => {
        const c = (list || []).find(x => x.id === id);
        if (!c) {
          this.error = 'Coupon non trouvé';
          this.loading = false;
          return;
        }
        this.form.patchValue({
          code: c.code,
          type: c.type,
          valeur: c.valeur,
          usagesMax: c.usagesMax,
          dateExpiration: c.dateExpiration ? new Date(c.dateExpiration) : null,
          actif: c.actif
        });
        this.loading = false;
      },
      error: () => { this.error = 'Erreur lors du chargement'; this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const payload: CouponRequest = { ...this.form.value };
    if (payload.dateExpiration) {
      payload.dateExpiration = new Date(payload.dateExpiration).toISOString();
    }

    const call = this.isEdit && this.couponId
      ? this.couponService.update(this.couponId, payload)
      : this.couponService.create(payload);

    call.subscribe({
      next: () => this.router.navigate(['/admin/coupons']),
      error: (err) => { this.error = err?.error?.error || 'Erreur lors de l\'enregistrement'; this.loading = false; }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/coupons']);
  }
}
