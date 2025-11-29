// Antonio Batista - Organizador de gastos - 2024-07-25
// Serviço para gerenciar a autenticação de usuários com o Supabase.

import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClient, User, AuthError, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  
  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Sinal que armazena o usuário atual ou null se não estiver logado.
  currentUser = signal<User | null>(null);

  constructor() {
    // Antonio Batista - Organizador de gastos - 2024-07-25
    // Injeta o cliente Supabase e escuta por mudanças no estado de autenticação.
    const supabaseService = inject(SupabaseService);
    this.supabase = supabaseService.getSupabaseClient();
    
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
    });

    // Pega a sessão inicial, caso o usuário já esteja logado
    this.supabase.auth.getSession().then(({ data }) => {
        this.currentUser.set(data.session?.user ?? null);
    });
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Método para registrar um novo usuário.
  signUp(credentials: SignUpWithPasswordCredentials): Promise<{ user: User | null, error: AuthError | null }> {
    return this.supabase.auth.signUp(credentials);
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Método para fazer login de um usuário existente.
  signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<{ user: User | null, error: AuthError | null }> {
    return this.supabase.auth.signInWithPassword(credentials);
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Método para fazer logout do usuário atual.
  signOut(): Promise<{ error: AuthError | null }> {
    return this.supabase.auth.signOut();
  }
}
