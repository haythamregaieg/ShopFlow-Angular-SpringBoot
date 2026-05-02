export interface OrderItem {
  id: number;
  productNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  // Seller info populated by backend so frontend can filter lines for a seller
  sellerId?: number | null;
  sellerNom?: string | null;
}

export interface Order {
  id: number;
  numeroCommande: string;
  statut: string;
  customerNom?: string;
  customerPrenom?: string;
  customerEmail?: string;
  adresseLivraison?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  } | null;
  sousTotal: number;
  fraisLivraison: number;
  totalTTC: number;
  montantRembourse?: number;
  isNewStatus?: boolean;
  dateCommande: string;
  lignes: OrderItem[];
  // UI helper: selected status in the order list (not persisted)
  _selectedStatus?: string;
}

export interface Address {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}
