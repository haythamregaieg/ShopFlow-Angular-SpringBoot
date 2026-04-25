export interface CartItem {
  id: number;
  productId: number;
  productNom: string;
  productImage?: string;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
}

export interface Cart {
  id: number;
  lignes: CartItem[];
  couponCode?: string;
  remise: number;
  sousTotal: number;
  fraisLivraison: number;
  totalTTC: number;
}