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

  nbUsers = 0;
  nbProducts = 0;
  nbOrders = 0;
  nbReviews = 0;
  nbRevenue = 0;
  nbPendingOrders = 0;
  nbStockAlerts = 0;
  nbInProgressOrders = 0;
  nbTotalSpent = 0;
  nbAverageCart = 0;

  barChartType: ChartType = "bar";
  lineChartType: ChartType = "line";
  pieChartType: ChartType = "pie";
  doughnutChartType: ChartType = "doughnut";

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  chartDataTopProducts: ChartDataset[] = [
    { label: "Ventes", data: [], backgroundColor: "#F3AB7E", borderRadius: 10 }
  ];
  chartLabelsTopProducts: string[] = [];

  chartDataTopSellers: ChartDataset[] = [
    { label: "Revenus", data: [], backgroundColor: "#4F7A5E", borderRadius: 10 }
  ];
  chartLabelsTopSellers: string[] = [];

  chartDataOrdersStatus: ChartDataset[] = [
    { data: [], backgroundColor: ["#F3AB7E", "#4F7A5E", "#E2B56A", "#6A7F8C"] }
  ];
  chartLabelsOrdersStatus: string[] = [];

  chartDataOverviewPie: ChartDataset[] = [
    { data: [], backgroundColor: ["#F3AB7E", "#4F7A5E", "#E2B56A", "#6A7F8C"] }
  ];
  chartLabelsOverviewPie: string[] = [];

  chartDataMonthlySpend: ChartDataset[] = [
    { label: "Depenses", data: [], borderColor: "#4F7A5E", tension: 0.3, fill: false }
  ];
  chartLabelsMonthlySpend: string[] = [];

  chartDataCustomerStatus: ChartDataset[] = [
    { label: "Commandes", data: [], backgroundColor: "#F3AB7E" }
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

        if (this.isAdmin) {
          this.loadAdminData(response as AdminDashboardStats);
        } else if (this.isSeller) {
          this.loadSellerData(response);
        } else {
          this.loadCustomerData(response as CustomerDashboardStats);
        }

        this.loadOrdersStatus();
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

  loadAdminData(stats: AdminDashboardStats): void {
    this.nbUsers = stats.totalUsers || 0;
    this.nbProducts = stats.totalProducts || 0;
    this.nbOrders = stats.totalOrders || 0;
    this.nbReviews = stats.totalReviews || 0;
    this.nbRevenue = stats.chiffreAffaires || 0;

    this.loadOverviewPie(
      ["Users", "Products", "Orders", "Reviews"],
      [this.nbUsers, this.nbProducts, this.nbOrders, this.nbReviews]
    );

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

  loadSellerData(stats: DashboardStats): void {
    const sellerStats = stats as DashboardViewStats;
    this.nbOrders = sellerStats.totalOrders || 0;
    this.nbProducts = sellerStats.totalProducts || 0;
    this.nbRevenue = sellerStats.revenus || 0;
    this.nbPendingOrders = sellerStats.commandesEnAttente || 0;
    this.nbStockAlerts = sellerStats.alertesStockFaible || 0;

    this.loadOverviewPie(
      ["Products", "Orders", "Pending", "Stock alerts"],
      [this.nbProducts, this.nbOrders, this.nbPendingOrders, this.nbStockAlerts]
    );
  }

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

  loadCustomerData(stats: CustomerDashboardStats): void {
    this.nbOrders = stats.totalOrders || 0;
    this.nbInProgressOrders = stats.commandesEnCours || 0;
    this.nbTotalSpent = stats.totalDepense || 0;
    this.nbAverageCart = stats.panierMoyen || 0;

    this.loadOverviewPie(
      ["Orders", "In progress", "Total spent", "Average cart"],
      [this.nbOrders, this.nbInProgressOrders, this.nbTotalSpent, this.nbAverageCart]
    );

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

  loadOverviewPie(labels: string[], values: number[]): void {
    const cleanedValues = values.map(value => Number(value) || 0);
    this.chartLabelsOverviewPie = labels;
    this.chartDataOverviewPie = [
      {
        data: cleanedValues.some(value => value > 0) ? cleanedValues : [1, 1, 1, 1],
        backgroundColor: ["#F3AB7E", "#4F7A5E", "#E2B56A", "#6A7F8C"]
      }
    ];
  }
}
