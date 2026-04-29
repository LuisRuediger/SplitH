import { Component, HostListener, inject, OnInit } from '@angular/core';
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

import { GroupService, GroupRole } from '../../core/services/group-service';
import { TransactionService } from '../../core/services/transaction-service';
import { AuthService } from '../../core/services/auth-service';

export interface TransactionSplitUser {
  id: number;
  name: string;
  email: string;
}

export interface TransactionSplitDTO {
  id: number;
  user: TransactionSplitUser;
  amountOwed: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: GroupRole;
  displayRole: string;
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
  splits: TransactionSplitDTO[];
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
  currentUserId: string = '';
  currentUserRole: GroupRole | null = null;

  resume = {
    groupTotal: 0,
    userShare: 0,
    variationPercentage: 0,
    activeMembersCount: 1,
    monthlyTransactions: 0,
  };

  members: Member[] = [];
  transactions: Transaction[] = [];

  // --- Modal: adicionar membro ---
  displayAddMemberModal = false;
  isAddingMember = false;
  memberForm: FormGroup;

  // --- Modal: alterar papel ---
  displayRoleModal = false;
  selectedMember: Member | null = null;
  selectedRole: GroupRole = 'MEMBER';
  isChangingRole = false;
  roleOptions = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Membro', value: 'MEMBER' },
    { label: 'Visualizador', value: 'VIEWER' },
  ];

  // --- Modal: confirmar remoção ---
  displayRemoveModal = false;
  memberToRemove: Member | null = null;
  isRemovingMember = false;

  // --- Menu de três pontos ---
  openMenuMemberId: string | null = null;
  menuPosition: { top: number; right: number } = { top: 0, right: 0 };

  @HostListener('document:click')
  onDocumentClick() {
    this.openMenuMemberId = null;
  }

  toggleMemberMenu(memberId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.openMenuMemberId === memberId) {
      this.openMenuMemberId = null;
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition = { top: rect.bottom + 4, right: window.innerWidth - rect.right };
    this.openMenuMemberId = memberId;
  }

  closeMemberMenu() {
    this.openMenuMemberId = null;
  }

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

  get isAdmin(): boolean {
    return this.currentUserRole === 'ADMIN';
  }

  extractCurrentUser() {
    const token = this.authService.token;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserEmail = payload.sub;
        this.currentUserId = payload.userId?.toString() ?? '';
      } catch (e) {
        console.error('Erro ao ler token JWT', e);
      }
    }
  }

  roleLabel(role: GroupRole): string {
    const labels: Record<GroupRole, string> = {
      ADMIN: 'Admin',
      MEMBER: 'Membro',
      VIEWER: 'Visualizador',
    };
    return labels[role];
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
        const currentUserIdNum = parseInt(this.currentUserId, 10);

        this.resume.groupTotal = expenses.reduce((acc, t) => acc + t.amount, 0);
        this.resume.monthlyTransactions = data.length;

        this.resume.userShare = expenses.reduce((acc, t) => {
          const mySplit = (t.splits ?? []).find((s: TransactionSplitDTO) => s.user.id === currentUserIdNum);
          return acc + (mySplit ? mySplit.amountOwed : 0);
        }, 0);

        this.members = groupMembers.map(m => {
          const memberIdNum = typeof m.id === 'string' ? parseInt(m.id, 10) : m.id;
          const memberTotal = expenses.reduce((acc, t) => {
            const split = (t.splits ?? []).find((s: TransactionSplitDTO) => s.user.id === memberIdNum);
            return acc + (split ? split.amountOwed : 0);
          }, 0);
          const percentage = this.resume.groupTotal > 0
            ? Math.round((memberTotal / this.resume.groupTotal) * 100) : 0;
          const isSelf = m.email === this.currentUserEmail;
          return {
            id: m.id.toString(),
            name: m.name,
            email: m.email,
            role: m.role as GroupRole,
            displayRole: isSelf ? 'Você' : this.roleLabel(m.role),
            initials: m.name.charAt(0).toUpperCase(),
            amount: memberTotal,
            percentage
          };
        });

        this.members.sort((a, b) => (a.email === this.currentUserEmail ? -1 : 1));

        const self = groupMembers.find(m => m.email === this.currentUserEmail);
        this.currentUserRole = self?.role ?? null;
        this.currentUserId = self?.id?.toString() ?? this.currentUserId;

        this.transactions = expenses.map(t => {
          const dateParts = t.date.split('-');
          const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;
          const paidByName = t.paidByName || 'Desconhecido';
          const mySplit = (t.splits ?? []).find((s: TransactionSplitDTO) => s.user.id === currentUserIdNum);

          return {
            id: t.id.toString(),
            date: formattedDate,
            description: t.description,
            category: t.category,
            categoryColor: this.getCategoryStyle(t.category),
            paidBy: paidByName,
            paidByInitials: paidByName.charAt(0).toUpperCase(),
            totalAmount: t.amount,
            userShare: mySplit ? mySplit.amountOwed : 0,
            status: true,
            splits: t.splits ?? []
          };
        });

        this.initChart(expenses);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar transações.' })
    });
  }

  // --- Adicionar membro ---

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
          this.loadGroupData(this.currentGroup.id);
          this.hideAddMemberModal();
          this.isAddingMember = false;
        },
        error: (err) => {
          this.isAddingMember = false;
          if (err.status === 404) {
            this.messageService.add({ severity: 'error', summary: 'Não encontrado', detail: 'Nenhum usuário com este email.' });
          } else if (err.status === 409) {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Este usuário já é membro do grupo.' });
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

  // --- Alterar papel ---

  showRoleModal(member: Member) {
    this.selectedMember = member;
    this.selectedRole = member.role;
    this.displayRoleModal = true;
  }

  hideRoleModal() {
    this.displayRoleModal = false;
    this.selectedMember = null;
  }

  onChangeRole() {
    if (!this.selectedMember || !this.currentGroup) return;
    this.isChangingRole = true;

    this.groupService.changeMemberRole(this.currentGroup.id, parseInt(this.selectedMember.id), this.selectedRole).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Papel alterado com sucesso!' });
        this.loadGroupData(this.currentGroup.id);
        this.hideRoleModal();
        this.isChangingRole = false;
      },
      error: (err) => {
        this.isChangingRole = false;
        if (err.status === 409) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'O grupo deve ter pelo menos um administrador.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível alterar o papel.' });
        }
      }
    });
  }

  // --- Remover membro ---

  confirmRemoveMember(member: Member) {
    this.memberToRemove = member;
    this.displayRemoveModal = true;
  }

  hideRemoveModal() {
    this.displayRemoveModal = false;
    this.memberToRemove = null;
  }

  onRemoveMember() {
    if (!this.memberToRemove || !this.currentGroup) return;
    this.isRemovingMember = true;

    this.groupService.removeMember(this.currentGroup.id, parseInt(this.memberToRemove.id)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Membro removido.' });
        this.loadGroupData(this.currentGroup.id);
        this.hideRemoveModal();
        this.isRemovingMember = false;
      },
      error: (err) => {
        this.isRemovingMember = false;
        if (err.status === 409) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'O grupo deve ter pelo menos um administrador.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover o membro.' });
        }
      }
    });
  }

  // --- Visual e gráficos ---

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
