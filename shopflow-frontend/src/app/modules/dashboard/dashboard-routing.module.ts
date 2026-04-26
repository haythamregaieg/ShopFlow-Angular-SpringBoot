import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryManagementComponent } from './category-management/category-management.component';
import { SellerManagementComponent } from './seller-management/seller-management.component';
import { SellerGuard } from '../../core/guards/seller.guard';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'seller', component: SellerManagementComponent, canActivate: [SellerGuard] },
  { path: 'categories', component: CategoryManagementComponent, canActivate: [SellerGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
