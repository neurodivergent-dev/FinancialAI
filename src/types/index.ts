// Assets: Liquid (Cash), Term, Gold/Foreign Currency, Funds
export interface Asset {
  id: string;
  type: 'liquid' | 'term' | 'gold_currency' | 'funds';
  name: string;
  value: number;
  currency: string;
  details?: string;
}

// Liabilities: Credit Card (Total Limit, Current Debt, Closing Date), Personal Debts
export interface Liability {
  id: string;
  type: 'credit_card' | 'personal_debt';
  name: string;
  totalLimit?: number;
  currentDebt: number;
  dueDate?: string;
  debtorName?: string;
  details?: string;
}

// Receivables: From whom, Amount, Due Date
export interface Receivable {
  id: string;
  debtor: string;
  amount: number;
  dueDate: string;
  details?: string;
}

// StrategicInstallments: Installment amount, End date, Remaining months
export interface StrategicInstallment {
  id: string;
  installmentAmount: number;
  endDate: string;
  remainingMonths: number;
  name?: string;
  details?: string;
}

// Transaction: Income/Expense movement
export interface Transaction {
  id: string;
  type: 'asset' | 'liability';
  name: string;
  amount: number;
  date: string;
  details?: string;
}
