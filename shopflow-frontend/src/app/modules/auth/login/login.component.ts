// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  // Getter pour accès facile aux champs du formulaire
  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Email ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }
}
