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
  filteredUsers: User[] = [];
  searchTerm: string = '';
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.http.get<User[]>("https://scarecrow-erratic-pessimist.ngrok-free.dev/api/users").subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.prenom.toLowerCase().includes(term) ||
      user.nom.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  toggle(user: User): void {
    const url = user.actif
      ? `https://scarecrow-erratic-pessimist.ngrok-free.dev/api/users/${user.id}/deactivate`
      : `https://scarecrow-erratic-pessimist.ngrok-free.dev/api/users/${user.id}/activate`;
    this.http.put<User>(url, {}).subscribe(updated => {
      const idx = this.users.findIndex(u => u.id === user.id);
      if (idx !== -1) this.users[idx] = updated;
      this.filterUsers(); // met Ã  jour la vue filtrÃ©e
    });
  }
}
