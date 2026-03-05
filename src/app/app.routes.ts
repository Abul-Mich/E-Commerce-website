import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { SignupComponent } from './pages/auth/signup/signup';
import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { HomeComponent } from './pages/home/home';
import { ContactUsComponent } from './pages/contact-us/contact-us';
import { NotFoundComponent } from './pages/not-found/not-found';
import { MainLayoutComponent } from './core/layouts/main-layout';
import { AuthLayoutComponent } from './core/layouts/auth-layout';
import { ProductDetailsComponent } from './pages/product-details/product-details';
import { ProfileDropdownComponent } from './shared/components/header/profile-dropdown/profile-dropdown';
import { ProfileEditComponent } from './pages/account/profile-edit/profile-edit';
import { PaymentOptionsComponent } from './pages/account/payment-options/payment-options';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: HomeComponent },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'contact-us', component: ContactUsComponent },
      { path: 'profile', component: ProfileEditComponent },
      { path: 'payment', component: PaymentOptionsComponent },
    ],
  },

  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
    ],
  },

  { path: '**', component: NotFoundComponent },
];
