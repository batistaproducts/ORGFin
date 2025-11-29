// Antonio Batista - Organizador de gastos - 2024-07-25
// Componente para gerenciar as conexões de usuários.

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { Connection } from '../../models/connection.model';

@Component({
  selector: 'app-connections-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './connections-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionsManagementComponent {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Sinais para obter dados dos serviços e controlar o estado da UI.
  acceptedConnections = this.expenseService.acceptedConnections;
  pendingRequests = this.expenseService.pendingRequestsReceived;
  currentUser = this.authService.currentUser;

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Formulário para enviar um novo convite de conexão.
  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Envia um convite de conexão para o e-mail fornecido.
  async sendInvite(): Promise<void> {
    if (this.inviteForm.invalid) {
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const email = this.inviteForm.value.email!;

    try {
      const result = await this.expenseService.sendConnectionInvite(email);
      this.successMessage.set(result);
      this.inviteForm.reset();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Ocorreu um erro desconhecido.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Aceita uma solicitação de conexão pendente.
  async acceptRequest(request: Connection): Promise<void> {
    try {
        await this.expenseService.respondToConnectionRequest(request.id, 'accepted');
    } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        this.errorMessage.set('Não foi possível aceitar o convite.');
    }
  }

  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Recusa uma solicitação de conexão pendente.
  async declineRequest(request: Connection): Promise<void> {
     try {
        await this.expenseService.respondToConnectionRequest(request.id, 'declined');
    } catch (error) {
        console.error('Erro ao recusar convite:', error);
        this.errorMessage.set('Não foi possível recusar o convite.');
    }
  }
}
