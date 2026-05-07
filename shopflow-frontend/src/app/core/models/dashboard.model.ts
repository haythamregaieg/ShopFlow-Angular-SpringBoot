export interface RecentOrder {
  id: number;
  numeroCommande: string;
  totalTTC: number;
  statut: string | null;
  dateCommande: string;
}

export interface BaseDashboardStats {
  totalOrders?: number;
  nom?: string;
  email?: string;
  recentOrders?: RecentOrder[];
}

export interface AdminDashboardStats extends BaseDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  chiffreAffaires: number;
  topProducts: Record<string, number>;
  topSellers: Record<string, number>;
}

export interface SellerDashboardStats extends BaseDashboardStats {
  totalProducts: number;
  revenus: number;
  commandesEnAttente: number;
  alertesStockFaible: number;
  role?: string;
}

export interface CustomerReviewSummary {
  id: number;
  note: number;
  commentaire: string;
  dateCreation: string;
  productNom: string | null;
}

export interface CustomerDashboardStats extends BaseDashboardStats {
  commandesEnCours: number;
  totalDepense: number;
  panierMoyen: number;
  commandesParStatut: Record<string, number>;
  depensesParMois: Record<string, number>;
  derniersAvis?: CustomerReviewSummary[];
}

export type DashboardStats =
  | AdminDashboardStats
  | SellerDashboardStats
  | CustomerDashboardStats;

export interface DashboardViewStats extends BaseDashboardStats {
  totalUsers?: number;
  totalProducts?: number;
  totalReviews?: number;
  chiffreAffaires?: number;
  topProducts?: Record<string, number>;
  topSellers?: Record<string, number>;
  revenus?: number;
  commandesEnAttente?: number;
  alertesStockFaible?: number;
  role?: string;
  commandesEnCours?: number;
  totalDepense?: number;
  panierMoyen?: number;
  commandesParStatut?: Record<string, number>;
  depensesParMois?: Record<string, number>;
  derniersAvis?: CustomerReviewSummary[];
}
