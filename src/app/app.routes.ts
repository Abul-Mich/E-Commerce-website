import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';
import { MainLayoutComponent } from './core/layouts/main-layout';
import { AuthLayoutComponent } from './core/layouts/auth-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./pages/product-details/product-details').then((m) => m.ProductDetailsComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
        canActivate: [authGuard],
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./pages/contact-us/contact-us').then((m) => m.ContactUsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/account/profile-edit/profile-edit').then((m) => m.ProfileEditComponent),
        canActivate: [authGuard],
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./pages/account/payment-options/payment-options').then(
            (m) => m.PaymentOptionsComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/cart/cart-page/cart-page').then((m) => m.CartPageComponent),
      },
    ],
  },

  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/auth/signup/signup').then((m) => m.SignupComponent),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
