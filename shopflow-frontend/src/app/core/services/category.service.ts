import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:8081/api/categories';

  constructor(private http: HttpClient) {}

  /** Arbre : catégories racines avec leurs sous-catégories */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /** Liste plate de toutes les catégories */
  getAllFlat(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/flat`);
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
