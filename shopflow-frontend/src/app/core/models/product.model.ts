export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  images?: string;
  actif: boolean;
  sellerNom?: string;
  categories?: string[];
  noteMoyenne?: number;
}

export interface ProductRequest {
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  images?: string;
  categoryIds: number[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}