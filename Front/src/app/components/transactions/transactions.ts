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
import { GroupService } from '../../core/services/group-service'; // <-- 1. Importamos o serviço de Grupos
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
  private groupService = inject(GroupService); // <-- 2. Injetamos o serviço
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
    { label: 'Utilidades', value: 'Utilidades' },
    { label: 'Saúde', value: 'Saúde' }
  ];

  accounts = [
    { label: 'Conta Corrente', value: 'Conta Corrente' },
    { label: 'Conta Poupança', value: 'Conta Poupança' },
    { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
    { label: 'Cartão de Débito', value: 'Cartão de Débito' },
    { label: 'Dinheiro', value: 'Dinheiro' }
  ];

  groups: { label: string, value: string }[] = []; // <-- 3. Agora começa vazio e recebe o tipo correto

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
      date: [new Date(), Validators.required], 
      isShared: [false],
      sharedGroups: [null]
    });
  }

  ngOnInit() {
    this.loadTransactions();
    this.loadGroups(); // <-- 4. Chama a busca de grupos ao abrir a tela

    this.menuItems = [
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editTransaction(this.selectedTransaction) },
      { label: 'Excluir', icon: 'pi pi-trash', command: () => this.confirmDelete(this.selectedTransaction) }
    ];
  }

  // --- BUSCA DE DADOS ---

  loadTransactions() {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactionsList = data.map(t => {
          const dateParts = t.date.split('-');
          const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;

          return {
            id: t.id,
            date: formattedDate,
            description: t.description,
            category: t.category,
            account: t.account,
            group: t.groupName, 
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

  loadGroups() {
    this.groupService.getAll().subscribe({
      next: (data) => {
        // Mapeia os grupos do banco (que tem id, name, description) para o formato do Dropdown (label, value)
        this.groups = data.map(g => ({
          label: g.name,
          value: g.name // Salvamos o nome pois a sua entidade Transaction no Java espera uma String 'groupName'
        }));
      },
      error: (err) => console.error('Erro ao carregar grupos', err)
    });
  }

  // --- MÉTODOS DE AÇÃO NA TABELA ---

  openMenu(event: Event, menu: any, transaction: any) {
    this.selectedTransaction = transaction; 
    menu.toggle(event); 
  }

  editTransaction(transaction: any) {
    this.editingId = transaction.id; 

    const dateParts = transaction.date.split('/');
    const dateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

    const isShared = transaction.group && transaction.group !== 'Pessoal';

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
            this.loadTransactions(); 
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.' })
        });
      }
    });
  }

  // --- MÉTODOS DO MODAL ---

  showModal() {
    this.editingId = null; 
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
        // Se ativou o toggle, manda o grupo escolhido. Se não, salva como 'Pessoal'
        groupName: (formValues.isShared && formValues.sharedGroups) ? formValues.sharedGroups : 'Pessoal',
        type: formValues.type
      };

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

  isInvalid(controlName: string) {
    const control = this.transactionForm.get(controlName);
    return control?.invalid && control?.touched;
  }
}