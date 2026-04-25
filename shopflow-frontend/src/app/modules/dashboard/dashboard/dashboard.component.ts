import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  isAdmin = false;
  stats: any = {};
  recentOrders: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    const headers = new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
    const url = this.isAdmin
      ? "http://localhost:8081/api/dashboard/admin"
      : "http://localhost:8081/api/dashboard/customer";
    this.http.get<any>(url, { headers }).subscribe(s => {
      this.stats = s;
      this.recentOrders = s.recentOrders || [];
    });
  }
}