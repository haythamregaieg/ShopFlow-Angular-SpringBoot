import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Order } from "../../../core/models/order.model";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.css"]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    const headers = new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
    if (id) {
      this.http.get<Order>(`http://localhost:8081/api/orders/${id}`, { headers }).subscribe(o => this.order = o);
    }
  }

  getStatusClass(status: string): string {
    const map: any = { "PENDING": "badge-warning", "PAID": "badge-info", "DELIVERED": "badge-success", "CANCELLED": "badge-danger" };
    return map[status] || "badge-info";
  }
}