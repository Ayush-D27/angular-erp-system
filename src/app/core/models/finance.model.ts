export type TransactionType = 'Income' | 'Expense';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Credit Card' | 'UPI' | 'Cheque';

export interface FinanceTransaction {
  id: string;
  transactionId: string; // e.g. TXN-1001
  type: TransactionType;
  category: string; // e.g. 'Sales Revenue', 'Inventory Purchase', 'Payroll', 'Rent', 'Utilities', 'Marketing', 'Consulting'
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  description: string;
  referenceId?: string; // e.g. PO-1001 or SO-1001
  createdAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  transactionCount: number;
}
