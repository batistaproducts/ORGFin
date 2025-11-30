// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente responsável por exibir o painel principal com as informações financeiras.

import { ChangeDetectionStrategy, Component, computed, inject, effect, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { Transaction } from '../../models/transaction.model';

// Antonio Batista - Organizador de gastos - 2024-07-25
// Declara a variável global Chart vinda da CDN.
declare var Chart: any;


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
  // Referência ao elemento canvas no template para o gráfico.
  categoryChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');
  private categoryChart: any;

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Sinais básicos do serviço.
  transactions = this.expenseService.transactionsWithDetails;
  budgets = this.expenseService.budgets;
  status = this.expenseService.status;
  currentUser = this.authService.currentUser;

  // --- Sinais Computados para Análise ---

  // Filtra transações apenas para o mês e ano atuais.
  transactionsThisMonth = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return this.transactions().filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  });
  
  // Calcula o total gasto no mês atual.
  totalSpentThisMonth = computed(() => this.transactionsThisMonth().reduce((sum, t) => sum + t.amount, 0));
  
  // Calcula o gasto médio diário.
  averageDailySpending = computed(() => {
    const today = new Date().getDate();
    return this.totalSpentThisMonth() / (today > 0 ? today : 1);
  });

  // Encontra a maior transação do mês.
  highestTransactionThisMonth = computed(() => {
    const transactions = this.transactionsThisMonth();
    if (transactions.length === 0) return null;
    return transactions.reduce((max, t) => t.amount > max.amount ? t : max, transactions[0]);
  });

  // Agrupa os gastos por categoria para o gráfico.
  categorySpendingData = computed(() => {
    const spendingMap = new Map<string, number>();
    this.transactionsThisMonth().forEach(t => {
        const currentAmount = spendingMap.get(t.category) || 0;
        spendingMap.set(t.category, currentAmount + t.amount);
    });
    const sortedCategories = [...spendingMap.entries()].sort((a, b) => b[1] - a[1]);
    return {
        labels: sortedCategories.map(entry => entry[0]),
        data: sortedCategories.map(entry => entry[1]),
    };
  });

  constructor() {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Efeito que observa as mudanças nos dados do gráfico e o renderiza novamente.
    effect(() => {
      if (this.status() === 'loaded') {
          this.renderCategoryChart();
      }
    });
  }
  
  private renderCategoryChart(): void {
    const canvas = this.categoryChartCanvas()?.nativeElement;
    if (!canvas) return;

    const chartData = this.categorySpendingData();

    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Destrói o gráfico anterior se ele existir para evitar memory leaks.
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Cria uma nova instância do gráfico.
    this.categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Gastos por Categoria',
          data: chartData.data,
          backgroundColor: [
            '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4',
            '#0F766E', '#115E59', '#134E4A', '#F0FDFA'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Distribuição de Gastos por Categoria'
          }
        }
      }
    });
  }
}
