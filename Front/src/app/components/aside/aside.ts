import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../../core/services/group-service';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './aside.html'
})
export class Aside implements OnInit {
  private groupService = inject(GroupService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  
  grupos: any[] = [];
  isLoading = true;

  // Controle do Modal de Novo Grupo
  displayModal = false;
  groupForm: FormGroup;
  isSaving = false;

  constructor() {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', Validators.maxLength(100)]
    });
  }

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.isLoading = true;
    this.groupService.getAll().subscribe({
      next: (data) => {
        this.grupos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar grupos do menu lateral', err);
        this.isLoading = false;
      }
    });
  }

  // --- MÉTODOS DO MODAL ---
  
  showModal() {
    this.groupForm.reset();
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
  }

  onSubmit() {
    if (this.groupForm.valid) {
      this.isSaving = true;
      const payload = this.groupForm.value;

      this.groupService.create(payload).subscribe({
        next: (newGroup) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Sucesso', 
            detail: 'Grupo criado com sucesso!' 
          });
          
          this.loadGroups(); // Recarrega a listinha do menu
          this.hideModal();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Erro ao criar grupo', err);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Não foi possível criar o grupo.' 
          });
          this.isSaving = false;
        }
      });
    } else {
      this.groupForm.markAllAsTouched();
    }
  }

  isInvalid(controlName: string) {
    const control = this.groupForm.get(controlName);
    return control?.invalid && control?.touched;
  }
}