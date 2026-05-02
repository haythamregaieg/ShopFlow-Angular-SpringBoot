import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [NavbarComponent, FooterComponent],
  imports: [CommonModule, RouterModule, MaterialModule],
  exports: [NavbarComponent, FooterComponent, MaterialModule]
})
export class SharedModule {}