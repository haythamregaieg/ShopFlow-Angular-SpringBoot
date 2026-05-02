import { Component, OnInit } from "@angular/core";
import { Order } from "../../../core/models/order.model";
import { OrderService } from "../../../core/services/order.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.css"]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  isSeller = false;
  isAdmin = false;
  availableStatuses = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  readonly statusOrder: Record<string, number> = {
    PENDING: 1,
    PAID: 2,
    PROCESSING: 3,
    SHIPPED: 4,
    DELIVERED: 5,
    CANCELLED: 99,
    REFUNDED: 100
  };

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isSeller = role === "SELLER";
    this.isAdmin = role === "ADMIN";

    const source$ = this.isSeller || this.isAdmin
      ? this.orderService.getSellerOrders()
      : this.orderService.getMyOrders();

    source$.subscribe({
      next: (orders) => {
        this.prepareOrders(orders);
        this.orders = orders;
        // Auto-mark new-status notifications as seen for customers
        if (!this.isSeller && !this.isAdmin) {
          const newOrders = orders.filter(o => o.isNewStatus);
          if (newOrders.length > 0) {
            let markedCount = 0;
            newOrders.forEach(o => {
              this.orderService.markAsSeen(o.id).subscribe(updated => {
                const idx = this.orders.findIndex(x => x.id === updated.id);
                if (idx !== -1) this.orders[idx] = { ...this.orders[idx], isNewStatus: false };
                markedCount++;
                if (markedCount === newOrders.length) {
                  this.orderService.notificationRefreshSubject.next();
                }
              });
            });
          }
        }
      },
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

  updateStatus(id: number, status?: string): void {
    if (!status) {
      console.warn('No status provided for updateStatus call', id);
      return;
    }
    this.orderService.updateStatus(id, status).subscribe({
      next: (order) => {
        const idx = this.orders.findIndex(o => o.id === id);
        if (idx !== -1) {
          this.orders[idx] = order;
        }
      },
      error: (err) => console.error("Status update error:", err)
    });
  }

  // Helper: when orders are loaded, attach a _selectedStatus default so ngModel can bind
  private prepareOrders(orders: Order[]): void {
    orders.forEach(o => {
      // default selected status is the current status
      // use a non-enumerable property so model typing isn't strictly modified
      (o as any)._selectedStatus = o.statut;
    });
  }

  getAvailableStatusesFor(order: Order): string[] {
    const current = order.statut;
    if (current === "CANCELLED" || current === "REFUNDED") {
      return [current];
    }
    const currentRank = this.statusOrder[current] ?? 1;
    return this.availableStatuses.filter(s => {
      if (s === "PENDING") {
        return current === "PENDING";
      }
      if (s === "CANCELLED") {
        return current !== "DELIVERED" && current !== "REFUNDED";
      }
      if (s === "REFUNDED") {
        return current !== "PENDING" && current !== "CANCELLED" && current !== "REFUNDED";
      }
      if (s === "DELIVERED") {
        return currentRank <= this.statusOrder["DELIVERED"];
      }
      return (this.statusOrder[s] ?? 0) >= currentRank;
    });
  }
}
