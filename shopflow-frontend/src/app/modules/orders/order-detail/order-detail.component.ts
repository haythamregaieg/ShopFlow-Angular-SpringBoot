import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Order, OrderItem } from "../../../core/models/order.model";
import { OrderService } from "../../../core/services/order.service";
import { UserService } from "../../../core/services/user.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: ["./order-detail.component.css"]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  visibleLignes: OrderItem[] = [];
  currentUserId: number | null = null;
  isSeller = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      // load current user id & role first
      this.isSeller = this.authService.getRole() === 'SELLER';
      this.userService.getMe().subscribe(u => {
        this.currentUserId = u.id;
        this.orderService.getById(Number(id)).subscribe(o => {
          this.order = o;
          this.computeVisibleLignes();
          this.enrichOrderImages();
          if (!this.isSeller && o.isNewStatus) {
            this.orderService.markAsSeen(o.id).subscribe(() => {
              if (this.order) this.order = { ...this.order, isNewStatus: false };
              this.orderService.notificationRefreshSubject.next();
            });
          }
        });
      });
    }
  }

  getStatusClass(status: string): string {
    const map: any = { "PENDING": "badge-warning", "PAID": "badge-info", "DELIVERED": "badge-success", "CANCELLED": "badge-danger" };
    return map[status] || "badge-info";
  }

  computeVisibleLignes(): void {
    if (!this.order) {
      this.visibleLignes = [];
      return;
    }
    if (!this.isSeller) {
      this.visibleLignes = this.order.lignes;
      return;
    }
    // Seller: show only lines that belong to this seller
    this.visibleLignes = this.order.lignes.filter(l => l.sellerId === this.currentUserId);
    // ensure visible lines have thumbnails computed
    this.enrichVisibleLignesImages();
  }

  /**
   * Enrich order.lignes with a runtime-only _thumbnail property when
   * an images-like field is available. Accepts CSV strings, arrays or single URLs.
   */
  private enrichOrderImages(): void {
    if (!this.order || !this.order.lignes) return;
    this.order.lignes.forEach(l => {
      const imgs = this.parseImageList((l as any).images || (l as any).productImages || (l as any).image || (l as any).productImage || (l as any).productImageUrl);
      (l as any)._thumbnail = imgs.length > 0 ? imgs[0] : null;
    });
  }

  private enrichVisibleLignesImages(): void {
    if (!this.visibleLignes) return;
    this.visibleLignes.forEach(l => {
      const imgs = this.parseImageList((l as any).images || (l as any).productImages || (l as any).image || (l as any).productImage || (l as any).productImageUrl);
      (l as any)._thumbnail = imgs.length > 0 ? imgs[0] : null;
    });
  }

  private parseImageList(images?: any): string[] {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images !== 'string') return [];
    const imgs = images.split(',').map((s: string) => s.trim()).filter(Boolean);
    return imgs.filter((s: string) => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:'));
  }

  // Allow seller to update order status from detail view as well
  updateStatus(id: number, status?: string): void {
    if (!status) return;
    this.orderService.updateStatus(id, status).subscribe(o => {
      this.order = o;
      this.computeVisibleLignes();
      this.orderService.notificationRefreshSubject.next();
    });
  }
}
