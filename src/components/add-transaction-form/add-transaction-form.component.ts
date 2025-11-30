// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente de formulário para registrar uma nova despesa.

import { ChangeDetectionStrategy, Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-add-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transaction-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionFormComponent {
  fb = inject(FormBuilder);
  expenseService = inject(ExpenseService);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Evento emitido quando uma transação é adicionada com sucesso.
  transactionAdded = output<void>();

  cards = this.expenseService.cards;
  budgets = this.expenseService.budgets;
  isSubmitting = signal(false);

  categories = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 
    'Compras', 'Serviços', 'Educação', 'Viagem', 'Outros'
  ];

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Definição do formulário reativo com validações.
  transactionForm = this.fb.group({
    title: ['', Validators.required],
    place: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    category: ['', Validators.required],
    paymentMethod: ['', Validators.required], // Unifica cartão e saldo
  });

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Processa o envio do formulário de forma assíncrona.
  async onSubmit(): Promise<void> {
    if (this.transactionForm.invalid || this.isSubmitting()) {
      this.transactionForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting.set(true);
    try {
      const formValue = this.transactionForm.getRawValue();

      // Antonio Batista - Organizador de gastos - 2024-07-25
      // CORREÇÃO: Divide a string do método de pagamento e reconstrói o UUID corretamente.
      const paymentMethodParts = formValue.paymentMethod!.split('-');
      const type = paymentMethodParts[0];
      const id = paymentMethodParts.slice(1).join('-');

      const transactionData: Partial<Transaction> = {
          title: formValue.title,
          place: formValue.place,
          amount: formValue.amount,
          date: formValue.date,
          category: formValue.category,
          card_id: type === 'card' ? id : null,
          budget_id: type === 'budget' ? id : null,
          type: type === 'card' ? 'credit' : 'debit'
      };
      
      await this.expenseService.addTransaction(transactionData);
      this.transactionAdded.emit();
      this.transactionForm.reset({
        date: new Date().toISOString().substring(0, 10),
      });
    } catch (error) {
        console.error("Erro ao adicionar transação:", error);
    } finally {
        this.isSubmitting.set(false);
    }
  }
}