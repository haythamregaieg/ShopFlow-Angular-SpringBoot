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
  readonly strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._#^()\-\+=]).{8,}$/;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.pattern(this.strongPasswordRegex)]],
      nomBoutique: [''],
      logoBoutique: [''],
      descriptionBoutique: ['']
    });
  }

  toggleSeller(): void {
    this.asSeller = !this.asSeller;
    const nomBoutiqueCtrl = this.form.get('nomBoutique');
    if (!nomBoutiqueCtrl) return;
    if (this.asSeller) {
      nomBoutiqueCtrl.setValidators([Validators.required]);
    } else {
      nomBoutiqueCtrl.clearValidators();
      this.form.patchValue({
        nomBoutique: '',
        logoBoutique: '',
        descriptionBoutique: ''
      });
    }
    nomBoutiqueCtrl.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const req = this.form.value;
    const request$ = this.asSeller
      ? this.authService.registerSeller(req)
      : this.authService.register(req);
    request$.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}