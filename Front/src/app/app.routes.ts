import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 1. Importe os seus componentes aqui
import { LoginForm } from './components/login-form/login-form';
import { Dashboard } from './components/dashboard/dashboard';

const routes: Routes = [
  // 2. Defina qual componente aparece em cada "endereço"
  { path: 'login', component: LoginForm },
  { path: 'dashboard', component: Dashboard },
  
  // 3. Rota padrão: Se o usuário não digitar nada, vai para o login
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
