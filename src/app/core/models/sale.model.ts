export type SaleStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface SalesOrder {
  id: string;
  saleId: string; // e.g. SO-1001
  customer: CustomerDetails;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: SaleStatus;
  orderDate: string; // YYYY-MM-DD
  completedDate?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'UPI' | 'Cheque';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  notes?: string;
  stockDeducted: boolean; // CRITICAL: Ensures stock is deducted exactly once upon 'Completed'
  financeRecorded: boolean; // Ensures income transaction is created exactly once
  createdAt: string;
}
