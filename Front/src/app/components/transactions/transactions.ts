import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, InputTextModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions {
  // Dados simulados para visualizarmos o layout da tabela
transactionsList = [
    { id: 1, date: '11/03/2026', description: 'Mercado Mensal', group: 'Apartamento', type: 'EXPENSE', amount: 450.00 },
    { id: 2, date: '10/03/2026', description: 'Pix do Churrasco', group: 'Churrasco', type: 'INCOME', amount: 60.00 },
    { id: 3, date: '08/03/2026', description: 'Internet', group: 'Apartamento', type: 'EXPENSE', amount: 110.00 },
    { id: 4, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 5, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 6, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 7, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 8, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 9, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 10, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 10, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
    { id: 10, date: '05/03/2026', description: 'Uber Volta Praia', group: 'Viagem Praia', type: 'EXPENSE', amount: 35.50 },
   
  ];
}