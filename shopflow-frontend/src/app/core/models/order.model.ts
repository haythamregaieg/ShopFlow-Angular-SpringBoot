export interface OrderItem {
  id: number;
  productNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Order {
  id: number;
  numeroCommande: string;
  statut: string;
  sousTotal: number;
  fraisLivraison: number;
  totalTTC: number;
  dateCommande: string;
  lignes: OrderItem[];
}