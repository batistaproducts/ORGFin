// Antonio Batista - Organizador de gastos - 2024-07-25
// Serviço central para gerenciar o estado dos dados da aplicação (transações, cartões, etc.).
// Agora atua como uma camada de estado sobre o SupabaseService.

import { Injectable, signal, computed, inject } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { Card } from '../models/card.model';
import { Budget } from '../models/budget.model';
import { SupabaseService } from './supabase.service';
import { Connection } from '../models/connection.model';
import { AuthService } from './auth.service';

type Status = 'loading' | 'loaded' | 'error' | 'idle';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);

  // --- Sinais de Estado ---
  status = signal<Status>('idle');
  cards = signal<Card[]>([]);
  transactions = signal<Transaction[]>([]);
  budgets = signal<Budget[]>([]);
  connections = signal<Connection[]>([]);
  
  // --- Sinais Computados ---
  transactionsWithCardDetails = computed(() => {
    const cardsMap = new Map(this.cards().map(c => [c.id, c]));
    return this.transactions().map(t => ({
      ...t,
      card: cardsMap.get(t.card_id)
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Separa as conexões em diferentes categorias para a UI.
  acceptedConnections = computed(() => this.connections().filter(c => c.status === 'accepted'));
  pendingRequestsReceived = computed(() => {
      const myId = this.authService.currentUser()?.id;
      return this.connections().filter(c => c.status === 'pending' && c.addressee_id === myId);
  });


  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Carrega todos os dados iniciais do Supabase. Chamado após o login.
  async loadInitialData(): Promise<void> {
    this.status.set('loading');
    try {
        const [cards, transactions, budgets, connections] = await Promise.all([
            this.supabaseService.getCards(),
            this.supabaseService.getTransactions(),
            this.supabaseService.getBudgets(),
            this.supabaseService.getConnections()
        ]);
        this.cards.set(cards);
        this.transactions.set(transactions);
        this.budgets.set(budgets);
        this.connections.set(connections);
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
    this.connections.set([]);
    this.status.set('idle');
  }

  // --- Métodos de Ação ---

  async addTransaction(transactionData: Omit<Transaction, 'id' | 'card' | 'user_id' | 'profiles'>): Promise<void> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Adiciona uma nova transação via Supabase e atualiza o estado local.
    await this.supabaseService.addTransaction(transactionData);
    const updatedTransactions = await this.supabaseService.getTransactions();
    this.transactions.set(updatedTransactions);
  }

  async addCard(cardData: Omit<Card, 'id'>): Promise<void> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Adiciona um novo cartão via Supabase e atualiza o estado local.
    await this.supabaseService.addCard(cardData);
    const updatedCards = await this.supabaseService.getCards();
    this.cards.set(updatedCards);
  }

  async sendConnectionInvite(email: string): Promise<string> {
    return this.supabaseService.sendInvite(email);
  }

  async respondToConnectionRequest(id: string, status: 'accepted' | 'declined'): Promise<void> {
      await this.supabaseService.respondToRequest(id, status);
      const updatedConnections = await this.supabaseService.getConnections();
      this.connections.set(updatedConnections);
  }
}
