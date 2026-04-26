import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./modules/products/products.module').then(m => m.ProductsModule)
  },
  {
    path: 'cart',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: '/products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
