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
import { TransactionService } from '../../core/services/transaction-service';

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
  private transactionService = inject(TransactionService);

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
      const formValues = this.transactionForm.value;
      const dateObj = formValues.date as Date;
      
      // Formata a data para YYYY-MM-DD (Padrão que o Java entende perfeitamente)
      const formattedDate = dateObj.toISOString().split('T')[0];

      // 1. Objeto "Payload": Formatado exatamente como o Backend (Java) espera
      const transactionPayload = {
        description: formValues.description,
        amount: formValues.amount,
        date: formattedDate,
        category: formValues.category,
        account: formValues.account,
        groupName: formValues.isShared ? formValues.sharedGroups.join(', ') : 'Pessoal',
        type: formValues.type
      };

      // 2. Chamada real para o Backend
      this.transactionService.create(transactionPayload).subscribe({
        next: (response) => {
          
          // 3. O Java respondeu com sucesso! Vamos formatar a data de volta para DD/MM/YYYY para a tela
          // (Adicionamos o T00:00:00 para evitar fuso horário puxando um dia para trás)
          const dataParaTela = new Date(response.date + 'T00:00:00').toLocaleDateString('pt-BR');

          // 4. Objeto para a Tabela: Formatado com o ID real do banco e os nomes que o HTML espera
          const transactionForTable = {
            id: response.id,           // ID verdadeiro gerado pelo PostgreSQL!
            date: dataParaTela,
            description: response.description,
            category: response.category,
            account: response.account,
            group: response.groupName, // A tabela usa 'group' em vez de 'groupName'
            type: response.type,
            amount: response.amount
          };

          // 5. Adicionamos na tabela
          this.transactionsList = [transactionForTable, ...this.transactionsList];

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Transação salva no banco de dados!',
            life: 3000
          });

          this.hideModal();
        },
        error: (err) => {
          console.error('Erro ao salvar no backend:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível salvar a transação.',
            life: 3000
          });
        }
      });

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