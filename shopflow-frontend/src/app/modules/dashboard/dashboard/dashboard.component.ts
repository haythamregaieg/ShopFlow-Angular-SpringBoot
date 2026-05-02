import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { DashboardService } from "../../../core/services/dashboard.service";
import { Chart, ChartConfiguration, ChartType, registerables } from "chart.js";

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
  accordionOpen = false;

  // Chart configurations
  barChartType: ChartType = 'bar';
  lineChartType: ChartType = 'line';
  doughnutChartType: ChartType = 'doughnut';

  topProductsData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Ventes' }] };
  topSellersData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Revenus' }] };
  ordersStatusData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };
  monthlySpendData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], label: 'Dépenses' }] };
  customerStatusData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: 'Commandes' }] };

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isSeller = this.authService.getRole() === 'SELLER';
    if (!this.authService.isLoggedIn()) return;

    let obs;
    if (this.isAdmin) obs = this.dashboardService.getAdminStats();
    else if (this.isSeller) obs = this.dashboardService.getSellerStats();
    else obs = this.dashboardService.getCustomerStats();

    obs.subscribe({
      next: (s) => {
        this.stats = s || {};
        this.recentOrders = s?.recentOrders || [];
        this.buildCharts();
      },
      error: (err) => console.error("Dashboard error", err)
    });
  }

  toggleAccordion(): void {
    this.accordionOpen = !this.accordionOpen;
  }

  private buildCharts(): void {
    // Top produits (admin)
    const topProducts = this.stats.topProducts || {};
    this.topProductsData = {
      labels: Object.keys(topProducts),
      datasets: [{
        data: Object.values(topProducts).map(v => Number(v)),
        label: 'Ventes',
        backgroundColor: '#F3AB7E',
        borderRadius: 10
      }]
    };

    // Top vendeurs (admin)
    const topSellers = this.stats.topSellers || {};
    this.topSellersData = {
      labels: Object.keys(topSellers),
      datasets: [{
        data: Object.values(topSellers).map(v => Number(v)),
        label: 'Revenus',
        backgroundColor: '#4F7A5E',
        borderRadius: 10
      }]
    };

    // État des commandes (doughnut)
    const statusCount: Record<string, number> = {};
    this.recentOrders.forEach(o => {
      const statut = o.statut?.toLowerCase() || 'inconnu';
      statusCount[statut] = (statusCount[statut] || 0) + 1;
    });
    this.ordersStatusData = {
      labels: Object.keys(statusCount),
      datasets: [{
        data: Object.values(statusCount),
        backgroundColor: ['#F3AB7E', '#4F7A5E', '#E2B56A', '#6A7F8C']
      }]
    };

    // Client : dépenses par mois
    const monthly = this.stats.depensesParMois || {};
    this.monthlySpendData = {
      labels: Object.keys(monthly),
      datasets: [{
        data: Object.values(monthly).map(v => Number(v)),
        label: 'Dépenses',
        borderColor: '#4F7A5E',
        tension: 0.3,
        fill: false
      }]
    };

    // Client : commandes par statut
    const custStatuses = this.stats.commandesParStatut || {};
    this.customerStatusData = {
      labels: Object.keys(custStatuses),
      datasets: [{
        data: Object.values(custStatuses).map(v => Number(v)),
        label: 'Commandes',
        backgroundColor: '#F3AB7E'
      }]
    };
  }
}
