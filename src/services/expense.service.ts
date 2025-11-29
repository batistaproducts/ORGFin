// Antonio Batista - Organizador de gastos - 2024-07-25
// Serviço central para gerenciar o estado dos dados da aplicação (transações, cartões, etc.).
// Agora atua como uma camada de estado sobre o SupabaseService.

import { Injectable, signal, computed, inject } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { Card } from '../models/card.model';
import { Budget } from '../models/budget.model';
import { SupabaseService } from './supabase.service';

type Status = 'loading' | 'loaded' | 'error' | 'idle';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private supabaseService = inject(SupabaseService);

  // --- Sinais de Estado ---
  status = signal<Status>('idle');
  cards = signal<Card[]>([]);
  transactions = signal<Transaction[]>([]);
  budgets = signal<Budget[]>([]);

  // --- Sinais Computados ---
  transactionsWithCardDetails = computed(() => {
    const cardsMap = new Map(this.cards().map(c => [c.id, c]));
    return this.transactions().map(t => ({
      ...t,
      card: cardsMap.get(t.card_id)
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Carrega todos os dados iniciais do Supabase. Chamado após o login.
  async loadInitialData(): Promise<void> {
    this.status.set('loading');
    try {
        const [cards, transactions, budgets] = await Promise.all([
            this.supabaseService.getCards(),
            this.supabaseService.getTransactions(),
            this.supabaseService.getBudgets(),
        ]);
        this.cards.set(cards);
        this.transactions.set(transactions);
        this.budgets.set(budgets);
        this.status.set('loaded');
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        this.status.set('error');
    }
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Limpa os dados locais ao fazer logout.
  clearData(): void {
    this.cards.set([]);
    this.transactions.set([]);
    this.budgets.set([]);
    this.status.set('idle');
  }

  // --- Métodos de Ação ---

  async addTransaction(transactionData: Omit<Transaction, 'id' | 'card'>): Promise<void> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Adiciona uma nova transação via Supabase e atualiza o estado local.
    await this.supabaseService.addTransaction(transactionData);
    const updatedTransactions = await this.supabaseService.getTransactions();
    this.transactions.set(updatedTransactions);

    // Lógica simples para atualizar o orçamento correspondente
    if(transactionData.title.toLowerCase().includes('ifood')) {
        const ifoodBudget = this.budgets().find(b => b.name.toLowerCase().includes('ifood'));
        if (ifoodBudget) {
            const updatedAmount = ifoodBudget.spent_amount + transactionData.amount;
            // TODO: Adicionar chamada de update no SupabaseService para o orçamento
            this.budgets.update(budgets => budgets.map(b => 
                b.id === ifoodBudget.id ? { ...b, spent_amount: updatedAmount } : b
            ));
        }
    }
  }

  async addCard(cardData: Omit<Card, 'id'>): Promise<void> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Adiciona um novo cartão via Supabase e atualiza o estado local.
    await this.supabaseService.addCard(cardData);
    const updatedCards = await this.supabaseService.getCards();
    this.cards.set(updatedCards);
  }
}
