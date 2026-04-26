import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [ProfileComponent],
  imports: [CommonModule, ReactiveFormsModule, ProfileRoutingModule]
})
export class ProfileModule {}
