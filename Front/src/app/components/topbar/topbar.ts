import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ToolbarModule, AvatarModule, ButtonModule],
  templateUrl: './topbar.html',
  
})
export class Topbar {
// Variável para armazenar o nome do usuário virá do BACKEND
  nomeUsuario: string = 'Cris';
}

export class ToolbarCustomDemo {}

