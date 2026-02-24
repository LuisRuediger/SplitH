import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../topbar/topbar';
import { Aside } from '../aside/aside';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Topbar, Aside],
  templateUrl: './main-layout.html'
})
export class MainLayout {}
