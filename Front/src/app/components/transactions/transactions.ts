import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms'; // FormsModule adicionado aqui
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
import { GroupService } from '../../core/services/group-service';
import { MenuModule } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, // E adicionado aqui também!
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
  private groupService = inject(GroupService);
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

  groups: { label: string, value: string }[] = [];

  // NOVAS VARIÁVEIS PARA O FILTRO E IMPORTAÇÃO
  allTransactions: any[] = [];
  transactionsList: any[] = [];
  
  periodOptions = [
    { label: 'Este Mês', value: 'thisMonth' },
    { label: 'Último Mês', value: 'lastMonth' },
    { label: 'Últimos 30 dias', value: 'last30days' },
    { label: 'Este Ano', value: 'thisYear' },
    { label: 'Todo o Período', value: 'all' },
    { label: 'Personalizado...', value: 'custom' }
  ];
  
  selectedPeriod: string = 'thisMonth';
  customDateRange: Date[] = [];

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
    this.loadGroups();

    this.menuItems = [
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editTransaction(this.selectedTransaction) },
      { label: 'Excluir', icon: 'pi pi-trash', command: () => this.confirmDelete(this.selectedTransaction) }
    ];
  }

  // --- BUSCA DE DADOS E FILTROS ---

  loadTransactions() {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.allTransactions = data.map(t => {
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
            amount: t.amount,
            rawDate: new Date(t.date + 'T00:00:00') // Salva a data real para facilitar o filtro
          };
        });
        
        // Aplica o filtro de período assim que carrega
        this.applyFilter();
      },
      error: (err) => {
        console.error('Erro ao buscar transações', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as transações' });
      }
    });
  }

  onPeriodChange() {
    if (this.selectedPeriod !== 'custom') {
      this.applyFilter();
    }
  }

  onCustomDateChange() {
    if (this.customDateRange && this.customDateRange.length === 2 && this.customDateRange[1]) {
      this.applyFilter();
    }
  }

  applyFilter() {
    let filtered = this.allTransactions;
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = new Date();

    switch (this.selectedPeriod) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last30days':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (this.customDateRange && this.customDateRange.length === 2 && this.customDateRange[1]) {
          startDate = this.customDateRange[0];
          endDate = this.customDateRange[1];
          endDate.setHours(23, 59, 59, 999);
        } else {
          return;
        }
        break;
      case 'all':
      default:
        startDate = null;
        endDate = null;
        break;
    }

    if (startDate && endDate) {
      filtered = this.allTransactions.filter(t => t.rawDate >= startDate! && t.rawDate <= endDate!);
    }

    // Atualiza a tabela com a lista filtrada
    this.transactionsList = [...filtered];
  }

  loadGroups() {
    this.groupService.getAll().subscribe({
      next: (data) => {
        this.groups = data.map(g => ({
          label: g.name,
          value: g.name
        }));
      },
      error: (err) => console.error('Erro ao carregar grupos', err)
    });
  }

  // --- IMPORTAÇÃO DE EXTRATO ---

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      this.messageService.add({ severity: 'info', summary: 'Processando Extrato', detail: `Lendo arquivo ${file.name}...` });
      
      // O fluxo de envio para o Backend entrará aqui usando FormData futuramente.
      
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = '';
    }
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