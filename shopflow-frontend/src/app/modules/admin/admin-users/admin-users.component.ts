import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "../../../core/models/user.model";

@Component({
  selector: "app-admin-users",
  templateUrl: "./admin-users.component.html",
  styleUrls: ["./admin-users.component.css"]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>("http://localhost:8081/api/users")
      .subscribe(users => this.users = users);
  }

  toggle(user: User): void {
    const url = user.actif
      ? `http://localhost:8081/api/users/${user.id}/deactivate`
      : `http://localhost:8081/api/users/${user.id}/activate`;
    this.http.put<User>(url, {}).subscribe(updated => {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = updated;
    });
  }
}
