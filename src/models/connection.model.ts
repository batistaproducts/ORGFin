// Antonio Batista - Organizador de gastos - 2024-07-25
// Modelo de dados para representar uma conexão entre usuários.

export interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester_id: string;
  addressee_id: string;
  created_at: string;
  
  // Antonio Batista - Organizador de gastos - 2024-07-25
  // Dados unidos da tabela 'profiles' para exibição na UI.
  requester?: { email: string | null };
  addressee?: { email: string | null };
}
