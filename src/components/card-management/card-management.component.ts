// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente para visualização e cadastro de cartões.

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardManagementComponent {
  expenseService = inject(ExpenseService);
  fb = inject(FormBuilder);

  cards = this.expenseService.cards;
  showAddForm = signal(false);
  isSubmitting = signal(false);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Formulário para adicionar um novo cartão.
  cardForm = this.fb.group({
    name: ['', Validators.required],
    bank: ['', Validators.required],
    closing_day: [null as number | null, [Validators.required, Validators.min(1), Validators.max(31)]],
    due_day: [null as number | null, [Validators.required, Validators.min(1), Validators.max(31)]],
  });

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (!this.showAddForm()) {
        this.cardForm.reset();
    }
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Lida com o envio do formulário de novo cartão de forma assíncrona.
  async onSubmit(): Promise<void> {
    if (this.cardForm.invalid || this.isSubmitting()) {
      this.cardForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    try {
        await this.expenseService.addCard(this.cardForm.getRawValue() as Omit<Card, 'id'>);
        this.toggleAddForm(); // Esconde o formulário após o sucesso
    } catch (error) {
        console.error("Erro ao adicionar cartão:", error);
        // Opcional: Adicionar feedback de erro para o usuário
    } finally {
        this.isSubmitting.set(false);
    }
  }
}