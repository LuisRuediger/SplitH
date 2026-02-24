import { Routes } from '@angular/router';
import { LoginForm } from './components/login-form/login-form';
import { UserRegister } from './components/user-register/user-register';
import { Dashboard } from './components/dashboard/dashboard';
import { MainLayout } from './components/main-layout/main-layout'; // Importe o layout

export const routes: Routes = [
  // Rotas PÚBLICAS (Página limpa, ocupam a tela toda)
  { path: 'login', component: LoginForm },
  { path: 'register', component: UserRegister },

  // Rotas PRIVADAS (Tudo que estiver em 'children' aparecerá COM o menu lateral e superior)
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      // Futuramente: { path: 'entradas', component: Entradas }
    ]
  },

  // Redirecionamento padrão
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
