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
    DialogModule
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions {
  private fb = inject(FormBuilder);

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
      console.log('Dados da Transação:', this.transactionForm.value);
      // Aqui enviaremos para o backend Java no futuro!
      
      this.hideModal();
    } else {
      this.transactionForm.markAllAsTouched();
    }
  }

  // Helper para erros no form
  isInvalid(controlName: string) {
    const control = this.transactionForm.get(controlName);
    return control?.invalid && control?.touched;
  }
}