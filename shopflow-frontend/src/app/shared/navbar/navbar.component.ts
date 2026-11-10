import { Component, ElementRef, HostListener, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../core/services/user.service";
import { OrderService } from "../../core/services/order.service";
import { Order } from "../../core/models/order.model";
import { SellerProfileService } from "../../core/services/seller-profile.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  isSeller = false;
  userEmail = "";
  userFullName = "";
  userRole = "";
  cartCount = 0;
  notificationCount = 0;
  isUserMenuOpen = false;
  avatarImageUrl = "";
  avatarImageFailed = false;
  private pollingInterval: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private elementRef: ElementRef,
    private orderService: OrderService,
    private sellerProfileService: SellerProfileService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === "ADMIN";
      this.isSeller = user?.role === "SELLER";
      this.userEmail = user?.email || "";
      this.userRole = user?.role || "";
      if (user) {
        this.loadCartCount();
        this.loadUserIdentity();
        this.loadAvatarImage();
        this.loadNotificationCount();
        this.startPolling();
      } else {
        this.userFullName = "";
        this.avatarImageUrl = "";
        this.avatarImageFailed = false;
        this.isUserMenuOpen = false;
        this.notificationCount = 0;
        this.stopPolling();
      }
    });

    this.orderService.notificationRefresh$.subscribe(() => {
      this.loadNotificationCount();
    });

    this.sellerProfileService.profileRefresh$.subscribe(profile => {
      this.avatarImageUrl = profile.logo || "";
      this.avatarImageFailed = false;
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(() => {
      if (this.isLoggedIn) {
        this.loadNotificationCount();
        this.loadCartCount();
      }
    }, 5000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  loadCartCount(): void {
    this.http.get<any>("https://scarecrow-erratic-pessimist.ngrok-free.dev/api/cart").subscribe({
      next: (cart) => this.cartCount = cart?.lignes?.length || 0,
      error: () => this.cartCount = 0
    });
  }

  loadNotificationCount(): void {
    if (this.isSeller) {
      this.orderService.getSellerOrders().subscribe({
        next: (orders: Order[]) => {
          this.notificationCount = orders.filter(o => o.seenBySeller === false).length;
        },
        error: () => { this.notificationCount = 0; }
      });
    } else if (!this.isAdmin) {
      this.orderService.getMyOrders().subscribe({
        next: (orders: Order[]) => {
          this.notificationCount = orders.filter(o => o.isNewStatus).length;
        },
        error: () => { this.notificationCount = 0; }
      });
    }
  }

  refreshNotificationCount(): void {
    this.loadNotificationCount();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/auth/login"]);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  onAvatarImageError(): void {
    this.avatarImageFailed = true;
  }

  get userInitial(): string {
    if (this.userFullName) {
      return this.userFullName.charAt(0).toUpperCase();
    }
    return this.userEmail ? this.userEmail.charAt(0).toUpperCase() : "U";
  }

  private loadUserIdentity(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.userFullName = `${user.prenom || ""} ${user.nom || ""}`.trim();
      },
      error: () => {
        this.userFullName = this.userEmail ? this.userEmail.split("@")[0] : "Utilisateur";
      }
    });
  }

  private loadAvatarImage(): void {
    this.avatarImageUrl = "";
    this.avatarImageFailed = false;
    if (!this.isSeller) return;

    this.sellerProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.avatarImageUrl = profile.logo || "";
        this.avatarImageFailed = false;
      },
      error: () => {
        this.avatarImageUrl = "";
        this.avatarImageFailed = true;
      }
    });
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isUserMenuOpen = false;
    }
  }
}
