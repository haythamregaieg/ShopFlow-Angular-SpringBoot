export interface Review {
  id: number;
  customer?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  product?: {
    id: number;
    nom: string;
  };
  note: number;
  commentaire: string;
  dateCreation: string;
  approuve: boolean;
  // Temporary fields for template compatibility if needed
  customerNom?: string;
  productNom?: string;
  productId?: number;
}

export interface ReviewRequest {
  productId: number;
  note: number;
  commentaire: string;
}
