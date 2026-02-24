import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aside.html'
})
export class Aside {
  // Mock de grupos para visualizarmos no menu. Depois, isso virá do banco de dados.
  grupos = [
    { id: 1, nome: 'Apartamento' },
    { id: 2, nome: 'Viagem Praia' },
    { id: 3, nome: 'Churrasco' }
  ];
}