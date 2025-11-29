// Antonio Batista - Organizador de gastos - 2024-07-25
// Modelo de dados para representar um cartão de crédito ou débito.

export interface Card {
  id: string;
  name: string;
  bank: string;
  closing_day: number; // Dia do mês que a fatura fecha
  due_day: number; // Dia do mês que a fatura vence
}