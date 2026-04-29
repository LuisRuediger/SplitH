import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { TransactionService } from '../../core/services/transaction-service';
import { GroupService } from '../../core/services/group-service';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
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
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class TransactionsComponent implements OnInit { // Alterado para TransactionsComponent (boa prática Angular)
  
  // Injeções
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private transactionService = inject(TransactionService);
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);

  // --- VARIÁVEIS DE UPLOAD (MVP) ---
  selectedFile: File | null = null;
selectedBank: string = 'NUBANK_CSV';
  groupId: number = 1; 
  isUploading: boolean = false;

  // --- VARIÁVEIS DE LISTAGEM E FILTROS ---
  allTransactions: any[] = [];
  transactionsList: any[] = [];
  selectedPeriod: string = 'thisMonth';
  customDateRange: Date[] = [];
  periodOptions = [
    { label: 'Este Mês', value: 'thisMonth' },
    { label: 'Último Mês', value: 'lastMonth' },
    { label: 'Últimos 30 dias', value: 'last30days' },
    { label: 'Este Ano', value: 'thisYear' },
    { label: 'Todo o Período', value: 'all' },
    { label: 'Personalizado...', value: 'custom' }
  ];

  // --- VARIÁVEIS DA TABELA E AÇÕES ---
  menuItems: MenuItem[] = [];
  selectedTransaction: any = null;

  // --- VARIÁVEIS DO MODAL/FORMULÁRIO ---
  displayModal = false;
  editingId: number | null = null;
  transactionForm: FormGroup;
  
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

  groups: { label: string, value: string, disabled: boolean }[] = [];

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

  // =========================================================================
  // MÉTODOS DE BUSCA E FILTRO
  // =========================================================================

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
            group: t.group?.name ?? 'Pessoal',
            type: t.type,
            amount: t.amount,
            rawDate: new Date(t.date + 'T00:00:00')
          };
        });
        
        this.applyFilter();
      },
      error: (err) => {
        console.error('Erro ao buscar transações', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as transações' });
      }
    });
  }

  loadGroups() {
    const token = this.authService.token;
    let currentUserEmail = '';
    if (token) {
      try {
        currentUserEmail = JSON.parse(atob(token.split('.')[1])).sub ?? '';
      } catch { }
    }

    this.groupService.getAll().subscribe({
      next: (data) => {
        this.groups = data.map(g => {
          const member = g.members?.find(m => m.email === currentUserEmail);
          return { label: g.name, value: g.name, disabled: member?.role === 'VIEWER' };
        });
      },
      error: (err) => console.error('Erro ao carregar grupos', err)
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

    this.transactionsList = [...filtered];
  }

  // =========================================================================
  // IMPORTAÇÃO DE EXTRATO (UPLOAD)
  // =========================================================================

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      this.selectedFile = file;
      const allowedExtensions = ['.csv', '.xls', '.xlsx', '.ofx'];
      const fileName = file.name.toLowerCase();
      
      const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!isValid) {
        this.messageService.add({ severity: 'warn', summary: 'Arquivo não suportado', detail: 'Selecione apenas arquivos .CSV, .XLS, .XLSX ou .OFX.' });
        event.target.value = ''; 
        this.selectedFile = null;
        return; 
      }

      this.isUploading = true;
      this.messageService.add({ severity: 'info', summary: 'Processando Extrato', detail: `Lendo arquivo ${file.name}...` });
      
      // Chamada atualizada com a String 'Pessoal' como primeiro parâmetro
      this.transactionService.uploadStatement('Pessoal', this.selectedFile, this.selectedBank).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Importação Concluída', detail: 'As transações foram adicionadas.' });
          this.isUploading = false;
          this.selectedFile = null;
          this.loadTransactions(); 
        },
        error: (err) => {
          // Alterado para imprimir o erro detalhado que vem do Java
          console.error('Erro detalhado do Back-end:', err.error);
          this.isUploading = false;
          
          // Tenta exibir a mensagem que veio do Java, senão exibe a genérica
          const msgErro = typeof err.error === 'string' ? err.error : 'Falha ao processar o arquivo.';
          this.messageService.add({ severity: 'error', summary: 'Erro na Importação', detail: msgErro });
        }
      });

      event.target.value = '';
    }
  }

  // =========================================================================
  // AÇÕES DA TABELA
  // =========================================================================

  openMenu(event: Event, menu: any, transaction: any) {
    this.selectedTransaction = transaction; 
    menu.toggle(event); 
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

  // =========================================================================
  // CONTROLE DO MODAL DE CRIAÇÃO/EDIÇÃO
  // =========================================================================

  showModal() {
    this.editingId = null; 
    this.transactionForm.reset({ type: 'EXPENSE', date: new Date(), isShared: false, sharedGroups: null });
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
    this.editingId = null; 
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

  getCategoryStyle(category: string): string {
    const styles: { [key: string]: string } = {
      'Alimentação': 'bg-amber-500/15 text-amber-400',
      'Casa': 'bg-rose-500/15 text-rose-400',
      'Utilidades': 'bg-sky-500/15 text-sky-400',
      'Transporte': 'bg-violet-500/15 text-violet-400',
      'Lazer': 'bg-purple-500/15 text-purple-400',
      'Saúde': 'bg-emerald-500/15 text-emerald-400',
    };
    return styles[category] ?? 'bg-zinc-500/15 text-zinc-400';
  }

  isInvalid(controlName: string) {
    const control = this.transactionForm.get(controlName);
    return control?.invalid && control?.touched;
  }
}