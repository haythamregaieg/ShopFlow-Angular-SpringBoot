import { Component, ElementRef, HostListener, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../core/services/user.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isSeller = false;
  userEmail = "";
  userFullName = "";
  userRole = "";
  cartCount = 0;
  isUserMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private elementRef: ElementRef
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
      } else {
        this.userFullName = "";
        this.isUserMenuOpen = false;
      }
    });
  }

  loadCartCount(): void {
    this.http.get<any>("http://localhost:8081/api/cart").subscribe({
      next: (cart) => this.cartCount = cart?.lignes?.length || 0,
      error: () => this.cartCount = 0
    });
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

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isUserMenuOpen = false;
    }
  }
}
