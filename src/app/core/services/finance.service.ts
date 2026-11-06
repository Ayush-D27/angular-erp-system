import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { FinanceTransaction, FinanceSummary, TransactionType, PaymentMethod } from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private transactionsSignal = signal<FinanceTransaction[]>([]);
  public transactions = this.transactionsSignal.asReadonly();

  public summary = computed<FinanceSummary>(() => {
    const list = this.transactionsSignal();
    const totalIncome = list
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = list
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: list.length
    };
  });

  constructor(
    private storage: StorageService,
    private notification: NotificationService
  ) {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const list = this.storage.getItem<FinanceTransaction[]>('finance', []);
    this.transactionsSignal.set(list);
  }

  getAll(): FinanceTransaction[] {
    return this.transactionsSignal();
  }

  generateTransactionId(): string {
    const current = this.transactionsSignal();
    if (current.length === 0) return 'TXN-1001';

    const numbers = current
      .map(t => {
        const match = t.transactionId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const max = Math.max(...numbers, 1000);
    return `TXN-${max + 1}`;
  }

  addTransaction(data: {
    type: TransactionType;
    category: string;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    description: string;
    referenceId?: string;
  }): FinanceTransaction {
    const newTxn: FinanceTransaction = {
      id: 'txn-' + Date.now().toString(),
      transactionId: this.generateTransactionId(),
      type: data.type,
      category: data.category,
      amount: Number(data.amount),
      date: data.date || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'Bank Transfer',
      description: data.description,
      referenceId: data.referenceId,
      createdAt: new Date().toISOString()
    };

    const updated = [newTxn, ...this.transactionsSignal()];
    this.transactionsSignal.set(updated);
    this.storage.setItem('finance', updated);
    this.notification.success('Transaction Recorded', `${data.type} of ₹${data.amount.toLocaleString()} logged (${newTxn.transactionId}).`);
    return newTxn;
  }

  deleteTransaction(id: string): boolean {
    const current = this.transactionsSignal();
    const txn = current.find(t => t.id === id);
    if (!txn) return false;

    const filtered = current.filter(t => t.id !== id);
    this.transactionsSignal.set(filtered);
    this.storage.setItem('finance', filtered);
    this.notification.info('Transaction Deleted', `${txn.transactionId} removed.`);
    return true;
  }

  getMonthlyBreakdown(): { month: string; income: number; expense: number }[] {
    const txns = this.transactionsSignal();
    const map = new Map<string, { income: number; expense: number }>();

    // Process transactions into YYYY-MM
    txns.forEach(t => {
      const month = t.date.substring(0, 7); // '2026-10'
      const current = map.get(month) || { income: 0, expense: 0 };
      if (t.type === 'Income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      map.set(month, current);
    });

    const result: { month: string; income: number; expense: number }[] = [];
    map.forEach((val, key) => {
      result.push({ month: key, income: val.income, expense: val.expense });
    });

    return result.sort((a, b) => a.month.localeCompare(b.month));
  }
}
