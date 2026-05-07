import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Chart, ChartDataset, ChartOptions, ChartType, registerables } from "chart.js";
import { AuthService } from "../../../core/services/auth.service";
import { DashboardService } from "../../../core/services/dashboard.service";
import {
  AdminDashboardStats,
  CustomerDashboardStats,
  DashboardStats,
  DashboardViewStats,
  RecentOrder
} from "../../../core/models/dashboard.model";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  isAdmin = false;
  isSeller = false;
  stats: DashboardViewStats = {};
  recentOrders: RecentOrder[] = [];
  accordionOpen = false;

  barChartType: ChartType = "bar";
  lineChartType: ChartType = "line";
  doughnutChartType: ChartType = "doughnut";

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Bar chart: top products
  chartDataTopProducts: ChartDataset[] = [
    {
      label: "Ventes",
      data: [],
      backgroundColor: "#F3AB7E",
      borderRadius: 10
    }
  ];
  chartLabelsTopProducts: string[] = [];

  // Bar chart: top sellers
  chartDataTopSellers: ChartDataset[] = [
    {
      label: "Revenus",
      data: [],
      backgroundColor: "#4F7A5E",
      borderRadius: 10
    }
  ];
  chartLabelsTopSellers: string[] = [];

  // Doughnut chart: orders by status
  chartDataOrdersStatus: ChartDataset[] = [
    {
      data: [],
      backgroundColor: ["#F3AB7E", "#4F7A5E", "#E2B56A", "#6A7F8C"]
    }
  ];
  chartLabelsOrdersStatus: string[] = [];

  // Line chart: monthly spend
  chartDataMonthlySpend: ChartDataset[] = [
    {
      label: "Depenses",
      data: [],
      borderColor: "#4F7A5E",
      tension: 0.3,
      fill: false
    }
  ];
  chartLabelsMonthlySpend: string[] = [];

  // Bar chart: customer orders by status
  chartDataCustomerStatus: ChartDataset[] = [
    {
      label: "Commandes",
      data: [],
      backgroundColor: "#F3AB7E"
    }
  ];
  chartLabelsCustomerStatus: string[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isSeller = this.authService.getRole() === "SELLER";

    if (!this.authService.isLoggedIn()) return;

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.getDashboardStats().subscribe({
      next: (response: DashboardStats) => {
        this.stats = response || {};
        this.recentOrders = response?.recentOrders || [];

        this.loadOrdersStatus();

        if (this.isAdmin) {
          this.loadAdminCharts(response as AdminDashboardStats);
        }

        if (!this.isAdmin && !this.isSeller) {
          this.loadCustomerCharts(response as CustomerDashboardStats);
        }
      },
      error: (err) => console.error("Dashboard error", err)
    });
  }

  toggleAccordion(): void {
    this.accordionOpen = !this.accordionOpen;
  }

  private getDashboardStats(): Observable<DashboardStats> {
    if (this.isAdmin) return this.dashboardService.getAdminStats();
    if (this.isSeller) return this.dashboardService.getSellerStats();
    return this.dashboardService.getCustomerStats();
  }

  // ============================
  // Admin charts
  // ============================
  loadAdminCharts(stats: AdminDashboardStats): void {
    const topProducts = stats.topProducts || {};

    this.chartLabelsTopProducts = Object.keys(topProducts);
    this.chartDataTopProducts = [
      {
        label: "Ventes",
        data: Object.values(topProducts).map(value => Number(value)),
        backgroundColor: "#F3AB7E",
        borderRadius: 10
      }
    ];

    const topSellers = stats.topSellers || {};

    this.chartLabelsTopSellers = Object.keys(topSellers);
    this.chartDataTopSellers = [
      {
        label: "Revenus",
        data: Object.values(topSellers).map(value => Number(value)),
        backgroundColor: "#4F7A5E",
        borderRadius: 10
      }
    ];
  }

  // ============================
  // Orders data
  // ============================
  loadOrdersStatus(): void {
    const statusCount: Record<string, number> = {};

    this.recentOrders.forEach(order => {
      const statut = order.statut?.toLowerCase() || "inconnu";
      statusCount[statut] = (statusCount[statut] || 0) + 1;
    });

    this.chartLabelsOrdersStatus = Object.keys(statusCount);
    this.chartDataOrdersStatus = [
      {
        data: Object.values(statusCount),
        backgroundColor: ["#F3AB7E", "#4F7A5E", "#E2B56A", "#6A7F8C"]
      }
    ];
  }

  // ============================
  // Customer charts
  // ============================
  loadCustomerCharts(stats: CustomerDashboardStats): void {
    const monthly = stats.depensesParMois || {};

    this.chartLabelsMonthlySpend = Object.keys(monthly);
    this.chartDataMonthlySpend = [
      {
        label: "Depenses",
        data: Object.values(monthly).map(value => Number(value)),
        borderColor: "#4F7A5E",
        tension: 0.3,
        fill: false
      }
    ];

    const statuses = stats.commandesParStatut || {};

    this.chartLabelsCustomerStatus = Object.keys(statuses);
    this.chartDataCustomerStatus = [
      {
        label: "Commandes",
        data: Object.values(statuses).map(value => Number(value)),
        backgroundColor: "#F3AB7E"
      }
    ];
  }
}
