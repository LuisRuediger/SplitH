import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginForm } from "./components/login-form/login-form";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoginForm
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Front';
}
