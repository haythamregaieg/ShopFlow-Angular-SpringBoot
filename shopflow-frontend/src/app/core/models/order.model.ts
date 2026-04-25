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
  montantRembourse?: number;
  isNewStatus?: boolean;
  dateCommande: string;
  lignes: OrderItem[];
}

export interface Address {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}