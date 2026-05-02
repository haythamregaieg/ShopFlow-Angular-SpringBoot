import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { AdminReviewsComponent } from './admin-reviews/admin-reviews.component';
import { CouponListComponent } from './coupons/coupon-list/coupon-list.component';
import { CouponFormComponent } from './coupons/coupon-form/coupon-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: AdminUsersComponent },
  { path: 'products', component: AdminProductsComponent },
  { path: 'reviews', component: AdminReviewsComponent }
  ,{ path: 'coupons', component: CouponListComponent }
  ,{ path: 'coupons/new', component: CouponFormComponent }
  ,{ path: 'coupons/:id', component: CouponFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}