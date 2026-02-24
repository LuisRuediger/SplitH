import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ToolbarModule, AvatarModule],
  templateUrl: './topbar.html',
  
})
export class Topbar {
// Variável para armazenar o nome do usuário virá do BACKEND
  nomeUsuario: string = 'Cris';
}
