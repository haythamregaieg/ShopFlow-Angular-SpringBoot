import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  form: FormGroup;
  error = '';
  loading = false;

  asSeller = false;
  acceptedTerms = false;
  showPassword = false;

  readonly strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._#^()\-\+=]).{8,}$/;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.form = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.required,
        Validators.pattern(this.strongPasswordRegex)
      ]],

      nomBoutique: [''],
      descriptionBoutique: ['']
    });
  }

  toggleSeller(value: boolean): void {
    this.asSeller = value;

    if (!value) {
      this.form.patchValue({
        nomBoutique: '',
        descriptionBoutique: ''
      });
    }
  }

  // ✅ checkbox FIX PROPRE
  onTermsChange(event: Event): void {
    this.acceptedTerms = (event.target as HTMLInputElement).checked;
  }

  onSubmit(): void {

    this.error = '';

    if (!this.acceptedTerms) {
      this.error = "Vous devez accepter les conditions d'utilisation.";
      return;
    }

    if (this.form.invalid) {
      // Mark all controls as touched to trigger validation messages in the template
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      this.error = "Veuillez remplir correctement le formulaire.";
      return;
    }

    this.loading = true;

    const payload = {
      ...this.form.value,
      // Backend expects enum values: CUSTOMER, SELLER, ADMIN
      role: this.asSeller ? 'SELLER' : 'CUSTOMER'
    };

    const request$ = this.asSeller
      ? this.authService.registerSeller(payload)
      : this.authService.register(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l’inscription';
      }
    });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}
