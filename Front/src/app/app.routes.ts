import { Routes } from '@angular/router';

// 1. Importação dos componentes
import { LoginForm } from './components/login-form/login-form';
import { Dashboard } from './components/dashboard/dashboard';

// 2. Exportação direta da constante 'routes'
export const routes: Routes = [
  { path: 'login', component: LoginForm },
  { path: 'dashboard', component: Dashboard },
  
  // Rota padrão (sem a barra inicial no redirectTo para evitar erros em algumas versões)
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
