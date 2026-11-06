import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private suppliersSignal = signal<Supplier[]>([]);
  public suppliers = this.suppliersSignal.asReadonly();

  constructor(
    private storage: StorageService,
    private notification: NotificationService
  ) {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    const list = this.storage.getItem<Supplier[]>('suppliers', []);
    this.suppliersSignal.set(list);
  }

  getAll(): Supplier[] {
    return this.suppliersSignal();
  }

  getById(id: string): Supplier | undefined {
    return this.suppliersSignal().find(s => s.id === id || s.supplierId === id);
  }

  generateSupplierId(): string {
    const current = this.suppliersSignal();
    if (current.length === 0) return 'SUP-1001';

    const numbers = current
      .map(s => {
        const match = s.supplierId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const max = Math.max(...numbers, 1000);
    return `SUP-${max + 1}`;
  }

  create(supplier: Omit<Supplier, 'id' | 'supplierId'>): Supplier {
    const newSupplier: Supplier = {
      ...supplier,
      id: 'sup-' + Date.now().toString(),
      supplierId: this.generateSupplierId(),
      createdAt: new Date().toISOString()
    };

    const updated = [newSupplier, ...this.suppliersSignal()];
    this.suppliersSignal.set(updated);
    this.storage.setItem('suppliers', updated);
    this.notification.success('Supplier Registered', `${newSupplier.companyName} (${newSupplier.supplierId}) added.`);
    return newSupplier;
  }

  update(id: string, supplierData: Partial<Supplier>): boolean {
    const current = this.suppliersSignal();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) {
      this.notification.error('Error', 'Supplier not found.');
      return false;
    }

    const updatedSupplier = { ...current[index], ...supplierData };
    const updated = [...current];
    updated[index] = updatedSupplier;

    this.suppliersSignal.set(updated);
    this.storage.setItem('suppliers', updated);
    this.notification.success('Supplier Updated', `Changes to ${updatedSupplier.companyName} saved.`);
    return true;
  }

  delete(id: string): boolean {
    const current = this.suppliersSignal();
    const supplier = current.find(s => s.id === id);
    if (!supplier) return false;

    const filtered = current.filter(s => s.id !== id);
    this.suppliersSignal.set(filtered);
    this.storage.setItem('suppliers', filtered);
    this.notification.info('Supplier Removed', `${supplier.companyName} has been deleted.`);
    return true;
  }
}
