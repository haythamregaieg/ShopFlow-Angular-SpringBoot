export interface Category {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
  parentNom?: string;
  sousCategories?: Category[];
}

export interface CategoryInfo {
  id: number;
  nom: string;
  parentId?: number;
  parentNom?: string;
}
