import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SellerGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const role = this.authService.getRole();
    if (role === 'SELLER' || role === 'ADMIN') {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
