import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { InventoryService } from './inventory.service';
import { FinanceService } from './finance.service';
import { SalesOrder, SaleStatus, SaleItem, CustomerDetails } from '../models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private salesSignal = signal<SalesOrder[]>([]);
  public sales = this.salesSignal.asReadonly();

  constructor(
    private storage: StorageService,
    private notification: NotificationService,
    private inventoryService: InventoryService,
    private financeService: FinanceService
  ) {
    this.loadSales();
  }

  loadSales(): void {
    const list = this.storage.getItem<SalesOrder[]>('sales', []);
    this.salesSignal.set(list);
  }

  getAll(): SalesOrder[] {
    return this.salesSignal();
  }

  getById(id: string): SalesOrder | undefined {
    return this.salesSignal().find(s => s.id === id || s.saleId === id);
  }

  generateSaleId(): string {
    const current = this.salesSignal();
    if (current.length === 0) return 'SO-1001';

    const numbers = current
      .map(s => {
        const match = s.saleId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const max = Math.max(...numbers, 1000);
    return `SO-${max + 1}`;
  }

  create(data: {
    customer: CustomerDetails;
    items: SaleItem[];
    taxAmount?: number;
    discountAmount?: number;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'UPI' | 'Cheque';
    status: SaleStatus;
    notes?: string;
  }): { success: boolean; message: string; order?: SalesOrder } {
    // 1. If creating directly as 'Completed', check stock availability first!
    if (data.status === 'Completed') {
      for (const item of data.items) {
        const product = this.inventoryService.getById(item.productId);
        if (!product) {
          const err = `Product ${item.productName} not found in inventory.`;
          this.notification.error('Order Failed', err);
          return { success: false, message: err };
        }
        if (product.stockQuantity < item.quantity) {
          const err = `Insufficient stock for "${product.productName}". Requested: ${item.quantity}, Available: ${product.stockQuantity}`;
          this.notification.error('Stock Unavailable', err);
          return { success: false, message: err };
        }
      }
    }

    const subtotal = data.items.reduce((acc, itm) => acc + (itm.quantity * itm.unitPrice), 0);
    const taxAmount = data.taxAmount ?? Math.round(subtotal * 0.18);
    const discountAmount = data.discountAmount ?? 0;
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

    let stockDeducted = false;
    let financeRecorded = false;
    let completedDate: string | undefined = undefined;

    // If completed immediately upon creation:
    if (data.status === 'Completed') {
      for (const item of data.items) {
        this.inventoryService.adjustStock(
          item.productId,
          -item.quantity,
          `Sale to ${data.customer.name}`
        );
      }
      stockDeducted = true;
      completedDate = new Date().toISOString().split('T')[0];
    }

    const newSale: SalesOrder = {
      id: 'so-' + Date.now().toString(),
      saleId: this.generateSaleId(),
      customer: data.customer,
      items: data.items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      status: data.status,
      orderDate: new Date().toISOString().split('T')[0],
      completedDate,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.status === 'Completed' ? 'Paid' : 'Unpaid',
      stockDeducted,
      financeRecorded,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    // Record income if completed
    if (newSale.status === 'Completed') {
      this.financeService.addTransaction({
        type: 'Income',
        category: 'Sales Revenue',
        amount: newSale.totalAmount,
        date: newSale.completedDate!,
        paymentMethod: newSale.paymentMethod,
        description: `Revenue from Sales Order ${newSale.saleId} (${newSale.customer.name})`,
        referenceId: newSale.saleId
      });
      newSale.financeRecorded = true;
    }

    const updated = [newSale, ...this.salesSignal()];
    this.salesSignal.set(updated);
    this.storage.setItem('sales', updated);
    this.notification.success('Sales Order Created', `${newSale.saleId} for ${newSale.customer.name} (₹${totalAmount.toLocaleString()})`);
    return { success: true, message: 'Created successfully', order: newSale };
  }

  updateStatus(id: string, newStatus: SaleStatus): boolean {
    const current = this.salesSignal();
    const index = current.findIndex(s => s.id === id || s.saleId === id);
    if (index === -1) {
      this.notification.error('Error', 'Sales order not found.');
      return false;
    }

    const sale = current[index];

    // Check if already completed
    if (sale.status === 'Completed' && newStatus === 'Completed') {
      this.notification.warning('Notice', `Sales order ${sale.saleId} is already Completed. Stock was previously deducted.`);
      return true;
    }

    let stockDeducted = sale.stockDeducted;
    let financeRecorded = sale.financeRecorded;
    let completedDate = sale.completedDate;
    let paymentStatus = sale.paymentStatus;

    if (newStatus === 'Completed' && !sale.stockDeducted) {
      // 1. Verify stock availability before applying deduction
      for (const item of sale.items) {
        const prod = this.inventoryService.getById(item.productId);
        if (!prod || prod.stockQuantity < item.quantity) {
          const avail = prod ? prod.stockQuantity : 0;
          this.notification.error('Cannot Complete Sale', `Insufficient stock for ${item.productName}. Needed: ${item.quantity}, Available: ${avail}`);
          return false;
        }
      }

      // 2. Perform deductions
      for (const item of sale.items) {
        this.inventoryService.adjustStock(
          item.productId,
          -item.quantity,
          `Sale completion ${sale.saleId}`
        );
      }
      stockDeducted = true;
      completedDate = new Date().toISOString().split('T')[0];
      paymentStatus = 'Paid';

      // 3. Record Finance Income
      if (!sale.financeRecorded) {
        this.financeService.addTransaction({
          type: 'Income',
          category: 'Sales Revenue',
          amount: sale.totalAmount,
          date: completedDate,
          paymentMethod: sale.paymentMethod,
          description: `Revenue from Sales Order ${sale.saleId} (${sale.customer.name})`,
          referenceId: sale.saleId
        });
        financeRecorded = true;
      }

      this.notification.success('Sale Completed', `${sale.saleId} fulfilled. Inventory stock deducted and revenue recorded.`);
    } else {
      this.notification.info('Status Updated', `${sale.saleId} status set to ${newStatus}.`);
    }

    const updatedSale: SalesOrder = {
      ...sale,
      status: newStatus,
      stockDeducted,
      financeRecorded,
      completedDate,
      paymentStatus
    };

    const updatedList = [...current];
    updatedList[index] = updatedSale;
    this.salesSignal.set(updatedList);
    this.storage.setItem('sales', updatedList);
    return true;
  }

  delete(id: string): boolean {
    const current = this.salesSignal();
    const sale = current.find(s => s.id === id || s.saleId === id);
    if (!sale) return false;

    if (sale.status === 'Completed') {
      this.notification.warning('Cannot Delete', 'Completed sales orders cannot be deleted because stock was already fulfilled.');
      return false;
    }

    const filtered = current.filter(s => s.id !== id && s.saleId !== id);
    this.salesSignal.set(filtered);
    this.storage.setItem('sales', filtered);
    this.notification.info('Order Removed', `Sales order ${sale.saleId} deleted.`);
    return true;
  }
}
