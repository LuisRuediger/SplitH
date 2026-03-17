import { Component, inject, OnInit } from '@angular/core';
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
export class Transactions implements OnInit {
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

  transactionsList: any[] = [ ];

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

  ngOnInit() {
    this.loadTransactions();
  }

  // Função que vai no Java buscar os dados
  loadTransactions() {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        // O Java manda a data como YYYY-MM-DD. Vamos formatar para DD/MM/YYYY para a tela ficar bonita
        this.transactionsList = data.map(t => {
          const dateParts = t.date.split('-');
          const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;

          return {
            id: t.id,
            date: formattedDate,
            description: t.description,
            category: t.category,
            account: t.account,
            group: t.groupName, // O Java manda groupName, a tabela espera group
            type: t.type,
            amount: t.amount
          };
        });
      },
      error: (err) => {
        console.error('Erro ao buscar transações', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as transações' });
      }
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

     this.transactionService.create(transactionPayload).subscribe({
        next: (response) => {
          
          this.loadTransactions(); // <-- Chama a função para recarregar a tabela do zero!

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Transação salva no banco de dados!',
            life: 3000
          });

          this.hideModal();
        },
        error: (err) => {
          console.error('Erro ao salvar transação', err);
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