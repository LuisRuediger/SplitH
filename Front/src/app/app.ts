import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Removi o LoginForm daqui para ele não ficar "preso" na tela inicial

@Component({
  selector: 'app-root',
  standalone: true, // Garanta que esta linha esteja presente
  imports: [
    RouterOutlet // Deixamos apenas o RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Front';
}