import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';

@NgModule({
  declarations: [AdminUsersComponent, AdminProductsComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminRoutingModule]
})
export class AdminModule {}