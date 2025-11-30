// Antonio Batista - Organizador de gastos - 2024-07-25
// Serviço dedicado para interagir com a API do Supabase.

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Card } from '../models/card.model';
import { Transaction } from '../models/transaction.model';
import { Budget } from '../models/budget.model';
import { environment } from '../environments/environment';
import { Connection } from '../models/connection.model';

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
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // A política RLS garante que apenas os cartões do usuário logado e de seus conectados sejam retornados.
    const { data, error } = await this.supabase.from('cards').select('*');
    if (error) {
      console.error('Erro ao buscar cartões:', error.message);
      throw error;
    }
    return data || [];
  }

  async addCard(card: Omit<Card, 'id'>): Promise<Card | null> {
    const { data, error } = await this.supabase.from('cards').insert([card]).select();
    if (error) {
      console.error('Erro ao adicionar cartão:', error.message);
      throw error;
    }
    return data ? data[0] : null;
  }

  // --- Métodos para Transações ---

  async getTransactions(): Promise<Transaction[]> {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // A RLS filtra os dados. A junção com 'profiles', 'cards' e 'budgets' traz os detalhes.
    const { data, error } = await this.supabase.from('transactions').select('*, profiles(email), card:cards(*), budget:budgets(*)');
    if (error) {
      console.error('Erro ao buscar transações:', error.message);
      throw error;
    }
    return data || [];
  }

  async addTransaction(transaction: Partial<Transaction>): Promise<Transaction | null> {
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

  async addBudget(budget: Omit<Budget, 'id' | 'spent_amount'>): Promise<Budget | null> {
    const { data, error } = await this.supabase.from('budgets').insert([budget]).select();
    if (error) {
      console.error('Erro ao adicionar orçamento:', error.message);
      throw error;
    }
    return data ? data[0] : null;
  }

  // --- Métodos para Conexões ---

  async getConnections(): Promise<Connection[]> {
      // Antonio Batista - Organizador de gastos - 2024-07-25
      // Busca todas as conexões (pendentes, aceitas) onde o usuário é o solicitante ou o destinatário.
      const { data, error } = await this.supabase
        .from('user_connections')
        .select('*, requester:profiles!requester_id(email), addressee:profiles!addressee_id(email)');
      
      if (error) {
          console.error('Erro ao buscar conexões:', error.message);
          throw error;
      }
      return data || [];
  }
  
  async sendInvite(email: string): Promise<string> {
      const { data, error } = await this.supabase.rpc('send_connection_invite', {
          addressee_email: email
      });

      if (error) {
          console.error('Erro ao enviar convite:', error.message);
          throw error;
      }
      return data;
  }

  async respondToRequest(id: string, status: 'accepted' | 'declined'): Promise<Connection | null> {
      const { data, error } = await this.supabase
          .from('user_connections')
          .update({ status: status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

      if (error) {
          console.error('Erro ao responder ao convite:', error.message);
          throw error;
      }
      return data;
  }
}
