import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateUserProfileRequest, User } from "../models/user.model";

@Injectable({ providedIn: "root" })
export class UserService {
  private apiUrl = "http://localhost:8081/api/users";

  constructor(private http: HttpClient) {}

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  GetMe(): Observable<User> {
    return this.getMe();
  }

  updateMe(request: UpdateUserProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request);
  }

  updateMeProfile(request: UpdateUserProfileRequest): Observable<User> {
    return this.updateMe(request);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  GetAllUsers(): Observable<User[]> {
    return this.getAll();
  }

  activate(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  updateUserActivate(id: number): Observable<User> {
    return this.activate(id);
  }

  deactivate(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  updateUserDeactivate(id: number): Observable<User> {
    return this.deactivate(id);
  }
}
