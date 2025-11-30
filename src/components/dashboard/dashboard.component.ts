// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente responsável por exibir o painel principal com as informações financeiras.

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  expenseService = inject(ExpenseService);
  authService = inject(AuthService);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Obtém os dados e o status do serviço usando sinais.
  transactions = this.expenseService.transactionsWithDetails;
  budgets = this.expenseService.budgets;
  status = this.expenseService.status;
  currentUser = this.authService.currentUser;
  
  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Calcula o total gasto no mês atual.
  totalSpentThisMonth = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.transactions()
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  });
}