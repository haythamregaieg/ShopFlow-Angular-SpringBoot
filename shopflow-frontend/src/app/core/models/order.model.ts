export interface OrderItem {
  id: number;
  productNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
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
  telephone?: string;
  adresseLivraison?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  } | null;
  sousTotal: number;
  couponCode?: string | null;
  remise?: number | null;
  fraisLivraison: number;
  totalTTC: number;
  montantRembourse?: number;
  isNewStatus?: boolean;
  seenBySeller?: boolean;
  dateCommande: string;
  lignes: OrderItem[];
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
