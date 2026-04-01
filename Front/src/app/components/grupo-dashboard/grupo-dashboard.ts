import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { GroupService } from '../../core/services/group-service';
import { TransactionService } from '../../core/services/transaction-service';
import { AuthService } from '../../core/services/auth-service';

export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  amount: number;
  percentage: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  categoryColor: string;
  paidBy: string;
  paidByInitials: string;
  totalAmount: number;
  userShare: number;
  status: boolean;
}

@Component({
  selector: 'app-grupo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ChartModule,
    SelectModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './grupo-dashboard.html',
  styleUrl: './grupo-dashboard.css',
})
export class GrupoDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  chartData: any;
  chartOptions: any;
  periods = [
    { label: 'Este Mês', value: 'month' },
    { label: 'Últimos 3 meses', value: 'quarter' },
    { label: 'Este ano', value: 'year' },
  ];
  selectedPeriod = 'month';
  globalFilter = '';

  currentGroup: any = null;
  currentUserEmail: string = '';

  resume = {
    groupTotal: 0,
    userShare: 0,
    variationPercentage: 0,
    activeMembersCount: 1,
    monthlyTransactions: 0,
  };

  members: Member[] = [];
  transactions: Transaction[] = [];

  // --- CONTROLE DO MODAL DE MEMBRO ---
  displayAddMemberModal = false;
  isAddingMember = false;
  memberForm: FormGroup;

  constructor() {
    this.memberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.initChart(null);
    this.extractCurrentUser();

    this.route.queryParams.subscribe(params => {
      const groupId = params['id'];
      if (groupId) {
        this.loadGroupData(groupId);
      }
    });
  }

  extractCurrentUser() {
    const token = this.authService.token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserEmail = payload.sub;
      } catch (e) {
        console.error('Erro ao ler token JWT', e);
      }
    }
  }

  loadGroupData(id: number) {
    this.groupService.getById(id).subscribe({
      next: (group) => {
        this.currentGroup = group;
        this.resume.activeMembersCount = group.members ? group.members.length : 1;
        this.loadTransactions(group.name, group.members);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar o grupo.' })
    });
  }

  loadTransactions(groupName: string, groupMembers: any[]) {
    this.transactionService.getByGroup(groupName).subscribe({
      next: (data) => {
        const expenses = data.filter(t => t.type === 'EXPENSE');
        
        this.resume.groupTotal = expenses.reduce((acc, t) => acc + t.amount, 0);
        this.resume.monthlyTransactions = data.length;

        const sharePerPerson = this.resume.activeMembersCount > 0 
            ? this.resume.groupTotal / this.resume.activeMembersCount 
            : 0;
            
        this.resume.userShare = sharePerPerson;

        this.members = groupMembers.map(m => {
          return {
            id: m.id.toString(),
            name: m.name,
            role: m.email === this.currentUserEmail ? 'Você' : 'Membro',
            initials: m.name.charAt(0).toUpperCase(),
            amount: sharePerPerson,
            percentage: Math.round(100 / this.resume.activeMembersCount)
          };
        });

        this.members.sort((a, b) => a.role === 'Você' ? -1 : 1);

        this.transactions = expenses.map(t => {
          const dateParts = t.date.split('-');
          const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;
          const paidByName = t.paidByName || 'Desconhecido';

          return {
            id: t.id.toString(),
            date: formattedDate,
            description: t.description,
            category: t.category,
            categoryColor: this.getCategoryStyle(t.category),
            paidBy: paidByName,
            paidByInitials: paidByName.charAt(0).toUpperCase(),
            totalAmount: t.amount,
            userShare: t.amount / this.resume.activeMembersCount,
            status: true
          };
        });

        this.initChart(expenses);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar transações.' })
    });
  }

  // --- FUNÇÕES DO MODAL ---

  showAddMemberModal() {
    this.memberForm.reset();
    this.displayAddMemberModal = true;
  }

  hideAddMemberModal() {
    this.displayAddMemberModal = false;
  }

  onAddMemberSubmit() {
    if (this.memberForm.valid && this.currentGroup) {
      this.isAddingMember = true;
      const email = this.memberForm.value.email;

      this.groupService.addMember(this.currentGroup.id, email).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Membro adicionado!' });
          this.loadGroupData(this.currentGroup.id); // Mágica: recarrega a tela com a pessoa nova!
          this.hideAddMemberModal();
          this.isAddingMember = false;
        },
        error: (err) => {
          this.isAddingMember = false;
          if (err.status === 404) {
            this.messageService.add({ severity: 'error', summary: 'Não encontrado', detail: 'Nenhum usuário com este email.' });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível adicionar o membro.' });
          }
        }
      });
    } else {
      this.memberForm.markAllAsTouched();
    }
  }

  isInvalidMember(controlName: string) {
    const control = this.memberForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  // --- VISUAL E GRÁFICOS ---

  getCategoryStyle(category: string): string {
    const styles: any = {
      'Alimentação': 'bg-amber-500/15 text-amber-400',
      'Casa': 'bg-rose-500/15 text-rose-400',
      'Utilidades': 'bg-sky-500/15 text-sky-400',
      'Transporte': 'bg-violet-500/15 text-violet-400',
      'Lazer': 'bg-purple-500/15 text-purple-400',
      'Saúde': 'bg-emerald-500/15 text-emerald-400'
    };
    return styles[category] || 'bg-zinc-500/15 text-zinc-400';
  }

  initChart(expenses: any[] | null): void {
    if (!expenses || expenses.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    this.chartData = {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: ['#00B37E', '#F59E0B', '#F43F5E', '#8B5CF6', '#3B82F6', '#10B981'],
        borderRadius: 6,
        borderSkipped: false,
      }],
    };

    this.chartOptions = {
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#202024',
          titleColor: '#E1E1E6',
          bodyColor: '#8D8D99',
          borderColor: '#3f3f46',
          borderWidth: 1,
          callbacks: {
            label: (ctx: any) => ` R$ ${ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8D8D99', font: { size: 11 } } },
        y: { grid: { color: 'rgba(63,63,70,0.4)' }, ticks: { color: '#8D8D99', font: { size: 11 } } },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  get totalAmount(): number { return this.resume.groupTotal; }
  get totalUserShare(): number { return this.resume.userShare; }

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}