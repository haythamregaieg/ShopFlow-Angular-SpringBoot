import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@NgModule({
  declarations: [OrderListComponent, OrderDetailComponent],
  imports: [CommonModule, FormsModule, OrdersRoutingModule]
})
export class OrdersModule {}
