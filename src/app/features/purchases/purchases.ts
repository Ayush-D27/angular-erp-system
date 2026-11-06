import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { PurchaseService } from '../../core/services/purchase.service';
import { SupplierService } from '../../core/services/supplier.service';
import { InventoryService } from '../../core/services/inventory.service';
import { PurchaseOrder, PurchaseStatus, PurchaseItem } from '../../core/models/purchase.model';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="purchases-page">
      <app-page-header 
        title="Purchase Orders & Procurement" 
        section="Procurement" 
        subtitle="Manage supplier requisitions, goods receipts, automated inventory restocking, and procurement spend"
        actionButtonText="Create Purchase Order"
        actionIcon="bi bi-cart-plus-fill"
        (actionClicked)="openCreateModal()">
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Purchase Orders" 
            [value]="purchaseService.getAll().length" 
            subtext="All procurement requests" 
            icon="bi bi-cart4"
            iconBg="#eff6ff"
            iconColor="#1e40af">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Received & In-Stock" 
            [value]="receivedOrdersCount" 
            subtext="Fulfilled and stocked" 
            icon="bi bi-check2-circle"
            iconBg="#ecfdf5"
            iconColor="#059669"
            trend="Stock Synced"
            [trendPositive]="true">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Pending Approval" 
            [value]="pendingOrdersCount" 
            subtext="Awaiting vendor dispatch" 
            icon="bi bi-hourglass-split"
            iconBg="#fffbeb"
            iconColor="#d97706"
            [trendPositive]="pendingOrdersCount === 0">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Spend (Received)" 
            [value]="'₹' + (totalSpend | number:'1.0-0')" 
            subtext="Procurement cost logged" 
            icon="bi bi-cash-stack"
            iconBg="#f5f3ff"
            iconColor="#7c3aed">
          </app-stat-card>
        </div>
      </div>

      <!-- Search & Status Filters -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search by PO ID, supplier name..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="selectedStatus">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Received">Received (Stock Updated)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-4 text-md-end text-muted small">
            <span>Showing: <strong>{{ filteredPurchases.length }}</strong> of {{ purchaseService.getAll().length }} orders</span>
          </div>
        </div>
      </div>

      <!-- Purchase Orders Table -->
      <div class="card card-enterprise">
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier Vendor</th>
                <th>Order Date</th>
                <th>Items Ordered</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Stock Sync</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (po of filteredPurchases; track po.id) {
                <tr>
                  <td>
                    <span class="badge bg-light text-primary border border-primary-subtle fw-bold">
                      {{ po.purchaseId }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold text-dark">{{ po.supplierName }}</div>
                  </td>
                  <td class="text-muted small">{{ po.orderDate }}</td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                      {{ po.items.length }} line items
                    </span>
                  </td>
                  <td class="fw-bold text-dark">₹{{ po.totalAmount | number:'1.0-0' }}</td>
                  <td>
                    <span class="badge-custom" [ngClass]="getStatusBadge(po.status)">
                      {{ po.status }}
                    </span>
                  </td>
                  <td>
                    @if (po.stockUpdated) {
                      <span class="badge bg-success-subtle text-success border border-success-subtle small">
                        <i class="bi bi-check-all me-1"></i> Stock Added
                      </span>
                    } @else {
                      <span class="badge bg-light text-muted border small">
                        <i class="bi bi-clock me-1"></i> Pending Receipt
                      </span>
                    }
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-info" 
                        title="View PO Details"
                        (click)="viewDetails(po)">
                        <i class="bi bi-eye"></i>
                      </button>

                      @if (po.status !== 'Received' && po.status !== 'Cancelled') {
                        <button 
                          type="button" 
                          class="btn btn-outline-custom text-success fw-semibold" 
                          title="Mark Goods Received (Updates Stock Exactly Once)"
                          (click)="markAsReceived(po)">
                          <i class="bi bi-box-arrow-in-down me-1"></i> Receive
                        </button>
                      }

                      @if (po.status === 'Pending') {
                        <button 
                          type="button" 
                          class="btn btn-outline-custom text-primary" 
                          title="Approve Order"
                          (click)="updateStatus(po, 'Approved')">
                          <i class="bi bi-check-lg"></i>
                        </button>
                      }

                      @if (po.status !== 'Received') {
                        <button 
                          type="button" 
                          class="btn btn-outline-custom text-danger" 
                          title="Delete Order"
                          (click)="confirmDelete(po)">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-cart-x fs-2 d-block mb-2 text-secondary"></i>
                    No purchase orders found matching criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Purchase Order Modal -->
      @if (isCreateModalOpen) {
        <div class="modal-backdrop-custom" (click)="isCreateModalOpen = false">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-cart-plus text-primary me-2"></i> Create Procurement Purchase Order
              </h5>
              <button type="button" class="btn-close" (click)="isCreateModalOpen = false"></button>
            </div>
            <form (ngSubmit)="submitPurchaseOrder()">
              <div class="modal-body-custom">
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Select Supplier Vendor *</label>
                    <select class="form-select" [(ngModel)]="newPO.supplierId" name="supplierId" required (change)="onSupplierChange()">
                      <option value="">-- Choose Vendor --</option>
                      @for (sup of supplierService.getAll(); track sup.id) {
                        <option [value]="sup.id">{{ sup.companyName }} ({{ sup.supplierId }})</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Delivery / Order Notes</label>
                    <input type="text" class="form-control" [(ngModel)]="newPO.notes" name="notes" placeholder="Purchase purpose, delivery instructions...">
                  </div>
                </div>

                <!-- Line Items Section -->
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <div class="fw-bold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                    Order Line Items
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="addLineItem()">
                    <i class="bi bi-plus-circle me-1"></i> Add Product
                  </button>
                </div>

                <div class="border rounded p-3 bg-light mb-3">
                  @for (item of newPO.items; track $index) {
                    <div class="row g-2 align-items-center mb-2">
                      <div class="col-md-5">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Product SKU *</label>
                        <select class="form-select form-select-sm" [(ngModel)]="item.productId" [name]="'prod_' + $index" (change)="onProductSelect(item)" required>
                          <option value="">-- Select Product --</option>
                          @for (p of inventoryService.getAll(); track p.id) {
                            <option [value]="p.id">{{ p.productName }} ({{ p.productId }}) - Current Stock: {{ p.stockQuantity }}</option>
                          }
                        </select>
                      </div>

                      <div class="col-md-2">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Quantity *</label>
                        <input type="number" class="form-control form-select-sm" [(ngModel)]="item.quantity" [name]="'qty_' + $index" min="1" required (input)="recalculateItemSubtotal(item)">
                      </div>

                      <div class="col-md-2">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Unit Cost (₹) *</label>
                        <input type="number" class="form-control form-select-sm" [(ngModel)]="item.unitPrice" [name]="'cost_' + $index" min="1" required (input)="recalculateItemSubtotal(item)">
                      </div>

                      <div class="col-md-2">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Subtotal</label>
                        <div class="fw-bold small py-1 text-dark">₹{{ item.subtotal | number:'1.0-0' }}</div>
                      </div>

                      <div class="col-md-1 text-end">
                        <label class="form-label d-block text-muted" style="font-size: 0.75rem;">&nbsp;</label>
                        <button type="button" class="btn btn-sm btn-outline-danger border-0 p-1" (click)="removeLineItem($index)" [disabled]="newPO.items.length <= 1">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <!-- Totals Calculation Summary -->
                <div class="row justify-content-end">
                  <div class="col-md-5">
                    <div class="border rounded p-3 bg-white small">
                      <div class="d-flex justify-content-between mb-1 text-muted">
                        <span>Items Subtotal:</span>
                        <span class="fw-semibold text-dark">₹{{ calculatedSubtotal | number:'1.0-0' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-1 text-muted">
                        <span>GST Tax (18%):</span>
                        <span class="fw-semibold text-dark">₹{{ calculatedTax | number:'1.0-0' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-2 text-muted">
                        <span>Freight / Shipping:</span>
                        <span class="fw-semibold text-dark">₹{{ newPO.shippingFee | number:'1.0-0' }}</span>
                      </div>
                      <hr class="my-2">
                      <div class="d-flex justify-content-between fs-6 fw-bold text-dark">
                        <span>Grand Total:</span>
                        <span class="text-primary">₹{{ calculatedGrandTotal | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="isCreateModalOpen = false">Cancel</button>
                <button type="submit" class="btn btn-primary-custom" [disabled]="!isFormValid">
                  Generate Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Order Details Modal -->
      @if (selectedOrderForView) {
        <div class="modal-backdrop-custom" (click)="selectedOrderForView = null">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-receipt text-primary me-2"></i> Purchase Order Details: {{ selectedOrderForView.purchaseId }}
              </h5>
              <button type="button" class="btn-close" (click)="selectedOrderForView = null"></button>
            </div>
            <div class="modal-body-custom">
              <div class="d-flex justify-content-between align-items-start mb-4 p-3 bg-light rounded border">
                <div>
                  <h5 class="fw-bold text-dark mb-1">{{ selectedOrderForView.supplierName }}</h5>
                  <div class="text-muted small">PO Reference: <strong>{{ selectedOrderForView.purchaseId }}</strong></div>
                  <div class="text-muted small">Ordered on: {{ selectedOrderForView.orderDate }}</div>
                  @if (selectedOrderForView.receivedDate) {
                    <div class="text-success small fw-semibold">
                      <i class="bi bi-box-seam me-1"></i> Stock Received On: {{ selectedOrderForView.receivedDate }}
                    </div>
                  }
                </div>
                <div class="text-end">
                  <span class="badge-custom fs-6 mb-1" [ngClass]="getStatusBadge(selectedOrderForView.status)">
                    {{ selectedOrderForView.status }}
                  </span>
                  <div class="small text-muted mt-1">
                    {{ selectedOrderForView.stockUpdated ? 'Inventory Updated: Yes' : 'Inventory Updated: No' }}
                  </div>
                </div>
              </div>

              <!-- Line Items Table -->
              <h6 class="fw-bold text-dark mb-2">Requisition Items</h6>
              <div class="table-responsive border rounded mb-3">
                <table class="table-enterprise">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th class="text-end">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of selectedOrderForView.items; track item.productId) {
                      <tr>
                        <td class="fw-bold text-dark">{{ item.productName }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>₹{{ item.unitPrice | number:'1.0-0' }}</td>
                        <td class="text-end fw-bold">₹{{ item.subtotal | number:'1.0-0' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Financial Breakdown -->
              <div class="row justify-content-end">
                <div class="col-md-5">
                  <div class="border rounded p-3 bg-light small">
                    <div class="d-flex justify-content-between mb-1">
                      <span>Subtotal:</span>
                      <span class="fw-semibold">₹{{ selectedOrderForView.subtotal | number:'1.0-0' }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Tax (18%):</span>
                      <span class="fw-semibold">₹{{ selectedOrderForView.taxAmount | number:'1.0-0' }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Shipping Fee:</span>
                      <span class="fw-semibold">₹{{ selectedOrderForView.shippingFee | number:'1.0-0' }}</span>
                    </div>
                    <hr class="my-1">
                    <div class="d-flex justify-content-between fw-bold text-dark fs-6">
                      <span>Total Procurement Cost:</span>
                      <span class="text-primary">₹{{ selectedOrderForView.totalAmount | number:'1.0-0' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer-custom">
              @if (selectedOrderForView.status !== 'Received' && selectedOrderForView.status !== 'Cancelled') {
                <button type="button" class="btn btn-success" (click)="markAsReceived(selectedOrderForView)">
                  <i class="bi bi-box-arrow-in-down me-1"></i> Receive & Sync Inventory Stock
                </button>
              }
              <button type="button" class="btn btn-outline-custom" (click)="selectedOrderForView = null">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Cancel & Delete Purchase Order"
        [message]="'Are you sure you want to delete PO ' + (poToDelete?.purchaseId || '') + '?'"
        confirmText="Yes, Delete PO"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class PurchasesComponent {
  protected purchaseService = inject(PurchaseService);
  protected supplierService = inject(SupplierService);
  protected inventoryService = inject(InventoryService);

  searchTerm = '';
  selectedStatus = '';

  isCreateModalOpen = false;
  selectedOrderForView: PurchaseOrder | null = null;
  isDeleteModalOpen = false;
  poToDelete: PurchaseOrder | null = null;

  newPO = {
    supplierId: '',
    supplierName: '',
    notes: '',
    shippingFee: 2500,
    items: [
      { productId: '', productName: '', quantity: 5, unitPrice: 10000, subtotal: 50000 }
    ]
  };

  get receivedOrdersCount(): number {
    return this.purchaseService.getAll().filter(p => p.status === 'Received').length;
  }

  get pendingOrdersCount(): number {
    return this.purchaseService.getAll().filter(p => p.status === 'Pending').length;
  }

  get totalSpend(): number {
    return this.purchaseService.getAll()
      .filter(p => p.status === 'Received')
      .reduce((acc, p) => acc + p.totalAmount, 0);
  }

  get filteredPurchases(): PurchaseOrder[] {
    return this.purchaseService.getAll().filter(p => {
      const matchSearch = !this.searchTerm ||
        p.purchaseId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  getStatusBadge(status: PurchaseStatus): string {
    switch (status) {
      case 'Received': return 'badge-success-custom';
      case 'Approved': return 'badge-info-custom';
      case 'Pending': return 'badge-warning-custom';
      case 'Cancelled': return 'badge-danger-custom';
      default: return 'badge-secondary-custom';
    }
  }

  openCreateModal(): void {
    const suppliers = this.supplierService.getAll();
    const firstSup = suppliers[0];

    this.newPO = {
      supplierId: firstSup ? firstSup.id : '',
      supplierName: firstSup ? firstSup.companyName : '',
      notes: '',
      shippingFee: 2500,
      items: [
        { productId: '', productName: '', quantity: 5, unitPrice: 10000, subtotal: 50000 }
      ]
    };
    this.isCreateModalOpen = true;
  }

  onSupplierChange(): void {
    const sup = this.supplierService.getAll().find(s => s.id === this.newPO.supplierId);
    this.newPO.supplierName = sup ? sup.companyName : '';
  }

  addLineItem(): void {
    this.newPO.items.push({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 1000,
      subtotal: 1000
    });
  }

  removeLineItem(index: number): void {
    if (this.newPO.items.length > 1) {
      this.newPO.items.splice(index, 1);
    }
  }

  onProductSelect(item: PurchaseItem): void {
    const prod = this.inventoryService.getById(item.productId);
    if (prod) {
      item.productName = prod.productName;
      item.unitPrice = Math.round(prod.unitPrice * 0.85); // wholesale purchase rate
      this.recalculateItemSubtotal(item);
    }
  }

  recalculateItemSubtotal(item: PurchaseItem): void {
    item.subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }

  get calculatedSubtotal(): number {
    return this.newPO.items.reduce((acc, i) => acc + (i.subtotal || 0), 0);
  }

  get calculatedTax(): number {
    return Math.round(this.calculatedSubtotal * 0.18);
  }

  get calculatedGrandTotal(): number {
    return this.calculatedSubtotal + this.calculatedTax + (this.newPO.shippingFee || 0);
  }

  get isFormValid(): boolean {
    return !!this.newPO.supplierId && 
           this.newPO.items.length > 0 && 
           this.newPO.items.every(i => !!i.productId && i.quantity > 0 && i.unitPrice > 0);
  }

  submitPurchaseOrder(): void {
    if (!this.isFormValid) return;

    this.purchaseService.create({
      supplierId: this.newPO.supplierId,
      supplierName: this.newPO.supplierName,
      items: this.newPO.items,
      taxAmount: this.calculatedTax,
      shippingFee: this.newPO.shippingFee,
      notes: this.newPO.notes
    });

    this.isCreateModalOpen = false;
  }

  markAsReceived(po: PurchaseOrder): void {
    this.purchaseService.updateStatus(po.id, 'Received');
    if (this.selectedOrderForView && this.selectedOrderForView.id === po.id) {
      const refreshed = this.purchaseService.getById(po.id);
      if (refreshed) this.selectedOrderForView = refreshed;
    }
  }

  updateStatus(po: PurchaseOrder, status: PurchaseStatus): void {
    this.purchaseService.updateStatus(po.id, status);
  }

  viewDetails(po: PurchaseOrder): void {
    this.selectedOrderForView = po;
  }

  confirmDelete(po: PurchaseOrder): void {
    this.poToDelete = po;
    this.isDeleteModalOpen = true;
  }

  executeDelete(): void {
    if (this.poToDelete) {
      this.purchaseService.delete(this.poToDelete.id);
      this.isDeleteModalOpen = false;
      this.poToDelete = null;
    }
  }
}
