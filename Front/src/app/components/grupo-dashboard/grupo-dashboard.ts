import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  amount: number;
  percentage: number;
}

@Component({
  selector: 'app-grupo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './grupo-dashboard.html',
  styleUrl: './grupo-dashboard.css',
})
export class GrupoDashboardComponent {
  messageService = inject(MessageService);

  resume = {
    groupTotal: 4850.0,
    userShare: 1212.5,
    variationPercentage: 12,
    activeMembersCount: 4,
    monthlyTransactions: 18,
  };

  members: Member[] = [
    { id: '1', name: 'João Silva',      role: 'Você',   initials: 'JS', amount: 1212.5, percentage: 25 },
    { id: '2', name: 'Maria Santos',    role: 'Membro', initials: 'MS', amount: 1212.5, percentage: 25 },
    { id: '3', name: 'Carlos Oliveira', role: 'Membro', initials: 'CO', amount: 1212.5, percentage: 25 },
    { id: '4', name: 'Ana Costa',       role: 'Membro', initials: 'AC', amount: 1212.5, percentage: 25 },
  ];

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}