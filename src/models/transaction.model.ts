// Antonio Batista - Organizador de gastos - 2024-07-25
// Modelo de dados para representar uma transação financeira.

import { Card } from './card.model';
import { Budget } from './budget.model';

export interface Transaction {
  id: string;
  date: string; // Formato YYYY-MM-DD
  title: string;
  place: string;
  amount: number;
  category: string;
  card_id: string | null;
  card?: Card; // Opcional, para incluir detalhes do cartão
  budget_id: string | null;
  budget?: Budget; // Opcional, para incluir detalhes do saldo
  type: 'credit' | 'debit';
  user_id: string;
  profiles?: { email: string | null }; // Para identificar o autor da transação em contas vinculadas
}