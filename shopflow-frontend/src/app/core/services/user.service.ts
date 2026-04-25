import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class UserService {
  private apiUrl = "http://localhost:8081/api/users";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  activate(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/activate`, {}, { headers: this.getHeaders() });
  }

  deactivate(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }
}