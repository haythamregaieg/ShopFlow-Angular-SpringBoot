import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ProfileComponent],
  imports: [CommonModule, ReactiveFormsModule, ProfileRoutingModule, SharedModule]
})
export class ProfileModule {}
