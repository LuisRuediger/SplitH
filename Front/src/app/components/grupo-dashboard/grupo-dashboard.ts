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

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  categoryColor: string;
  icon: string;
  paidBy: string;
  paidByInitials: string;
  totalAmount: number;
  userShare: number
  status: boolean;

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

  transactions: Transaction[] = [
    { id: '1', date: '15/12/2024', description: 'Conta de Luz',  category: 'Utilidades',  categoryColor: 'bg-sky-500/15 text-sky-400',    icon: 'pi-bolt',          paidBy: 'Maria Santos',    paidByInitials: 'MS', totalAmount: 450.0,  userShare: 112.5, status: true },
    { id: '2', date: '14/12/2024', description: 'Supermercado',  category: 'Alimentação', categoryColor: 'bg-amber-500/15 text-amber-400', icon: 'pi-shopping-cart', paidBy: 'João Silva',      paidByInitials: 'JS', totalAmount: 680.0,  userShare: 170.0, status: false },
    { id: '3', date: '12/12/2024', description: 'Internet',      category: 'Utilidades',  categoryColor: 'bg-sky-500/15 text-sky-400',    icon: 'pi-wifi',          paidBy: 'Carlos Oliveira', paidByInitials: 'CO', totalAmount: 120.0,  userShare: 30.0,  status: true },
    { id: '4', date: '10/12/2024', description: 'Aluguel',       category: 'Casa',        categoryColor: 'bg-rose-500/15 text-rose-400',  icon: 'pi-home',          paidBy: 'Ana Costa',       paidByInitials: 'AC', totalAmount: 2400.0, userShare: 600.0, status: false },
    { id: '5', date: '08/12/2024', description: 'Jantar Sexta',  category: 'Lazer',       categoryColor: 'bg-purple-500/15 text-purple-400', icon: 'pi-star',       paidBy: 'João Silva',      paidByInitials: 'JS', totalAmount: 340.0,  userShare: 85.0,  status: true },
    { id: '6', date: '05/12/2024', description: 'Uber',          category: 'Transporte',  categoryColor: 'bg-violet-500/15 text-violet-400', icon: 'pi-car',        paidBy: 'Maria Santos',    paidByInitials: 'MS', totalAmount: 90.0,   userShare: 22.5,  status: true },
    { id: '7', date: '03/12/2024', description: 'Gás',           category: 'Casa',        categoryColor: 'bg-rose-500/15 text-rose-400',  icon: 'pi-home',          paidBy: 'Carlos Oliveira', paidByInitials: 'CO', totalAmount: 180.0,  userShare: 45.0,  status: false },
    { id: '8', date: '02/12/2024', description: 'Farmácia',      category: 'Saúde',       categoryColor: 'bg-emerald-500/15 text-emerald-400', icon: 'pi-heart',    paidBy: 'Ana Costa',       paidByInitials: 'AC', totalAmount: 210.0,  userShare: 52.5,  status: true },
    { id: '9', date: '30/11/2024', description: 'Cinema',        category: 'Lazer',       categoryColor: 'bg-purple-500/15 text-purple-400', icon: 'pi-video',      paidBy: 'João Silva',      paidByInitials: 'JS', totalAmount: 120.0,  userShare: 30.0,  status: true },
    { id: '10', date: '28/11/2024', description: 'Manutenção',   category: 'Casa',        categoryColor: 'bg-rose-500/15 text-rose-400',  icon: 'pi-cog',           paidBy: 'Maria Santos',    paidByInitials: 'MS', totalAmount: 560.0,  userShare: 140.0, status: false },
    { id: '11', date: '25/11/2024', description: 'Plano Celular',category: 'Utilidades',  categoryColor: 'bg-sky-500/15 text-sky-400',    icon: 'pi-mobile',        paidBy: 'Carlos Oliveira', paidByInitials: 'CO', totalAmount: 200.0,  userShare: 50.0,  status: true },
    { id: '12', date: '22/11/2024', description: 'Padaria',      category: 'Alimentação', categoryColor: 'bg-amber-500/15 text-amber-400', icon: 'pi-shopping-bag', paidBy: 'Ana Costa',       paidByInitials: 'AC', totalAmount: 95.0,   userShare: 23.75, status: true },
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