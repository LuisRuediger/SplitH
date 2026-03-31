import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarModule,
    MenuModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './topbar.html',
})
export class Topbar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  nomeUsuario: string = 'Usuário';
  iniciais: string = 'U';
  
  // Configuração do Menu Dropdown
  userMenuItems: MenuItem[] | undefined;

  // Configuração do Modal de Perfil
  displayProfileModal = false;
  profileForm: FormGroup;
  isSaving = false;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['']
    });
  }

  ngOnInit() {
    this.extractUserData();

    // Itens que vão aparecer quando clicar na foto
    this.userMenuItems = [
      {
        label: 'Meu Perfil',
        icon: 'pi pi-user-edit',
        command: () => this.showProfileModal()
      },
      {
        separator: true
      },
      {
        label: 'Sair do Sistema',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  // Lê o Token JWT para descobrir o email do usuário logado e criar um nome provisório
  extractUserData() {
    const token = this.authService.token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub; // Pega o email (ex: cris@email.com)
        
        // Pega só a parte antes do @ e coloca a primeira letra maiúscula
        this.nomeUsuario = email.split('@')[0];
        this.nomeUsuario = this.nomeUsuario.charAt(0).toUpperCase() + this.nomeUsuario.slice(1);
        this.iniciais = this.nomeUsuario.charAt(0).toUpperCase();

      } catch (e) {
        console.error('Erro ao ler token JWT', e);
      }
    }
  }

  // --- MÉTODOS DO PERFIL ---

  showProfileModal() {
    // Preenche o formulário com o nome atual antes de abrir
    this.profileForm.patchValue({
      name: this.nomeUsuario,
      phone: '' // O telefone virá do backend no futuro
    });
    this.displayProfileModal = true;
  }

  hideProfileModal() {
    this.displayProfileModal = false;
  }

  onSaveProfile() {
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      // Simulando o tempo de ir no servidor Java salvar
      setTimeout(() => {
        const newName = this.profileForm.value.name;
        this.nomeUsuario = newName;
        this.iniciais = newName.charAt(0).toUpperCase();
        
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado com sucesso!' });
        this.isSaving = false;
        this.hideProfileModal();

        // NOTA: Para funcionar de verdade, você precisará criar um método no Java (ex: PUT /users/me) 
        // para atualizar esses dados no banco! Por enquanto é só visual.
      }, 1000);
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}