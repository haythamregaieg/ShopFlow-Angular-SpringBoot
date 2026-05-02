import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { AdminReviewsComponent } from './admin-reviews/admin-reviews.component';
import { CouponListComponent } from './coupons/coupon-list/coupon-list.component';
import { CouponFormComponent } from './coupons/coupon-form/coupon-form.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AdminUsersComponent, AdminProductsComponent, AdminReviewsComponent, CouponListComponent, CouponFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminRoutingModule, SharedModule]
})
export class AdminModule {}