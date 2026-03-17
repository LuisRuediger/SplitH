import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    MultiSelectModule,
    DialogModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  // Controle do Modal
  displayModal = false;
  transactionForm: FormGroup;

  // Listas de Seleção (Mocks que depois virão do Banco de Dados)
  categories = [
    { label: 'Alimentação', value: 'Alimentação' },
    { label: 'Transporte', value: 'Transporte' },
    { label: 'Casa', value: 'Casa' },
    { label: 'Lazer', value: 'Lazer' },
    { label: 'Utilidades', value: 'Utilidades' }
  ];

  accounts = [
    { label: 'Conta Corrente', value: 'Conta Corrente' },
    { label: 'Conta Poupança', value: 'Conta Poupança' },
    { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
    { label: 'Cartão de Débito', value: 'Cartão de Débito' },
    { label: 'Dinheiro', value: 'Dinheiro' }
  ];

  groups = [
    { label: 'Apartamento', value: 'Apartamento' },
    { label: 'Viagem Praia', value: 'Viagem Praia' },
    { label: 'Churrasco', value: 'Churrasco' }
  ];

  transactionsList = [
    { id: 1, date: '11/03/2026', description: 'Mercado Mensal', category: 'Alimentação', account: 'Conta Corrente', group: 'Apartamento', type: 'EXPENSE', amount: 450.00 },
    { id: 2, date: '10/03/2026', description: 'Pix do Churrasco', category: 'Lazer', account: 'Conta Corrente', group: 'Churrasco', type: 'INCOME', amount: 60.00 },
    // ... seus outros mocks ...
  ];

  constructor() {
    this.transactionForm = this.fb.group({
      type: ['EXPENSE', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: [null, Validators.required],
      account: [null, Validators.required],
      date: [new Date(), Validators.required], // Inicia com a data de hoje
      isShared: [false],
      sharedGroups: [[]]
    });
  }

  // Métodos do Modal
  showModal() {
    this.transactionForm.reset({ type: 'EXPENSE', date: new Date(), isShared: false, sharedGroups: [] });
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
  }

  setTransactionType(type: 'INCOME' | 'EXPENSE') {
    this.transactionForm.get('type')?.setValue(type);
  }

 onSubmit() {
    if (this.transactionForm.valid) {
      // 1. Pega todos os valores preenchidos
      const formValues = this.transactionForm.value;

      // 2. Formata a data (de objeto Date do Angular para string 'dd/mm/yyyy')
      const dateObj = formValues.date as Date;
      const formattedDate = dateObj.toLocaleDateString('pt-BR');

    // 3. Monta o objeto da nova transação
      const newTransaction = {
        id: Math.floor(Math.random() * 1000), // Simula um ID pro nosso Mock
        date: formattedDate,
        description: formValues.description,
        category: formValues.category, // <-- Adicionando a Categoria
        account: formValues.account,   // <-- Adicionando a Conta
        // Lembra que estamos focando no pessoal primeiro? Se não for compartilhado, fica "Pessoal"
        group: formValues.isShared ? formValues.sharedGroups.join(', ') : 'Pessoal', 
        type: formValues.type,
        amount: formValues.amount
      };

      // 4. Adiciona no TOPO da lista (O spread operator [...] ajuda o Angular a atualizar a tabela na hora)
      this.transactionsList = [newTransaction, ...this.transactionsList];

      // 5. Mostra a notificação verde de sucesso na tela
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Transação adicionada com sucesso!',
        life: 3000 // Some em 3 segundos
      });

      // 6. Fecha a janelinha
      this.hideModal();
    } else {
      // Se tiver erro de validação (ex: esqueceu o valor), ele deixa os campos vermelhos
      this.transactionForm.markAllAsTouched();
    }
  }

  // Helper para erros no form
  isInvalid(controlName: string) {
    const control = this.transactionForm.get(controlName);
    return control?.invalid && control?.touched;
  }
}