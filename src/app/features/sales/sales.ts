import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { SaleService } from '../../core/services/sale.service';
import { InventoryService } from '../../core/services/inventory.service';
import { SalesOrder, SaleStatus, SaleItem } from '../../core/models/sale.model';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="sales-page">
      <app-page-header 
        title="Sales Orders & Customer Invoicing" 
        section="Commercial Operations" 
        subtitle="Manage customer orders, real-time inventory reservation, invoice calculation, and fulfillment"
        actionButtonText="Create Sales Order"
        actionIcon="bi bi-bag-plus-fill"
        (actionClicked)="openCreateModal()">
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Sales Orders" 
            [value]="saleService.getAll().length" 
            subtext="All customer bookings" 
            icon="bi bi-bag-check"
            iconBg="#eff6ff"
            iconColor="#1e40af">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Completed Deliveries" 
            [value]="completedOrdersCount" 
            subtext="Fulfilled and delivered" 
            icon="bi bi-box2-heart"
            iconBg="#ecfdf5"
            iconColor="#059669"
            trend="Stock Deducted"
            [trendPositive]="true">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Pending Fulfillment" 
            [value]="pendingOrdersCount" 
            subtext="Awaiting dispatch approval" 
            icon="bi bi-clock-history"
            iconBg="#fffbeb"
            iconColor="#d97706"
            [trendPositive]="pendingOrdersCount === 0">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Revenue (Fulfilled)" 
            [value]="'₹' + (totalCompletedRevenue | number:'1.0-0')" 
            subtext="Realized cashflow" 
            icon="bi bi-cash-coin"
            iconBg="#f5f3ff"
            iconColor="#7c3aed"
            [trendPositive]="true">
          </app-stat-card>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search by Sales Order #, customer name, email..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="selectedStatus">
              <option value="">All Statuses</option>
              <option value="Completed">Completed (Fulfilled)</option>
              <option value="Pending">Pending (Draft / In Process)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-4 text-md-end text-muted small">
            <span>Showing: <strong>{{ filteredSales.length }}</strong> of {{ saleService.getAll().length }} orders</span>
          </div>
        </div>
      </div>

      <!-- Sales Orders Table -->
      <div class="card card-enterprise">
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer Details</th>
                <th>Order Date</th>
                <th>Items Ordered</th>
                <th>Payment</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Stock Deduction</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (so of filteredSales; track so.id) {
                <tr>
                  <td>
                    <span class="badge bg-light text-primary border border-primary-subtle fw-bold">
                      {{ so.saleId }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold text-dark">{{ so.customer.name }}</div>
                    <small class="text-muted">{{ so.customer.email }}</small>
                  </td>
                  <td class="text-muted small">{{ so.orderDate }}</td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                      {{ so.items.length }} line items
                    </span>
                  </td>
                  <td>
                    <div class="small fw-semibold text-secondary">{{ so.paymentMethod }}</div>
                    <span class="badge" [ngClass]="so.paymentStatus === 'Paid' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'" style="font-size: 0.65rem;">
                      {{ so.paymentStatus }}
                    </span>
                  </td>
                  <td class="fw-bold text-dark">₹{{ so.totalAmount | number:'1.0-0' }}</td>
                  <td>
                    <span class="badge-custom" [ngClass]="getStatusBadge(so.status)">
                      {{ so.status }}
                    </span>
                  </td>
                  <td>
                    @if (so.stockDeducted) {
                      <span class="badge bg-success-subtle text-success border border-success-subtle small">
                        <i class="bi bi-check-all me-1"></i> Stock Deducted
                      </span>
                    } @else {
                      <span class="badge bg-light text-muted border small">
                        <i class="bi bi-hourglass me-1"></i> Not Deducted
                      </span>
                    }
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-info" 
                        title="View Invoice"
                        (click)="viewInvoice(so)">
                        <i class="bi bi-file-earmark-text"></i>
                      </button>

                      @if (so.status === 'Pending') {
                        <button 
                          type="button" 
                          class="btn btn-outline-custom text-success fw-semibold" 
                          title="Fulfill & Deduct Stock Exactly Once"
                          (click)="completeSale(so)">
                          <i class="bi bi-check2-circle me-1"></i> Fulfill
                        </button>
                      }

                      @if (so.status !== 'Completed') {
                        <button 
                          type="button" 
                          class="btn btn-outline-custom text-danger" 
                          title="Delete Order"
                          (click)="confirmDelete(so)">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center py-5 text-muted">
                    <i class="bi bi-bag-x fs-2 d-block mb-2 text-secondary"></i>
                    No sales orders found matching criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Sales Order Modal with Stock Validation -->
      @if (isCreateModalOpen) {
        <div class="modal-backdrop-custom" (click)="isCreateModalOpen = false">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-bag-plus text-primary me-2"></i> Create Customer Sales Order
              </h5>
              <button type="button" class="btn-close" (click)="isCreateModalOpen = false"></button>
            </div>
            <form (ngSubmit)="submitSalesOrder()">
              <div class="modal-body-custom">
                @if (stockErrorMessage) {
                  <div class="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 small" role="alert">
                    <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>{{ stockErrorMessage }}</div>
                  </div>
                }

                <!-- Customer Details -->
                <div class="fw-bold text-dark small text-uppercase mb-2" style="letter-spacing: 0.05em;">
                  Customer Information
                </div>
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Customer / Organization Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="newSale.customer.name" name="custName" required placeholder="e.g. Apex Innovations Ltd">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Email Address *</label>
                    <input type="email" class="form-control" [(ngModel)]="newSale.customer.email" name="custEmail" required placeholder="e.g. orders@apexcorp.com">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input type="tel" class="form-control" [(ngModel)]="newSale.customer.phone" name="custPhone" placeholder="e.g. +91 99887 76655">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Payment Method</label>
                    <select class="form-select" [(ngModel)]="newSale.paymentMethod" name="payMethod">
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Credit Card">Corporate Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <!-- Products Selection & Real-Time Stock Check -->
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <div class="fw-bold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                    Products & Quantities
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="addLineItem()">
                    <i class="bi bi-plus-circle me-1"></i> Add Product
                  </button>
                </div>

                <div class="border rounded p-3 bg-light mb-3">
                  @for (item of newSale.items; track $index) {
                    <div class="row g-2 align-items-center mb-2">
                      <div class="col-md-5">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Product SKU *</label>
                        <select class="form-select form-select-sm" [(ngModel)]="item.productId" [name]="'prod_' + $index" (change)="onProductSelect(item)" required>
                          <option value="">-- Choose Product --</option>
                          @for (p of inventoryService.getAll(); track p.id) {
                            <option [value]="p.id">
                              {{ p.productName }} ({{ p.productId }}) - Available: {{ p.stockQuantity }} units
                            </option>
                          }
                        </select>
                      </div>

                      <div class="col-md-2">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Qty *</label>
                        <input 
                          type="number" 
                          class="form-control form-select-sm" 
                          [(ngModel)]="item.quantity" 
                          [name]="'qty_' + $index" 
                          min="1" 
                          required 
                          (input)="onQuantityChange(item)">
                      </div>

                      <div class="col-md-2">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Unit Price (₹)</label>
                        <input 
                          type="number" 
                          class="form-control form-select-sm" 
                          [(ngModel)]="item.unitPrice" 
                          [name]="'price_' + $index" 
                          min="1" 
                          required 
                          (input)="onQuantityChange(item)">
                      </div>

                      <div class="col-md-2">
                        <label class="form-label text-muted" style="font-size: 0.75rem;">Subtotal</label>
                        <div class="fw-bold small py-1 text-dark">₹{{ item.subtotal | number:'1.0-0' }}</div>
                      </div>

                      <div class="col-md-1 text-end">
                        <label class="form-label d-block text-muted" style="font-size: 0.75rem;">&nbsp;</label>
                        <button type="button" class="btn btn-sm btn-outline-danger border-0 p-1" (click)="removeLineItem($index)" [disabled]="newSale.items.length <= 1">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <!-- Financial Calculation Summary -->
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
                        <span>Discount (₹):</span>
                        <input type="number" class="form-control form-control-sm text-end" style="width: 100px;" [(ngModel)]="newSale.discountAmount" name="discount" min="0">
                      </div>
                      <hr class="my-2">
                      <div class="d-flex justify-content-between fs-6 fw-bold text-dark">
                        <span>Grand Total:</span>
                        <span class="text-primary">₹{{ calculatedGrandTotal | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fulfillment Option -->
                <div class="mt-3 p-3 bg-light rounded border">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="immediateFulfill" [(ngModel)]="fulfillImmediately" name="fulfillImmediately">
                    <label class="form-check-label fw-semibold text-dark small" for="immediateFulfill">
                      Fulfill Immediately & Deduct Inventory Stock Upon Creation
                    </label>
                    <small class="text-muted d-block">If unchecked, order will be saved as 'Pending' and stock will remain reserved until marked 'Completed'.</small>
                  </div>
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="isCreateModalOpen = false">Cancel</button>
                <button type="submit" class="btn btn-primary-custom" [disabled]="!isFormValid">
                  Generate Sales Order
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Invoice View Modal -->
      @if (selectedOrderForInvoice) {
        <div class="modal-backdrop-custom" (click)="selectedOrderForInvoice = null">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-file-earmark-check text-primary me-2"></i> Commercial Tax Invoice
              </h5>
              <button type="button" class="btn-close" (click)="selectedOrderForInvoice = null"></button>
            </div>
            <div class="modal-body-custom">
              <!-- Invoice Header -->
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                <div>
                  <h4 class="fw-bold text-primary mb-1">NEXUS<span>ERP</span></h4>
                  <div class="text-muted small">Nexus Enterprise Technologies Ltd.</div>
                  <div class="text-muted small">GSTIN: 27AABCN1234F1Z1</div>
                </div>
                <div class="text-end">
                  <h5 class="fw-bold text-dark mb-1">INVOICE {{ selectedOrderForInvoice.saleId }}</h5>
                  <div class="text-muted small">Date: {{ selectedOrderForInvoice.orderDate }}</div>
                  <span class="badge-custom mt-1" [ngClass]="getStatusBadge(selectedOrderForInvoice.status)">
                    {{ selectedOrderForInvoice.status }}
                  </span>
                </div>
              </div>

              <!-- Billed To -->
              <div class="p-3 bg-light rounded border mb-3">
                <div class="text-uppercase text-muted fw-bold small" style="font-size: 0.7rem;">Billed To Customer:</div>
                <div class="fw-bold text-dark fs-6">{{ selectedOrderForInvoice.customer.name }}</div>
                <div class="small text-muted">{{ selectedOrderForInvoice.customer.email }} | {{ selectedOrderForInvoice.customer.phone }}</div>
                @if (selectedOrderForInvoice.customer.address) {
                  <div class="small text-muted">{{ selectedOrderForInvoice.customer.address }}</div>
                }
              </div>

              <!-- Line Items Table -->
              <div class="table-responsive border rounded mb-3">
                <table class="table-enterprise">
                  <thead>
                    <tr>
                      <th>Product Item</th>
                      <th class="text-center">Quantity</th>
                      <th class="text-end">Unit Price</th>
                      <th class="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of selectedOrderForInvoice.items; track item.productId) {
                      <tr>
                        <td class="fw-bold text-dark">{{ item.productName }}</td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">₹{{ item.unitPrice | number:'1.0-0' }}</td>
                        <td class="text-end fw-bold">₹{{ item.subtotal | number:'1.0-0' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Summary Totals -->
              <div class="row justify-content-end">
                <div class="col-md-5">
                  <div class="border rounded p-3 bg-light small">
                    <div class="d-flex justify-content-between mb-1">
                      <span>Subtotal:</span>
                      <span class="fw-semibold">₹{{ selectedOrderForInvoice.subtotal | number:'1.0-0' }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>GST (18%):</span>
                      <span class="fw-semibold">₹{{ selectedOrderForInvoice.taxAmount | number:'1.0-0' }}</span>
                    </div>
                    @if (selectedOrderForInvoice.discountAmount > 0) {
                      <div class="d-flex justify-content-between mb-1 text-danger">
                        <span>Discount:</span>
                        <span class="fw-semibold">-₹{{ selectedOrderForInvoice.discountAmount | number:'1.0-0' }}</span>
                      </div>
                    }
                    <hr class="my-1">
                    <div class="d-flex justify-content-between fw-bold text-dark fs-6">
                      <span>Total Amount:</span>
                      <span class="text-primary">₹{{ selectedOrderForInvoice.totalAmount | number:'1.0-0' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer-custom">
              @if (selectedOrderForInvoice.status === 'Pending') {
                <button type="button" class="btn btn-success" (click)="completeSale(selectedOrderForInvoice)">
                  <i class="bi bi-check2-circle me-1"></i> Fulfill & Deduct Stock
                </button>
              }
              <button type="button" class="btn btn-outline-custom" (click)="selectedOrderForInvoice = null">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Sales Order"
        [message]="'Are you sure you want to delete order ' + (saleToDelete?.saleId || '') + '?'"
        confirmText="Yes, Delete Order"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class SalesComponent {
  protected saleService = inject(SaleService);
  protected inventoryService = inject(InventoryService);

  searchTerm = '';
  selectedStatus = '';

  isCreateModalOpen = false;
  selectedOrderForInvoice: SalesOrder | null = null;
  isDeleteModalOpen = false;
  saleToDelete: SalesOrder | null = null;

  stockErrorMessage = '';
  fulfillImmediately = true;

  newSale = {
    customer: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    paymentMethod: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'Credit Card' | 'UPI' | 'Cheque',
    discountAmount: 0,
    items: [
      { productId: '', productName: '', quantity: 1, unitPrice: 10000, subtotal: 10000 }
    ]
  };

  get completedOrdersCount(): number {
    return this.saleService.getAll().filter(s => s.status === 'Completed').length;
  }

  get pendingOrdersCount(): number {
    return this.saleService.getAll().filter(s => s.status === 'Pending').length;
  }

  get totalCompletedRevenue(): number {
    return this.saleService.getAll()
      .filter(s => s.status === 'Completed')
      .reduce((acc, s) => acc + s.totalAmount, 0);
  }

  get filteredSales(): SalesOrder[] {
    return this.saleService.getAll().filter(s => {
      const matchSearch = !this.searchTerm ||
        s.saleId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus = !this.selectedStatus || s.status === this.selectedStatus;
      return matchSearch && matchStatus;
    });
  }

  getStatusBadge(status: SaleStatus): string {
    switch (status) {
      case 'Completed': return 'badge-success-custom';
      case 'Pending': return 'badge-warning-custom';
      case 'Cancelled': return 'badge-danger-custom';
      default: return 'badge-secondary-custom';
    }
  }

  openCreateModal(): void {
    this.stockErrorMessage = '';
    this.fulfillImmediately = true;
    this.newSale = {
      customer: {
        name: '',
        email: '',
        phone: '',
        address: ''
      },
      paymentMethod: 'Bank Transfer',
      discountAmount: 0,
      items: [
        { productId: '', productName: '', quantity: 1, unitPrice: 10000, subtotal: 10000 }
      ]
    };
    this.isCreateModalOpen = true;
  }

  addLineItem(): void {
    this.newSale.items.push({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 1000,
      subtotal: 1000
    });
  }

  removeLineItem(index: number): void {
    if (this.newSale.items.length > 1) {
      this.newSale.items.splice(index, 1);
    }
  }

  onProductSelect(item: SaleItem): void {
    const prod = this.inventoryService.getById(item.productId);
    if (prod) {
      item.productName = prod.productName;
      item.unitPrice = prod.unitPrice;
      this.onQuantityChange(item);
    }
  }

  onQuantityChange(item: SaleItem): void {
    item.subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    this.validateStockAvailability();
  }

  validateStockAvailability(): boolean {
    this.stockErrorMessage = '';
    for (const item of this.newSale.items) {
      if (item.productId) {
        const prod = this.inventoryService.getById(item.productId);
        if (prod && prod.stockQuantity < item.quantity) {
          this.stockErrorMessage = `Cannot order ${item.quantity} units of "${prod.productName}". Only ${prod.stockQuantity} available in warehouse.`;
          return false;
        }
      }
    }
    return true;
  }

  get calculatedSubtotal(): number {
    return this.newSale.items.reduce((acc, i) => acc + (i.subtotal || 0), 0);
  }

  get calculatedTax(): number {
    return Math.round(this.calculatedSubtotal * 0.18);
  }

  get calculatedGrandTotal(): number {
    return Math.max(0, this.calculatedSubtotal + this.calculatedTax - (Number(this.newSale.discountAmount) || 0));
  }

  get isFormValid(): boolean {
    return !!this.newSale.customer.name &&
           !!this.newSale.customer.email &&
           this.newSale.items.length > 0 &&
           this.newSale.items.every(i => !!i.productId && i.quantity > 0) &&
           !this.stockErrorMessage;
  }

  submitSalesOrder(): void {
    if (!this.isFormValid) return;

    if (!this.validateStockAvailability()) return;

    const res = this.saleService.create({
      customer: this.newSale.customer,
      items: this.newSale.items,
      taxAmount: this.calculatedTax,
      discountAmount: Number(this.newSale.discountAmount) || 0,
      paymentMethod: this.newSale.paymentMethod,
      status: this.fulfillImmediately ? 'Completed' : 'Pending'
    });

    if (!res.success) {
      this.stockErrorMessage = res.message;
      return;
    }

    this.isCreateModalOpen = false;
  }

  completeSale(so: SalesOrder): void {
    const success = this.saleService.updateStatus(so.id, 'Completed');
    if (success && this.selectedOrderForInvoice && this.selectedOrderForInvoice.id === so.id) {
      const refreshed = this.saleService.getById(so.id);
      if (refreshed) this.selectedOrderForInvoice = refreshed;
    }
  }

  viewInvoice(so: SalesOrder): void {
    this.selectedOrderForInvoice = so;
  }

  confirmDelete(so: SalesOrder): void {
    this.saleToDelete = so;
    this.isDeleteModalOpen = true;
  }

  executeDelete(): void {
    if (this.saleToDelete) {
      this.saleService.delete(this.saleToDelete.id);
      this.isDeleteModalOpen = false;
      this.saleToDelete = null;
    }
  }
}
