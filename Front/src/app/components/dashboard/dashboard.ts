import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necessário para o ngModel funcionar
import { TransactionService } from '../../core/services/transaction-service';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ChartModule, 
    SelectModule, 
    DatePickerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private transactionService = inject(TransactionService);

  // Variáveis para os cards e tabelas
  totalIncome: number = 0;
  totalExpense: number = 0;
  balance: number = 0;
  recentTransactions: any[] = [];
  chartData: any;
  chartOptions: any;

  // Lógica de Filtro
  allTransactions: any[] = []; // Guarda todas as transações que vieram do banco
  
  periodOptions = [
    { label: 'Este Mês', value: 'thisMonth' },
    { label: 'Último Mês', value: 'lastMonth' },
    { label: 'Últimos 30 dias', value: 'last30days' },
    { label: 'Este Ano', value: 'thisYear' },
    { label: 'Todo o Período', value: 'all' },
    { label: 'Personalizado...', value: 'custom' }
  ];
  
  selectedPeriod: string = 'thisMonth'; // Começa mostrando o mês atual
  customDateRange: Date[] = []; // Guarda a data [Início, Fim] do calendário

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.allTransactions = data; // Salva a lista original intacta
        this.applyFilter(); // Aplica o filtro selecionado (Este Mês)
      },
      error: (err) => console.error('Erro ao carregar transações', err)
    });
  }

  // Chamado quando o usuário muda o Dropdown
  onPeriodChange() {
    if (this.selectedPeriod !== 'custom') {
      this.applyFilter();
    }
  }

  // Chamado quando o usuário escolhe datas no Calendário
  onCustomDateChange() {
    // Só aplica o filtro se o usuário clicou na data de início e de fim
    if (this.customDateRange && this.customDateRange.length === 2 && this.customDateRange[1]) {
      this.applyFilter();
    }
  }

  applyFilter() {
    let filtered = this.allTransactions;
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = new Date();

    // Descobre as datas de início e fim baseadas na opção escolhida
    switch (this.selectedPeriod) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Último dia do mês anterior
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
          endDate.setHours(23, 59, 59, 999); // Pega até o último segundo do dia final
        } else {
          return; // Se não escolheu o range completo, não faz nada
        }
        break;
      case 'all':
      default:
        startDate = null;
        endDate = null;
        break;
    }

    // Aplica o coador se tivermos datas definidas
    if (startDate && endDate) {
      filtered = this.allTransactions.filter(t => {
        const parts = t.date.split('-');
        const tDate = new Date(parts[0], parts[1] - 1, parts[2]); // Converte o texto do banco para Data real
        return tDate >= startDate! && tDate <= endDate!;
      });
    }

    // Atualiza a tela com as informações filtradas
    this.updateView(filtered);
  }

  // Refaz as contas e monta o gráfico com a lista que sobrou do filtro
  updateView(transactionsToView: any[]) {
    this.calculateSummary(transactionsToView);
    this.setupChart(transactionsToView);

    this.recentTransactions = transactionsToView.slice(0, 5).map(t => {
      const dateParts = t.date.split('-');
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;
      return { ...t, date: formattedDate };
    });
  }

  calculateSummary(transactions: any[]) {
    this.totalIncome = 0;
    this.totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'INCOME') {
        this.totalIncome += t.amount;
      } else if (t.type === 'EXPENSE') {
        this.totalExpense += t.amount;
      }
    });

    this.balance = this.totalIncome - this.totalExpense;
  }

  setupChart(transactions: any[]) {
    const expensesByCategory: { [key: string]: number } = {};

    transactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      }
    });

    this.chartData = {
      labels: Object.keys(expensesByCategory),
      datasets: [
        {
          data: Object.values(expensesByCategory),
          backgroundColor: ['#00B37E', '#F59E0B', '#F43F5E', '#8B5CF6', '#3B82F6', '#14B8A6'],
          hoverBackgroundColor: ['#00875F', '#D97706', '#E11D48', '#7C3AED', '#2563EB', '#0D9488'],
          borderWidth: 0
        }
      ]
    };

    this.chartOptions = {
      plugins: { legend: { position: 'right', labels: { color: '#C4C4CC', usePointStyle: true, padding: 20 } } },
      cutout: '70%'
    };
  }
}