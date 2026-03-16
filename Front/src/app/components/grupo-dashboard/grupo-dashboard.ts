import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';

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
    ChartModule,
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './grupo-dashboard.html',
  styleUrl: './grupo-dashboard.css',
})
export class GrupoDashboardComponent {
  messageService = inject(MessageService);
  chartData: any;
  chartOptions: any;
  periods = [
    { label: 'Este Mês', value: 'month' },
    { label: 'Últimos 3 meses', value: 'quarter' },
    { label: 'Este ano', value: 'year' },
  ];
  selectedPeriod = 'month';



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

  ngOnInit(): void {
    this.initChart();
  }

  initChart(): void {
    this.chartData = {
      labels: ['Utilidades', 'Alimentação', 'Casa', 'Transporte', 'Lazer'],
      datasets: [{
        data: [820, 650, 280, 420, 200],
        backgroundColor: ['#00B37E', '#F59E0B', '#F43F5E', '#8B5CF6', '#3B82F6'],
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
            label: (ctx: any) =>
              ` R$ ${ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}