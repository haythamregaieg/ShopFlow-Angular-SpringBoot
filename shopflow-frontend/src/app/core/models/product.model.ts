export interface ProductCategoryInfo {
  id: number;
  nom: string;
  parentId?: number;
  parentNom?: string;
}

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
  categoryIds?: number[];
  categoryDetails?: ProductCategoryInfo[];
  noteMoyenne?: number;
  fraisLivraisonLocal?: number;
  fraisLivraisonInternational?: number;
  promotion?: boolean;
  pourcentageRemise?: number;
}

export interface ProductRequest {
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  images?: string;
  categoryIds: number[];
  fraisLivraisonLocal?: number;
  fraisLivraisonInternational?: number;
}

export interface ProductVariant {
  id?: number;
  nom?: string;
  taille: string;
  couleur: string;
  stock: number;
  prixDelta?: number;
  sku?: string;
}

export interface ProductSearchParams {
  q?: string;
  prixMin?: number;
  prixMax?: number;
  categoryIds?: number[];
  promoOnly?: boolean;
  sortBy?: 'prix_asc' | 'prix_desc' | 'popularite' | 'nouveautes';
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
