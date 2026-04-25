import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Order } from "../../../core/models/order.model";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.css"]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const headers = new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
    this.http.get<Order[]>("http://localhost:8081/api/orders/my", { headers }).subscribe({
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
      const headers = new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
      this.http.put<Order>(`http://localhost:8081/api/orders/${id}/cancel`, {}, { headers }).subscribe(order => {
        const idx = this.orders.findIndex(o => o.id === id);
        if (idx !== -1) this.orders[idx] = order;
      });
    }
  }
}