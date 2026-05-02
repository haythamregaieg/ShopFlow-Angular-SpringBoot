import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { SellerProfileService } from '../../../core/services/seller-profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  sellerForm: FormGroup;
  isSeller = false;
  success = '';
  error = '';
  loadingUser = true;
  saving = false;
  savingSeller = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private sellerProfileService: SellerProfileService
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });
    this.sellerForm = this.fb.group({
      nomBoutique: ['', Validators.required],
      description: [''],
      logo: ['']
    });
  }

  ngOnInit(): void {
    this.isSeller = this.authService.getRole() === 'SELLER';
    this.loadingUser = true;
    this.userService.getMe().subscribe({
      next: (user) => {
        this.profileForm.patchValue({ prenom: user.prenom, nom: user.nom, email: user.email });
        this.loadingUser = false;
      },
      error: () => {
        this.error = 'Erreur de chargement du profil.';
        this.loadingUser = false;
      }
    });
    if (this.isSeller) {
      this.sellerProfileService.getMyProfile().subscribe({
        next: (profile) => this.sellerForm.patchValue(profile),
        error: () => {}
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const { prenom, nom } = this.profileForm.getRawValue();
    this.userService.updateMe({ prenom, nom }).subscribe({
      next: () => {
        this.success = 'Profil utilisateur mis à jour.';
        this.error = '';
        this.saving = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Mise à jour du profil impossible.';
        this.success = '';
        this.saving = false;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  saveSellerProfile(): void {
    if (this.sellerForm.invalid) {
      this.sellerForm.markAllAsTouched();
      return;
    }
    this.savingSeller = true;
    this.sellerProfileService.updateMyProfile(this.sellerForm.value).subscribe({
      next: () => {
        this.success = 'Profil boutique mis à jour.';
        this.error = '';
        this.savingSeller = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Mise à jour de la boutique impossible.';
        this.success = '';
        this.savingSeller = false;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
}
