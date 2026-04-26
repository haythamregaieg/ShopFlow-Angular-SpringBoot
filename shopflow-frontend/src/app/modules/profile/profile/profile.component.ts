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
    this.userService.getMe().subscribe({
      next: (user) => this.profileForm.patchValue({ prenom: user.prenom, nom: user.nom, email: user.email }),
      error: () => this.error = 'Erreur de chargement du profil.'
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
    const { prenom, nom } = this.profileForm.getRawValue();
    this.userService.updateMe({ prenom, nom }).subscribe({
      next: () => {
        this.success = 'Profil utilisateur mis a jour.';
        this.error = '';
      },
      error: () => {
        this.error = 'Mise a jour du profil impossible.';
        this.success = '';
      }
    });
  }

  saveSellerProfile(): void {
    if (this.sellerForm.invalid) {
      this.sellerForm.markAllAsTouched();
      return;
    }
    this.sellerProfileService.updateMyProfile(this.sellerForm.value).subscribe({
      next: () => {
        this.success = 'Profil boutique mis a jour.';
        this.error = '';
      },
      error: () => {
        this.error = 'Mise a jour de la boutique impossible.';
        this.success = '';
      }
    });
  }
}
