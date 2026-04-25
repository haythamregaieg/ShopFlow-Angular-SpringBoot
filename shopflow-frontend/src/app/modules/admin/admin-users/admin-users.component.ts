import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { User } from "../../../core/models/user.model";

@Component({
  selector: "app-admin-users",
  templateUrl: "./admin-users.component.html",
  styleUrls: ["./admin-users.component.css"]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: "Bearer " + localStorage.getItem("token") });
  }

  ngOnInit(): void {
    this.http.get<User[]>("http://localhost:8081/api/users", { headers: this.getHeaders() })
      .subscribe(users => this.users = users);
  }

  toggle(user: User): void {
    const url = user.actif
      ? `http://localhost:8081/api/users/${user.id}/deactivate`
      : `http://localhost:8081/api/users/${user.id}/activate`;
    this.http.put<User>(url, {}, { headers: this.getHeaders() }).subscribe(updated => {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = updated;
    });
  }
}