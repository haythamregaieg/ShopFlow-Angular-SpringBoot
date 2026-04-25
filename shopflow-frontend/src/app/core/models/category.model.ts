export interface Category {
  id: number;
  nom: string;
  description?: string;
  parent?: Category;
  sousCategories?: Category[];
}