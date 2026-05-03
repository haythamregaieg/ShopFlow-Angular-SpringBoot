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
  paginatedOrders: Order[] = [];
  isSeller = false;
  isAdmin = false;
  title = "Mes commandes";
  subtitle = "Suivez vos achats et l'etat de vos colis";
  message = "";
  error = "";
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

  // Pagination
  itemsPerPage = 9;
  currentPage = 1;
  totalPages = 1;

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getRole();
    this.isSeller = role === "SELLER";
    this.isAdmin = role === "ADMIN";

    if (this.isAdmin) {
      this.title = "Toutes les commandes";
      this.subtitle = "Vue globale des commandes de la plateforme";
    } else if (this.isSeller) {
      this.title = "Commandes de mes produits";
      this.subtitle = "Suivez et mettez a jour les commandes affectees a vos produits";
    }

    const source$ = this.isAdmin
      ? this.orderService.getAllOrders()
      : this.isSeller
        ? this.orderService.getSellerOrders()
        : this.orderService.getMyOrders();

    source$.subscribe({
      next: (orders) => {
        this.prepareOrders(orders);
        this.orders = orders;
        this.calculatePagination();
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
    this.message = "";
    this.error = "";
    if (!status) {
      console.warn('No status provided for updateStatus call', id);
      return;
    }
    const currentOrder = this.orders.find(o => o.id === id);
    if (currentOrder?.statut === status) {
      this.error = "Choisissez un nouveau statut avant de mettre a jour.";
      return;
    }
    this.orderService.updateStatus(id, status).subscribe({
      next: (order) => {
        const idx = this.orders.findIndex(o => o.id === id);
        if (idx !== -1) {
          this.orders[idx] = { ...order, _selectedStatus: order.statut };
          this.calculatePagination();
        }
        this.message = "Statut mis a jour. Le client recevra une notification.";
        this.orderService.notificationRefreshSubject.next();
      },
      error: (err) => {
        console.error("Status update error:", err);
        this.error = err?.error?.message || "Impossible de mettre a jour le statut.";
      }
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

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.orders.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    this.updatePaginatedOrders();
  }

  private updatePaginatedOrders(): void {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    this.paginatedOrders = this.orders.slice(startIdx, endIdx);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedOrders();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  isOrderUnseen(order: Order): boolean {
    return this.isSeller && order.seenBySeller === false;
  }
}
