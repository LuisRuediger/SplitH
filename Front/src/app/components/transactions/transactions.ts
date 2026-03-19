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
import { MenuModule } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    ToastModule,
    MenuModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private transactionService = inject(TransactionService);
  private confirmationService = inject(ConfirmationService);

  // Controle do Modal
  displayModal = false;
  transactionForm: FormGroup;

  // Listas de Seleção
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

  transactionsList: any[] = [];
  menuItems: MenuItem[] = [];
  selectedTransaction: any = null;
  editingId: number | null = null;

  constructor() {
    this.transactionForm = this.fb.group({
      type: ['EXPENSE', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: [null, Validators.required],
      account: [null, Validators.required],
      date: [new Date(), Validators.required], // Inicia com a data de hoje
      isShared: [false],
      sharedGroups: [null]
    });
  }

  ngOnInit() {
    this.loadTransactions();

    this.menuItems = [
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editTransaction(this.selectedTransaction) },
      { label: 'Excluir', icon: 'pi pi-trash', command: () => this.confirmDelete(this.selectedTransaction) }
    ];
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

  openMenu(event: Event, menu: any, transaction: any) {
    this.selectedTransaction = transaction; // Guarda em qual linha clicamos
    menu.toggle(event); // Abre a caixinha
  }

  editTransaction(transaction: any) {
    this.editingId = transaction.id; // Salva o ID que estamos editando

    // Converte a data "DD/MM/YYYY" da tabela de volta para o calendário do PrimeNG
    const dateParts = transaction.date.split('/');
    const dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

    const isShared = transaction.group !== 'Pessoal';

    // Preenche a janelinha com os dados antigos
    this.transactionForm.patchValue({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      account: transaction.account,
      date: dateObj,
      isShared: isShared,
      sharedGroups: isShared ? transaction.group : null
    });

    this.displayModal = true;
  }

  confirmDelete(transaction: any) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir "${transaction.description}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.transactionService.delete(transaction.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Excluído', detail: 'Transação removida.' });
            this.loadTransactions(); // Recarrega a tabela
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.' })
        });
      }
    });
  }

  // Métodos do Modal
  showModal() {
    this.editingId = null; // Garante que é uma criação nova
    this.transactionForm.reset({ type: 'EXPENSE', date: new Date(), isShared: false, sharedGroups: null });
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
    this.editingId = null; 
  }

  setTransactionType(type: 'INCOME' | 'EXPENSE') {
    this.transactionForm.get('type')?.setValue(type);
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValues = this.transactionForm.value;
      const dateObj = formValues.date as Date;
      const formattedDate = dateObj.toISOString().split('T')[0];

      const transactionPayload = {
        description: formValues.description,
        amount: formValues.amount,
        date: formattedDate,
        category: formValues.category,
        account: formValues.account,
        groupName: (formValues.isShared && formValues.sharedGroups) ? formValues.sharedGroups : 'Pessoal',
        type: formValues.type
      };

      // SE TEM UM ID, ENTÃO É EDIÇÃO (PUT). SE NÃO, É CRIAÇÃO (POST).
      if (this.editingId) {
        this.transactionService.update(this.editingId, transactionPayload).subscribe({
          next: () => {
            this.loadTransactions();
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Transação atualizada!' });
            this.hideModal();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar.' })
        });
      } else {
        this.transactionService.create(transactionPayload).subscribe({
          next: () => {
            this.loadTransactions();
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Transação salva!' });
            this.hideModal();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar.' })
        });
      }
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