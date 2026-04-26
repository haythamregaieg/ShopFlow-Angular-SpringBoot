import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { DashboardService } from "../../../core/services/dashboard.service";
import { ChartConfiguration, ChartType } from "chart.js";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  isAdmin = false;
  isSeller = false;
  stats: any = {};
  recentOrders: any[] = [];
  barChartType: ChartType = 'bar';
  lineChartType: ChartType = 'line';
  doughnutChartType: ChartType = 'doughnut';
  topProductsData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Ventes' }] };
  topSellersData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Revenus' }] };
  ordersStatusData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };
  monthlySpendData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: 'Depenses' }] };
  customerStatusData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Commandes' }] };

  constructor(private authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isSeller = this.authService.getRole() === 'SELLER';

    if (!this.authService.isLoggedIn()) return;

    let obs;
    if (this.isAdmin) {
      obs = this.dashboardService.getAdminStats();
    } else if (this.isSeller) {
      obs = this.dashboardService.getSellerStats();
    } else {
      obs = this.dashboardService.getCustomerStats();
    }

    obs.subscribe({
      next: (s) => {
        this.stats = s;
        this.recentOrders = s.recentOrders || [];
        this.buildCharts();
      },
      error: (err) => console.error("Dashboard error", err)
    });
  }

  private buildCharts(): void {
    const topProducts = this.stats.topProducts || {};
    const topSellers = this.stats.topSellers || {};
    const customerMonthly = this.stats.depensesParMois || {};
    const customerStatuses = this.stats.commandesParStatut || {};
    this.topProductsData = {
      labels: Object.keys(topProducts),
      datasets: [{ data: (Object.values(topProducts) as any[]).map(v => Number(v)), label: 'Ventes' }]
    };
    this.topSellersData = {
      labels: Object.keys(topSellers),
      datasets: [{ data: (Object.values(topSellers) as any[]).map(v => Number(v)), label: 'Revenus' }]
    };
    const statusCount: Record<string, number> = {};
    this.recentOrders.forEach(o => {
      statusCount[o.statut] = (statusCount[o.statut] || 0) + 1;
    });
    this.ordersStatusData = {
      labels: Object.keys(statusCount),
      datasets: [{ data: Object.values(statusCount) }]
    };
    this.monthlySpendData = {
      labels: Object.keys(customerMonthly),
      datasets: [{ data: (Object.values(customerMonthly) as any[]).map(v => Number(v)), label: 'Depenses' }]
    };
    this.customerStatusData = {
      labels: Object.keys(customerStatuses),
      datasets: [{ data: (Object.values(customerStatuses) as any[]).map(v => Number(v)), label: 'Commandes' }]
    };
  }
}
