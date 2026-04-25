import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  userEmail = "";
  userRole = "";
  cartCount = 0;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === "ADMIN";
      this.userEmail = user?.email || "";
      this.userRole = user?.role || "";
      if (user) this.loadCartCount();
    });
  }

  loadCartCount(): void {
    const headers = new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
    this.http.get<any>("http://localhost:8081/api/cart", { headers }).subscribe({
      next: (cart) => this.cartCount = cart?.lignes?.length || 0,
      error: () => this.cartCount = 0
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/auth/login"]);
  }
}