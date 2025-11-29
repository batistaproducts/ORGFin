// Antonio Batista - Organizador de gastos - 2024-07-25
// Modelo de dados para representar uma transação financeira.

import { Card } from './card.model';

export interface Transaction {
  id: string;
  date: string; // Formato YYYY-MM-DD
  title: string;
  place: string;
  amount: number;
  card_id: string;
  card?: Card; // Opcional, para incluir detalhes do cartão
  type: 'credit' | 'debit';
  user_id: string;
  profiles?: { email: string | null }; // Para identificar o autor da transação em contas vinculadas
}
