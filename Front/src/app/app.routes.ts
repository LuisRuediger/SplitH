import { Routes } from '@angular/router';

// 1. Importação dos componentes
import { LoginForm } from './components/login-form/login-form';
import { UserRegister } from './components/user-register/user-register';

// 2. Exportação direta da constante 'routes'
export const routes: Routes = [
  { path: 'login', component: LoginForm },
  { path: 'register', component: UserRegister },

  // Rota padrão (sem a barra inicial no redirectTo para evitar erros em algumas versões)
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
