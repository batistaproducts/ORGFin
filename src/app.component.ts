// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente raiz da aplicação que controla a exibição das diferentes seções.

import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddTransactionFormComponent } from './components/add-transaction-form/add-transaction-form.component';
import { CardManagementComponent } from './components/card-management/card-management.component';
import { AuthService } from './services/auth.service';
import { ExpenseService } from './services/expense.service';
import { AuthComponent } from './components/auth/auth.component';
import { ConnectionsManagementComponent } from './components/connections-management/connections-management.component';
import { BudgetManagementComponent } from './components/budget-management/budget-management.component';

type View = 'dashboard' | 'add-transaction' | 'manage-cards' | 'connections-management' | 'manage-budgets';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    AddTransactionFormComponent,
    CardManagementComponent,
    AuthComponent,
    ConnectionsManagementComponent,
    BudgetManagementComponent,
  ]
})
export class AppComponent {
  authService = inject(AuthService);
  expenseService = inject(ExpenseService);
  
  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Sinal para o usuário atual, determina se a tela de login ou o app principal é exibido.
  currentUser = this.authService.currentUser;
  
  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Signal para controlar qual tela/componente está ativo.
  currentView = signal<View>('dashboard');

  constructor() {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Efeito que reage a mudanças no estado de autenticação.
    // Carrega os dados quando o usuário faz login e limpa ao fazer logout.
    effect(() => {
      if (this.currentUser()) {
        this.expenseService.loadInitialData();
      } else {
        this.expenseService.clearData();
      }
    });
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Método para alterar a visualização atual.
  changeView(view: View): void {
    this.currentView.set(view);
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Método para realizar o logout do usuário.
  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.currentView.set('dashboard'); // Reseta a view para o dashboard
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}
