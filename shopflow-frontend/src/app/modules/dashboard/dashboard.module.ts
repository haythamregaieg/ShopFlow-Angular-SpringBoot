import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryManagementComponent } from './category-management/category-management.component';
import { SellerManagementComponent } from './seller-management/seller-management.component';
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [DashboardComponent, CategoryManagementComponent, SellerManagementComponent],
  imports: [CommonModule, DashboardRoutingModule, NgChartsModule, ReactiveFormsModule, SharedModule]
})
export class DashboardModule {}
