import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Order } from "../../../core/models/order.model";
import { OrderService } from "../../../core/services/order.service";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.css"]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.orderService.getById(Number(id)).subscribe(o => this.order = o);
    }
  }

  getStatusClass(status: string): string {
    const map: any = { "PENDING": "badge-warning", "PAID": "badge-info", "DELIVERED": "badge-success", "CANCELLED": "badge-danger" };
    return map[status] || "badge-info";
  }
}
