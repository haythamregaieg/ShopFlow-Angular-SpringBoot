import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [OrderListComponent, OrderDetailComponent],
  imports: [CommonModule, FormsModule, OrdersRoutingModule, SharedModule]
})
export class OrdersModule {}
