// Antonio Batista - Organizador de gastos - 2024-07-25
// Serviço dedicado para interagir com a API do Supabase.

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Card } from '../models/card.model';
import { Transaction } from '../models/transaction.model';
import { Budget } from '../models/budget.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Inicializa o cliente Supabase com as credenciais.
    this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
    );
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Permite que outros serviços acessem a instância do cliente Supabase.
  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  // --- Métodos para Cartões ---

  async getCards(): Promise<Card[]> {
    const { data, error } = await this.supabase.from('cards').select('*');
    if (error) {
      console.error('Erro ao buscar cartões:', error.message);
      throw error;
    }
    return data || [];
  }

  async addCard(card: Omit<Card, 'id'>): Promise<Card | null> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // O user_id é adicionado automaticamente pelo banco de dados (default auth.uid()).
    const { data, error } = await this.supabase.from('cards').insert([card]).select();
    if (error) {
      console.error('Erro ao adicionar cartão:', error.message);
      throw error;
    }
    return data ? data[0] : null;
  }

  // --- Métodos para Transações ---

  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await this.supabase.from('transactions').select('*');
    if (error) {
      console.error('Erro ao buscar transações:', error.message);
      throw error;
    }
    return data || [];
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'card'>): Promise<Transaction | null> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // O user_id é adicionado automaticamente pelo banco de dados (default auth.uid()).
    const { data, error } = await this.supabase.from('transactions').insert([transaction]).select();
     if (error) {
      console.error('Erro ao adicionar transação:', error.message);
      throw error;
    }
    return data ? data[0] : null;
  }

  // --- Métodos para Orçamentos ---

  async getBudgets(): Promise<Budget[]> {
     const { data, error } = await this.supabase.from('budgets').select('*');
    if (error) {
      console.error('Erro ao buscar orçamentos:', error.message);
      throw error;
    }
    return data || [];
  }
}

// Antonio Batista - Organizador de gastos - 2024-07-25
// NOTA: Para este código funcionar, você precisará criar as tabelas
// correspondentes ('cards', 'transactions', 'budgets') no seu painel do Supabase
// com as colunas alinhadas aos modelos de dados (Card, Transaction, Budget).
// Lembre-se de configurar as políticas de RLS (Row Level Security) para
// garantir que os usuários só possam ver e editar seus próprios dados.
