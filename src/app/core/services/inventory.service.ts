import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { Product, StockAdjustment } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private productsSignal = signal<Product[]>([]);
  public products = this.productsSignal.asReadonly();

  public lowStockProducts = computed(() => {
    return this.productsSignal().filter(p => p.stockQuantity <= p.minStockLevel);
  });

  public totalInventoryValue = computed(() => {
    return this.productsSignal().reduce((acc, p) => acc + (p.stockQuantity * p.unitPrice), 0);
  });

  constructor(
    private storage: StorageService,
    private notification: NotificationService
  ) {
    this.loadProducts();
  }

  loadProducts(): void {
    const list = this.storage.getItem<Product[]>('products', []);
    this.productsSignal.set(list);
  }

  getAll(): Product[] {
    return this.productsSignal();
  }

  getById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id || p.productId === id);
  }

  generateProductId(): string {
    const current = this.productsSignal();
    if (current.length === 0) return 'PRD-1001';

    const numbers = current
      .map(p => {
        const match = p.productId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const max = Math.max(...numbers, 1000);
    return `PRD-${max + 1}`;
  }

  create(product: Omit<Product, 'id' | 'productId'>): Product {
    const newProduct: Product = {
      ...product,
      id: 'prd-' + Date.now().toString(),
      productId: this.generateProductId(),
      lastUpdated: new Date().toISOString()
    };

    const updated = [newProduct, ...this.productsSignal()];
    this.productsSignal.set(updated);
    this.storage.setItem('products', updated);
    this.notification.success('Product Added', `${newProduct.productName} (${newProduct.productId}) has been registered.`);
    return newProduct;
  }

  update(id: string, productData: Partial<Product>): boolean {
    const current = this.productsSignal();
    const index = current.findIndex(p => p.id === id);
    if (index === -1) {
      this.notification.error('Error', 'Product not found.');
      return false;
    }

    const updatedProduct = {
      ...current[index],
      ...productData,
      lastUpdated: new Date().toISOString()
    };
    const updated = [...current];
    updated[index] = updatedProduct;

    this.productsSignal.set(updated);
    this.storage.setItem('products', updated);
    this.notification.success('Product Updated', `Changes to ${updatedProduct.productName} have been saved.`);
    return true;
  }

  delete(id: string): boolean {
    const current = this.productsSignal();
    const product = current.find(p => p.id === id);
    if (!product) return false;

    const filtered = current.filter(p => p.id !== id);
    this.productsSignal.set(filtered);
    this.storage.setItem('products', filtered);
    this.notification.info('Product Deleted', `${product.productName} has been removed.`);
    return true;
  }

  /**
   * Safe stock change. Returns true if successful, false if insufficient stock.
   */
  adjustStock(productId: string, deltaQuantity: number, reason: string): boolean {
    const product = this.getById(productId);
    if (!product) {
      this.notification.error('Stock Error', `Product with ID ${productId} not found.`);
      return false;
    }

    const newQuantity = product.stockQuantity + deltaQuantity;
    if (newQuantity < 0) {
      this.notification.error('Insufficient Stock', `Cannot deduct ${Math.abs(deltaQuantity)} units of ${product.productName}. Only ${product.stockQuantity} in stock.`);
      return false;
    }

    const previousQuantity = product.stockQuantity;
    this.update(product.id, { stockQuantity: newQuantity });

    // Save adjustment history
    const adjustments = this.storage.getItem<StockAdjustment[]>('stock_adjustments', []);
    const newAdjustment: StockAdjustment = {
      id: 'adj-' + Date.now().toString(),
      productId: product.productId,
      productName: product.productName,
      previousQuantity,
      newQuantity,
      difference: deltaQuantity,
      reason,
      adjustedBy: 'System / User',
      date: new Date().toISOString()
    };
    this.storage.setItem('stock_adjustments', [newAdjustment, ...adjustments]);

    if (deltaQuantity > 0) {
      this.notification.info('Stock Increased', `Added ${deltaQuantity} units to ${product.productName}. New total: ${newQuantity}`);
    } else {
      this.notification.info('Stock Deducted', `Deducted ${Math.abs(deltaQuantity)} units from ${product.productName}. New total: ${newQuantity}`);
    }

    return true;
  }
}
