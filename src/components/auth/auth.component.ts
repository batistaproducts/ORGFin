// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente responsável pela tela de login e cadastro de usuários.

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Sinais para controlar o estado do formulário.
  mode = signal<AuthMode>('login');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Definição do formulário reativo com validações.
  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  
  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Alterna entre o modo de login e cadastro.
  toggleMode(): void {
    this.mode.update(current => current === 'login' ? 'signup' : 'login');
    this.authForm.reset();
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Processa o envio do formulário de autenticação.
  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email, password } = this.authForm.getRawValue();

    try {
      if (this.mode() === 'login') {
        const { error } = await this.authService.signInWithPassword({ email: email!, password: password! });
        if (error) throw error;
      } else {
        const { error } = await this.authService.signUp({ email: email!, password: password! });
        if (error) throw error;
        this.successMessage.set('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
