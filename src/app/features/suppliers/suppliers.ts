import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { SupplierService } from '../../core/services/supplier.service';
import { Supplier } from '../../core/models/supplier.model';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="suppliers-page">
      <app-page-header 
        title="Supplier & Vendor Directory" 
        section="Procurement" 
        subtitle="Manage verified vendor contracts, supplied material categories, and contact information"
        actionButtonText="Register Supplier"
        actionIcon="bi bi-truck"
        (actionClicked)="openAddModal()">
      </app-page-header>

      <!-- Search & Filters -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search by vendor name, company, email, or supplied products..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-6 text-md-end text-muted small">
            <span>Active Suppliers: <strong>{{ filteredSuppliers.length }}</strong> of {{ supplierService.getAll().length }}</span>
          </div>
        </div>
      </div>

      <!-- Suppliers Grid Cards / Table -->
      <div class="row g-3">
        @for (sup of filteredSuppliers; track sup.id) {
          <div class="col-lg-6">
            <div class="card card-enterprise h-100 p-4">
              <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="vendor-avatar">
                    <i class="bi bi-building fs-4"></i>
                  </div>
                  <div>
                    <span class="badge bg-light text-primary border border-primary-subtle fw-bold mb-1">
                      {{ sup.supplierId }}
                    </span>
                    <h5 class="fw-bold text-dark mb-0">{{ sup.companyName }}</h5>
                    <div class="text-muted small">Contact: <strong>{{ sup.supplierName }}</strong></div>
                  </div>
                </div>

                <div class="btn-group btn-group-sm">
                  <button 
                    type="button" 
                    class="btn btn-outline-custom text-primary" 
                    title="Edit Supplier"
                    (click)="openEditModal(sup)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-custom text-danger" 
                    title="Delete Supplier"
                    (click)="confirmDelete(sup)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <div class="row g-2 mb-3 small">
                <div class="col-sm-6 text-muted">
                  <i class="bi bi-envelope text-primary me-1"></i> {{ sup.email }}
                </div>
                <div class="col-sm-6 text-muted">
                  <i class="bi bi-telephone text-primary me-1"></i> {{ sup.phone }}
                </div>
                <div class="col-12 text-muted text-truncate">
                  <i class="bi bi-geo-alt text-danger me-1"></i> {{ sup.address }}
                </div>
                @if (sup.taxNumber) {
                  <div class="col-sm-6 text-muted">
                    <i class="bi bi-card-text text-secondary me-1"></i> Tax/GST: <span class="fw-semibold">{{ sup.taxNumber }}</span>
                  </div>
                }
                @if (sup.paymentTerms) {
                  <div class="col-sm-6 text-muted">
                    <i class="bi bi-clock-history text-secondary me-1"></i> Terms: <span class="fw-semibold">{{ sup.paymentTerms }}</span>
                  </div>
                }
              </div>

              <!-- Supplied Products Tags -->
              <div>
                <div class="text-uppercase text-muted fw-bold mb-1" style="font-size: 0.68rem; letter-spacing: 0.05em;">Supplied Materials & Goods</div>
                <div class="d-flex flex-wrap gap-1">
                  @for (prod of sup.suppliedProducts; track prod) {
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 0.75rem;">
                      {{ prod }}
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-12">
            <div class="card card-enterprise text-center py-5">
              <i class="bi bi-truck fs-2 d-block mb-2 text-secondary"></i>
              <div class="text-muted">No suppliers found matching your query.</div>
            </div>
          </div>
        }
      </div>

      <!-- Add / Edit Supplier Modal -->
      @if (isModalOpen) {
        <div class="modal-backdrop-custom" (click)="closeModal()">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i [class]="isEditMode ? 'bi bi-pencil-square text-primary' : 'bi bi-truck text-primary'" class="me-2"></i>
                {{ isEditMode ? 'Edit Vendor Details' : 'Register New Vendor / Supplier' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveSupplier()">
              <div class="modal-body-custom">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Company Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentSupplier.companyName" name="companyName" required placeholder="e.g. Acme Tech Solutions Pvt Ltd">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Contact Person Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentSupplier.supplierName" name="supplierName" required placeholder="e.g. Vikram Singhal">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Email Address *</label>
                    <input type="email" class="form-control" [(ngModel)]="currentSupplier.email" name="email" required placeholder="e.g. sales@acmetech.com">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Phone Number *</label>
                    <input type="tel" class="form-control" [(ngModel)]="currentSupplier.phone" name="phone" required placeholder="e.g. +91 22 2847 9000">
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Registered Address *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentSupplier.address" name="address" required placeholder="Street address, City, State, PIN">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Tax ID / GST Number</label>
                    <input type="text" class="form-control" [(ngModel)]="currentSupplier.taxNumber" name="taxNumber" placeholder="e.g. GSTIN27AABCA1234D1Z5">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Payment Terms</label>
                    <select class="form-select" [(ngModel)]="currentSupplier.paymentTerms" name="paymentTerms">
                      <option value="Immediate">Immediate / Advance</option>
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Supplied Products / Categories (Comma-separated) *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      [(ngModel)]="productsInput" 
                      name="productsInput" 
                      required 
                      placeholder="e.g. Laptops, Monitors, Keyboards, Network Cables">
                    <small class="text-muted">Separate items with commas</small>
                  </div>
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary-custom">
                  {{ isEditMode ? 'Save Changes' : 'Register Supplier' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Supplier"
        [message]="'Are you sure you want to remove ' + (supplierToDelete?.companyName || '') + ' from vendor directory?'"
        confirmText="Yes, Remove Supplier"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .vendor-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #eff6ff;
      color: #1e40af;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid #bfdbfe;
    }
  `]
})
export class SuppliersComponent {
  protected supplierService = inject(SupplierService);

  searchTerm = '';
  isModalOpen = false;
  isEditMode = false;
  editingId: string | null = null;
  productsInput = '';

  currentSupplier: Partial<Supplier> = {
    companyName: '',
    supplierName: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    paymentTerms: 'Net 30'
  };

  isDeleteModalOpen = false;
  supplierToDelete: Supplier | null = null;

  get filteredSuppliers(): Supplier[] {
    return this.supplierService.getAll().filter(s => {
      if (!this.searchTerm) return true;
      const term = this.searchTerm.toLowerCase();
      return s.companyName.toLowerCase().includes(term) ||
        s.supplierName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.supplierId.toLowerCase().includes(term) ||
        s.suppliedProducts.some(p => p.toLowerCase().includes(term));
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.productsInput = '';
    this.currentSupplier = {
      companyName: '',
      supplierName: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: '',
      paymentTerms: 'Net 30'
    };
    this.isModalOpen = true;
  }

  openEditModal(sup: Supplier): void {
    this.isEditMode = true;
    this.editingId = sup.id;
    this.productsInput = sup.suppliedProducts.join(', ');
    this.currentSupplier = { ...sup };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveSupplier(): void {
    if (!this.currentSupplier.companyName || !this.currentSupplier.email) return;

    const products = this.productsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (this.isEditMode && this.editingId) {
      this.supplierService.update(this.editingId, {
        ...this.currentSupplier,
        suppliedProducts: products
      });
    } else {
      this.supplierService.create({
        companyName: this.currentSupplier.companyName!,
        supplierName: this.currentSupplier.supplierName || 'Contact',
        email: this.currentSupplier.email!,
        phone: this.currentSupplier.phone || '',
        address: this.currentSupplier.address || '',
        suppliedProducts: products.length > 0 ? products : ['General Goods'],
        taxNumber: this.currentSupplier.taxNumber,
        paymentTerms: this.currentSupplier.paymentTerms
      });
    }

    this.closeModal();
  }

  confirmDelete(sup: Supplier): void {
    this.supplierToDelete = sup;
    this.isDeleteModalOpen = true;
  }

  executeDelete(): void {
    if (this.supplierToDelete) {
      this.supplierService.delete(this.supplierToDelete.id);
      this.isDeleteModalOpen = false;
      this.supplierToDelete = null;
    }
  }
}
