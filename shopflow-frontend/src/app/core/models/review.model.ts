export interface Review {
  id: number;
  customerId?: number;
  customerNom?: string;
  customerPrenom?: string;
  customerEmail?: string;
  productId?: number;
  productNom?: string;
  note: number;
  commentaire: string;
  dateCreation: string;
  approuve: boolean;
}

export interface ReviewRequest {
  productId: number;
  note: number;
  commentaire: string;
}
