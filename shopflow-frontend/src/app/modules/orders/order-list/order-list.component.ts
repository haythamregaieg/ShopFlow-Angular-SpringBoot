import { Component, OnInit } from "@angular/core";
import { Order } from "../../../core/models/order.model";
import { OrderService } from "../../../core/services/order.service";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.css"]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => this.orders = orders,
      error: (err) => console.error("Orders error:", err)
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      "PENDING": "badge-warning",
      "PAID": "badge-info",
      "PROCESSING": "badge-info",
      "SHIPPED": "badge-info",
      "DELIVERED": "badge-success",
      "CANCELLED": "badge-danger",
      "REFUNDED": "badge-danger"
    };
    return map[status] || "badge-info";
  }

  cancelOrder(id: number): void {
    if (confirm("Annuler cette commande ?")) {
      this.orderService.cancelOrder(id).subscribe(order => {
        const idx = this.orders.findIndex(o => o.id === id);
        if (idx !== -1) this.orders[idx] = order;
      });
    }
  }
}
