import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { InventoryService } from './inventory.service';
import { FinanceService } from './finance.service';
import { PurchaseOrder, PurchaseStatus, PurchaseItem } from '../models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private purchasesSignal = signal<PurchaseOrder[]>([]);
  public purchases = this.purchasesSignal.asReadonly();

  constructor(
    private storage: StorageService,
    private notification: NotificationService,
    private inventoryService: InventoryService,
    private financeService: FinanceService
  ) {
    this.loadPurchases();
  }

  loadPurchases(): void {
    const list = this.storage.getItem<PurchaseOrder[]>('purchases', []);
    this.purchasesSignal.set(list);
  }

  getAll(): PurchaseOrder[] {
    return this.purchasesSignal();
  }

  getById(id: string): PurchaseOrder | undefined {
    return this.purchasesSignal().find(p => p.id === id || p.purchaseId === id);
  }

  generatePurchaseId(): string {
    const current = this.purchasesSignal();
    if (current.length === 0) return 'PO-1001';

    const numbers = current
      .map(p => {
        const match = p.purchaseId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const max = Math.max(...numbers, 1000);
    return `PO-${max + 1}`;
  }

  create(data: {
    supplierId: string;
    supplierName: string;
    items: PurchaseItem[];
    taxAmount?: number;
    shippingFee?: number;
    notes?: string;
  }): PurchaseOrder {
    const subtotal = data.items.reduce((acc, itm) => acc + (itm.quantity * itm.unitPrice), 0);
    const taxAmount = data.taxAmount ?? Math.round(subtotal * 0.18); // Default 18% GST
    const shippingFee = data.shippingFee ?? 0;
    const totalAmount = subtotal + taxAmount + shippingFee;

    const newPO: PurchaseOrder = {
      id: 'po-' + Date.now().toString(),
      purchaseId: this.generatePurchaseId(),
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      items: data.items,
      subtotal,
      taxAmount,
      shippingFee,
      totalAmount,
      status: 'Pending',
      orderDate: new Date().toISOString().split('T')[0],
      stockUpdated: false,
      financeRecorded: false,
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    const updated = [newPO, ...this.purchasesSignal()];
    this.purchasesSignal.set(updated);
    this.storage.setItem('purchases', updated);
    this.notification.success('Purchase Order Created', `${newPO.purchaseId} placed with ${data.supplierName}. Total: ₹${totalAmount.toLocaleString()}`);
    return newPO;
  }

  /**
   * Status change handler with duplicate stock prevention logic.
   */
  updateStatus(id: string, newStatus: PurchaseStatus): boolean {
    const current = this.purchasesSignal();
    const index = current.findIndex(p => p.id === id || p.purchaseId === id);
    if (index === -1) {
      this.notification.error('Error', 'Purchase order not found.');
      return false;
    }

    const po = current[index];

    // If already Received, do not allow changing or repeating stock receipt
    if (po.status === 'Received' && newStatus === 'Received') {
      this.notification.warning('Notice', `Purchase order ${po.purchaseId} is already marked as Received. Inventory was previously updated.`);
      return true;
    }

    let stockUpdated = po.stockUpdated;
    let financeRecorded = po.financeRecorded;
    let receivedDate = po.receivedDate;

    // Execute receiving business logic exactly once!
    if (newStatus === 'Received' && !po.stockUpdated) {
      // 1. Increment inventory for each item
      for (const item of po.items) {
        this.inventoryService.adjustStock(
          item.productId,
          item.quantity,
          `Procurement from ${po.supplierName} (PO: ${po.purchaseId})`
        );
      }
      stockUpdated = true;
      receivedDate = new Date().toISOString().split('T')[0];

      // 2. Record Expense in Finance if not yet recorded
      if (!po.financeRecorded) {
        this.financeService.addTransaction({
          type: 'Expense',
          category: 'Inventory Purchase',
          amount: po.totalAmount,
          date: receivedDate,
          paymentMethod: 'Bank Transfer',
          description: `Payment for Purchase Order ${po.purchaseId} (${po.supplierName})`,
          referenceId: po.purchaseId
        });
        financeRecorded = true;
      }

      this.notification.success('Stock Received', `${po.purchaseId} marked Received. Inventory stock successfully incremented and expense recorded.`);
    } else {
      this.notification.info('Status Updated', `${po.purchaseId} status changed to ${newStatus}.`);
    }

    const updatedPO: PurchaseOrder = {
      ...po,
      status: newStatus,
      stockUpdated,
      financeRecorded,
      receivedDate
    };

    const updatedList = [...current];
    updatedList[index] = updatedPO;
    this.purchasesSignal.set(updatedList);
    this.storage.setItem('purchases', updatedList);
    return true;
  }

  delete(id: string): boolean {
    const current = this.purchasesSignal();
    const po = current.find(p => p.id === id || p.purchaseId === id);
    if (!po) return false;

    if (po.status === 'Received') {
      this.notification.warning('Cannot Delete', 'Received purchase orders cannot be deleted because stock was already received.');
      return false;
    }

    const filtered = current.filter(p => p.id !== id && p.purchaseId !== id);
    this.purchasesSignal.set(filtered);
    this.storage.setItem('purchases', filtered);
    this.notification.info('Order Removed', `Purchase order ${po.purchaseId} deleted.`);
    return true;
  }
}
