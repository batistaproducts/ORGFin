// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente para visualização e cadastro de Saldos Disponíveis (Orçamentos).

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { Budget } from '../../models/budget.model';

@Component({
  selector: 'app-budget-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetManagementComponent {
  expenseService = inject(ExpenseService);
  fb = inject(FormBuilder);

  budgets = this.expenseService.budgets;
  showAddForm = signal(false);
  isSubmitting = signal(false);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Formulário para adicionar um novo saldo.
  budgetForm = this.fb.group({
    name: ['', Validators.required],
    total_amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (!this.showAddForm()) {
        this.budgetForm.reset();
    }
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Lida com o envio do formulário de novo saldo de forma assíncrona.
  async onSubmit(): Promise<void> {
    if (this.budgetForm.invalid || this.isSubmitting()) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
        await this.expenseService.addBudget(this.budgetForm.getRawValue() as Omit<Budget, 'id' | 'spent_amount'>);
        this.toggleAddForm(); // Esconde o formulário após o sucesso
    } catch (error) {
        console.error("Erro ao adicionar saldo:", error);
    } finally {
        this.isSubmitting.set(false);
    }
  }
}
