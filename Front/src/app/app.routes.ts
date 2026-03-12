import { Routes } from '@angular/router';
import { LoginForm } from './components/login-form/login-form';
import { UserRegister } from './components/user-register/user-register';
import { Dashboard } from './components/dashboard/dashboard';
import { MainLayout } from './components/main-layout/main-layout'; // Importe o layout
import { authGuard } from './core/services/auth-guard';
import { Transactions } from './components/transactions/transactions';

export const routes: Routes = [
  // Redirecionamento padrão
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginForm },
  { path: 'register', component: UserRegister },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'transactions', component: Transactions }
    ]
  },
];
