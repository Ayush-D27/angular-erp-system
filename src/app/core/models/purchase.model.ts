export type PurchaseStatus = 'Pending' | 'Approved' | 'Received' | 'Cancelled';

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  purchaseId: string; // e.g. PO-1001
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: PurchaseStatus;
  orderDate: string; // YYYY-MM-DD
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  stockUpdated: boolean; // CRITICAL: Ensures stock is incremented exactly once upon 'Received'
  financeRecorded: boolean; // Ensures expense transaction is created exactly once
  createdAt: string;
}
