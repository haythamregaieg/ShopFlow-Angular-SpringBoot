import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:8081/api/categories';

  constructor(private http: HttpClient) {}

  /** Arbre : catégories racines avec leurs sous-catégories imbriquées */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /** Liste plate dérivée de l'arbre (pas de second endpoint) */
  getAllFlat(): Observable<Category[]> {
    return this.getAll().pipe(
      map(tree => {
        const flat: Category[] = [];
        (tree || []).forEach(cat => {
          flat.push({ ...cat, sousCategories: [] });
          (cat.sousCategories || []).forEach(sub => flat.push(sub));
        });
        return flat;
      })
    );
  }

  create(request: { nom: string; description?: string; parentId?: number | null }): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, request);
  }

  update(id: number, request: { nom: string; description?: string; parentId?: number | null }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
