// Antonio Batista - Organizador de gastos - 2024-07-25
// Modelo de dados para representar um "Saldo Disponível" ou meta de gastos.

export interface Budget {
  id: string;
  name: string;
  total_amount: number;
  spent_amount: number;
}