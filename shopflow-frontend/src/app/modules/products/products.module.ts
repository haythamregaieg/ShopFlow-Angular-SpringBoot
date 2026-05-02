import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ProductListComponent, ProductDetailComponent, ProductFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductsRoutingModule, SharedModule]
})
export class ProductsModule {}