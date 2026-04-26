export interface SellerProfile {
  id: number;
  nomBoutique: string;
  description?: string;
  logo?: string;
  note?: number;
  sellerEmail?: string;
  sellerNom?: string;
  sellerPrenom?: string;
}

export interface SellerProfileRequest {
  nomBoutique: string;
  description?: string;
  logo?: string;
}
