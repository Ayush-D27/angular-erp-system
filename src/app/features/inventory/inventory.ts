import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { InventoryService } from '../../core/services/inventory.service';
import { SupplierService } from '../../core/services/supplier.service';
import { Product } from '../../core/models/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="inventory-page">
      <app-page-header 
        title="Inventory & Warehouse Management" 
        section="Supply Chain" 
        subtitle="Catalog SKU tracking, warehouse stock levels, reorder thresholds, and valuation"
        actionButtonText="Add New Product"
        actionIcon="bi bi-box-seam-fill"
        (actionClicked)="openAddModal()">
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Catalog SKUs" 
            [value]="inventoryService.getAll().length" 
            subtext="Tracked products" 
            icon="bi bi-boxes"
            iconBg="#eff6ff"
            iconColor="#1e40af">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Inventory Valuation" 
            [value]="'₹' + (inventoryService.totalInventoryValue() | number:'1.0-0')" 
            subtext="Aggregate asset value" 
            icon="bi bi-cash-stack"
            iconBg="#ecfdf5"
            iconColor="#059669">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Low Stock Items" 
            [value]="inventoryService.lowStockProducts().length" 
            subtext="Below safety stock" 
            icon="bi bi-exclamation-triangle-fill"
            iconBg="#fef2f2"
            iconColor="#dc2626"
            [trend]="inventoryService.lowStockProducts().length > 0 ? 'Action Required' : 'Adequate'"
            [trendPositive]="inventoryService.lowStockProducts().length === 0">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Stock Units" 
            [value]="totalStockUnits" 
            subtext="Physical items count" 
            icon="bi bi-layers-fill"
            iconBg="#f0f9ff"
            iconColor="#0284c7">
          </app-stat-card>
        </div>
      </div>

      <!-- Low Stock Warning Banner if any -->
      @if (inventoryService.lowStockProducts().length > 0) {
        <div class="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border-danger shadow-sm">
          <div class="d-flex align-items-center gap-3">
            <i class="bi bi-exclamation-octagon-fill fs-3 text-danger"></i>
            <div>
              <strong class="d-block">Attention: {{ inventoryService.lowStockProducts().length }} product(s) have reached critically low stock!</strong>
              <small class="text-danger-emphasis">These items are at or below their designated minimum reorder levels. Review them and initiate purchase orders.</small>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-danger px-3" (click)="filterStockStatus = 'low'">
            Filter Low Stock Items
          </button>
        </div>
      }

      <!-- Search & Filters -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search by product name, SKU ID, or category..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>

          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="selectedCategory">
              <option value="">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="filterStockStatus">
              <option value="all">All Inventory</option>
              <option value="low">Low Stock Only</option>
              <option value="ok">Adequate Stock</option>
            </select>
          </div>

          <div class="col-md-2 text-md-end text-muted small">
            <span>Showing: <strong>{{ filteredProducts.length }}</strong> of {{ inventoryService.getAll().length }}</span>
          </div>
        </div>
      </div>

      <!-- Products Data Table -->
      <div class="card card-enterprise">
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>SKU ID</th>
                <th>Product Name & Description</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>In Stock</th>
                <th>Min Level</th>
                <th>Status</th>
                <th>Supplier</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of filteredProducts; track prod.id) {
                <tr [class.table-warning]="prod.stockQuantity <= prod.minStockLevel">
                  <td>
                    <span class="badge bg-light text-primary border border-primary-subtle fw-bold">
                      {{ prod.productId }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold text-dark">{{ prod.productName }}</div>
                    <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">{{ prod.description }}</small>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                      {{ prod.category }}
                    </span>
                  </td>
                  <td class="fw-bold text-dark">₹{{ prod.unitPrice | number:'1.0-0' }}</td>
                  <td>
                    <span class="fw-bold fs-6" [class.text-danger]="prod.stockQuantity <= prod.minStockLevel" [class.text-success]="prod.stockQuantity > prod.minStockLevel">
                      {{ prod.stockQuantity }}
                    </span>
                    <small class="text-muted ms-1">{{ prod.unitOfMeasure || 'Units' }}</small>
                  </td>
                  <td class="text-secondary fw-semibold">{{ prod.minStockLevel }}</td>
                  <td>
                    @if (prod.stockQuantity <= prod.minStockLevel) {
                      <span class="badge-custom badge-danger-custom">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock
                      </span>
                    } @else {
                      <span class="badge-custom badge-success-custom">
                        <i class="bi bi-check-circle-fill me-1"></i> In Stock
                      </span>
                    }
                  </td>
                  <td class="text-secondary small">{{ prod.supplierName }}</td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-success" 
                        title="Adjust Stock"
                        (click)="openAdjustStockModal(prod)">
                        <i class="bi bi-plus-slash-minus"></i>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-primary" 
                        title="Edit Product"
                        (click)="openEditModal(prod)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-danger" 
                        title="Delete Product"
                        (click)="confirmDelete(prod)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center py-5 text-muted">
                    <i class="bi bi-box-seam fs-2 d-block mb-2 text-secondary"></i>
                    No products found matching the criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Product Modal -->
      @if (isModalOpen) {
        <div class="modal-backdrop-custom" (click)="closeModal()">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i [class]="isEditMode ? 'bi bi-pencil-square text-primary' : 'bi bi-box-seam text-primary'" class="me-2"></i>
                {{ isEditMode ? 'Edit Product Record' : 'Register New Catalog Product' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveProduct()">
              <div class="modal-body-custom">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label small fw-semibold text-secondary">Product Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentProduct.productName" name="productName" required placeholder="e.g. Dell UltraSharp 32-inch 4K Monitor">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Category *</label>
                    <select class="form-select" [(ngModel)]="currentProduct.category" name="category" required>
                      @for (cat of categories; track cat) {
                        <option [value]="cat">{{ cat }}</option>
                      }
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Product Description</label>
                    <textarea class="form-control" [(ngModel)]="currentProduct.description" name="description" rows="2" placeholder="Technical specifications, model number, details..."></textarea>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Unit Price (INR ₹) *</label>
                    <input type="number" class="form-control" [(ngModel)]="currentProduct.unitPrice" name="unitPrice" required min="1" placeholder="e.g. 45000">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Initial Stock Quantity *</label>
                    <input type="number" class="form-control" [(ngModel)]="currentProduct.stockQuantity" name="stockQuantity" required min="0" placeholder="e.g. 25">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">Minimum Reorder Level *</label>
                    <input type="number" class="form-control" [(ngModel)]="currentProduct.minStockLevel" name="minStockLevel" required min="1" placeholder="e.g. 10">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Supplier Partner *</label>
                    <select class="form-select" [(ngModel)]="currentProduct.supplierName" name="supplierName" required>
                      <option value="">-- Choose Supplier --</option>
                      @for (sup of supplierService.getAll(); track sup.id) {
                        <option [value]="sup.companyName">{{ sup.companyName }}</option>
                      }
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Unit of Measure</label>
                    <select class="form-select" [(ngModel)]="currentProduct.unitOfMeasure" name="unitOfMeasure">
                      <option value="Units">Units</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Box">Box</option>
                      <option value="Kg">Kg</option>
                      <option value="Meters">Meters</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary-custom">
                  {{ isEditMode ? 'Save Changes' : 'Register Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Adjust Stock Modal -->
      @if (selectedProductForAdjustment) {
        <div class="modal-backdrop-custom" (click)="selectedProductForAdjustment = null">
          <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-plus-slash-minus text-primary me-2"></i> Manual Stock Adjustment
              </h5>
              <button type="button" class="btn-close" (click)="selectedProductForAdjustment = null"></button>
            </div>
            <form (ngSubmit)="applyStockAdjustment()">
              <div class="modal-body-custom">
                <div class="p-3 bg-light rounded border mb-3">
                  <div class="fw-bold text-dark">{{ selectedProductForAdjustment.productName }}</div>
                  <div class="small text-muted">SKU: {{ selectedProductForAdjustment.productId }} | Current Stock: <strong>{{ selectedProductForAdjustment.stockQuantity }}</strong></div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Adjustment Type</label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="adjType" id="adjAdd" [(ngModel)]="adjustmentType" value="add">
                    <label class="btn btn-outline-success" for="adjAdd"><i class="bi bi-plus-circle me-1"></i> Add Stock (+)</label>

                    <input type="radio" class="btn-check" name="adjType" id="adjSub" [(ngModel)]="adjustmentType" value="sub">
                    <label class="btn btn-outline-danger" for="adjSub"><i class="bi bi-dash-circle me-1"></i> Deduct Stock (-)</label>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Quantity to Adjust *</label>
                  <input type="number" class="form-control" [(ngModel)]="adjustmentQuantity" name="adjQty" required min="1" placeholder="e.g. 5">
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Adjustment Reason *</label>
                  <input type="text" class="form-control" [(ngModel)]="adjustmentReason" name="adjReason" required placeholder="e.g. Physical inventory count correction, damaged goods...">
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="selectedProductForAdjustment = null">Cancel</button>
                <button type="submit" class="btn btn-primary-custom">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Catalog Product"
        [message]="'Are you sure you want to delete product ' + (productToDelete?.productName || '') + ' (' + (productToDelete?.productId || '') + ')?'"
        confirmText="Yes, Delete Product"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class InventoryComponent {
  protected inventoryService = inject(InventoryService);
  protected supplierService = inject(SupplierService);

  searchTerm = '';
  selectedCategory = '';
  filterStockStatus = 'all';

  categories = [
    'Hardware',
    'Peripherals',
    'Networking',
    'Office Furniture',
    'Components',
    'Accessories',
    'Stationery'
  ];

  isModalOpen = false;
  isEditMode = false;
  editingId: string | null = null;

  currentProduct: Partial<Product> = {
    productName: '',
    category: 'Hardware',
    description: '',
    unitPrice: 1000,
    stockQuantity: 10,
    minStockLevel: 5,
    supplierName: '',
    unitOfMeasure: 'Units'
  };

  selectedProductForAdjustment: Product | null = null;
  adjustmentType: 'add' | 'sub' = 'add';
  adjustmentQuantity = 1;
  adjustmentReason = '';

  isDeleteModalOpen = false;
  productToDelete: Product | null = null;

  get totalStockUnits(): number {
    return this.inventoryService.getAll().reduce((acc, p) => acc + p.stockQuantity, 0);
  }

  get filteredProducts(): Product[] {
    return this.inventoryService.getAll().filter(p => {
      const matchSearch = !this.searchTerm ||
        p.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.productId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCat = !this.selectedCategory || p.category === this.selectedCategory;

      let matchStock = true;
      if (this.filterStockStatus === 'low') {
        matchStock = p.stockQuantity <= p.minStockLevel;
      } else if (this.filterStockStatus === 'ok') {
        matchStock = p.stockQuantity > p.minStockLevel;
      }

      return matchSearch && matchCat && matchStock;
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.currentProduct = {
      productName: '',
      category: 'Hardware',
      description: '',
      unitPrice: 1000,
      stockQuantity: 10,
      minStockLevel: 5,
      supplierName: this.supplierService.getAll()[0]?.companyName || '',
      unitOfMeasure: 'Units'
    };
    this.isModalOpen = true;
  }

  openEditModal(prod: Product): void {
    this.isEditMode = true;
    this.editingId = prod.id;
    this.currentProduct = { ...prod };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveProduct(): void {
    if (!this.currentProduct.productName) return;

    if (this.isEditMode && this.editingId) {
      this.inventoryService.update(this.editingId, this.currentProduct);
    } else {
      this.inventoryService.create({
        productName: this.currentProduct.productName!,
        category: this.currentProduct.category || 'Hardware',
        description: this.currentProduct.description || '',
        unitPrice: Number(this.currentProduct.unitPrice) || 0,
        stockQuantity: Number(this.currentProduct.stockQuantity) || 0,
        minStockLevel: Number(this.currentProduct.minStockLevel) || 5,
        supplierName: this.currentProduct.supplierName || 'General Supplier',
        unitOfMeasure: this.currentProduct.unitOfMeasure || 'Units'
      });
    }

    this.closeModal();
  }

  openAdjustStockModal(prod: Product): void {
    this.selectedProductForAdjustment = prod;
    this.adjustmentType = 'add';
    this.adjustmentQuantity = 1;
    this.adjustmentReason = 'Warehouse reconciliation';
  }

  applyStockAdjustment(): void {
    if (!this.selectedProductForAdjustment || this.adjustmentQuantity <= 0) return;

    const delta = this.adjustmentType === 'add' ? this.adjustmentQuantity : -this.adjustmentQuantity;
    this.inventoryService.adjustStock(
      this.selectedProductForAdjustment.id,
      delta,
      this.adjustmentReason || 'Manual adjustment'
    );

    this.selectedProductForAdjustment = null;
  }

  confirmDelete(prod: Product): void {
    this.productToDelete = prod;
    this.isDeleteModalOpen = true;
  }

  executeDelete(): void {
    if (this.productToDelete) {
      this.inventoryService.delete(this.productToDelete.id);
      this.isDeleteModalOpen = false;
      this.productToDelete = null;
    }
  }
}
