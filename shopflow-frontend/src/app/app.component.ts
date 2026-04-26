import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'shopflow-frontend';

  constructor(private router: Router) {}

  get shouldShowLayout(): boolean {
    return !['/auth/login', '/auth/register'].some(path => this.router.url.startsWith(path));
  }
}
