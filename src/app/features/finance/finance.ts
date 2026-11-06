import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { FinanceService } from '../../core/services/finance.service';
import { FinanceTransaction, TransactionType, PaymentMethod } from '../../core/models/finance.model';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="finance-page">
      <app-page-header 
        title="Finance, Cashflow & General Ledger" 
        section="Accounting" 
        subtitle="Double-entry operational ledger, income streams, expenditures, and net profitability statement"
        actionButtonText="Log New Transaction"
        actionIcon="bi bi-receipt"
        (actionClicked)="openAddModal()">
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Inflows (Revenue)" 
            [value]="'₹' + (financeService.summary().totalIncome | number:'1.0-0')" 
            subtext="Sales & operational earnings" 
            icon="bi bi-arrow-down-left-circle-fill"
            iconBg="#ecfdf5"
            iconColor="#059669"
            trend="+24.8%"
            [trendPositive]="true">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Outflows (Spend)" 
            [value]="'₹' + (financeService.summary().totalExpenses | number:'1.0-0')" 
            subtext="Procurement, payroll, rent" 
            icon="bi bi-arrow-up-right-circle-fill"
            iconBg="#fef2f2"
            iconColor="#dc2626"
            trend="Monitored"
            [trendPositive]="false">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Net Profit (P&L)" 
            [value]="'₹' + (financeService.summary().netProfit | number:'1.0-0')" 
            [subtext]="'Net Operating Margin: ' + financeService.summary().profitMargin + '%'" 
            icon="bi bi-wallet2"
            [iconBg]="financeService.summary().netProfit >= 0 ? '#eff6ff' : '#fef2f2'"
            [iconColor]="financeService.summary().netProfit >= 0 ? '#1e40af' : '#dc2626'"
            [trendPositive]="financeService.summary().netProfit >= 0">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Ledger Records" 
            [value]="financeService.summary().transactionCount" 
            subtext="Audited journal vouchers" 
            icon="bi bi-journal-text"
            iconBg="#f5f3ff"
            iconColor="#7c3aed">
          </app-stat-card>
        </div>
      </div>

      <!-- Financial Chart & Cashflow Breakdown -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">Operating Cashflow Trend</h5>
                <small class="text-muted">Total income vs operational expenditures</small>
              </div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Audit Trail</span>
            </div>
            <div class="p-3">
              <canvas #financeCanvas style="width: 100%; height: 260px; max-height: 260px;"></canvas>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card card-enterprise h-100 p-3">
            <h6 class="fw-bold text-dark mb-3">Accounting Balance Summary</h6>
            
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Sales Orders Revenue:</span>
              <span class="fw-bold text-success">+₹{{ salesRevenueSum | number:'1.0-0' }}</span>
            </div>

            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Direct Service Incomes:</span>
              <span class="fw-bold text-success">+₹{{ otherIncomeSum | number:'1.0-0' }}</span>
            </div>

            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Inventory PO Purchases:</span>
              <span class="fw-bold text-danger">-₹{{ inventorySpendSum | number:'1.0-0' }}</span>
            </div>

            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Payroll & Operations:</span>
              <span class="fw-bold text-danger">-₹{{ operationalSpendSum | number:'1.0-0' }}</span>
            </div>

            <div class="mt-auto pt-3 bg-light p-3 rounded border">
              <div class="d-flex justify-content-between fw-bold text-dark fs-6">
                <span>Net Surplus / Profit:</span>
                <span [class.text-success]="financeService.summary().netProfit >= 0" [class.text-danger]="financeService.summary().netProfit < 0">
                  ₹{{ financeService.summary().netProfit | number:'1.0-0' }}
                </span>
              </div>
              <small class="text-muted d-block mt-1">Formula: Net Profit = Total Income - Total Expenses</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search description, reference ID, category..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>

          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="selectedType">
              <option value="">All Types</option>
              <option value="Income">Income (+)</option>
              <option value="Expense">Expense (-)</option>
            </select>
          </div>

          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="selectedCategory">
              <option value="">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <div class="col-md-3 text-md-end text-muted small">
            <span>Showing: <strong>{{ filteredTransactions.length }}</strong> of {{ financeService.getAll().length }} records</span>
          </div>
        </div>
      </div>

      <!-- General Ledger Table -->
      <div class="card card-enterprise">
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th class="text-end">Amount</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (txn of filteredTransactions; track txn.id) {
                <tr>
                  <td>
                    <span class="badge bg-light text-primary border border-primary-subtle fw-bold">
                      {{ txn.transactionId }}
                    </span>
                    @if (txn.referenceId) {
                      <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle ms-1" style="font-size: 0.65rem;">
                        {{ txn.referenceId }}
                      </span>
                    }
                  </td>
                  <td>
                    <span class="badge-custom" [ngClass]="txn.type === 'Income' ? 'badge-success-custom' : 'badge-danger-custom'">
                      <i [class]="txn.type === 'Income' ? 'bi bi-arrow-down-left me-1' : 'bi bi-arrow-up-right me-1'"></i>
                      {{ txn.type }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-semibold text-dark">{{ txn.category }}</span>
                  </td>
                  <td class="text-secondary small">{{ txn.description }}</td>
                  <td class="text-muted small">{{ txn.date }}</td>
                  <td>
                    <span class="badge bg-light text-dark border small">{{ txn.paymentMethod }}</span>
                  </td>
                  <td class="text-end fw-bold" [ngClass]="txn.type === 'Income' ? 'text-success' : 'text-danger'">
                    {{ txn.type === 'Income' ? '+' : '-' }}₹{{ txn.amount | number:'1.0-0' }}
                  </td>
                  <td class="text-end">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-custom text-danger" 
                      title="Delete Voucher"
                      (click)="confirmDelete(txn)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-journal-x fs-2 d-block mb-2 text-secondary"></i>
                    No financial ledger entries match filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Transaction Modal -->
      @if (isModalOpen) {
        <div class="modal-backdrop-custom" (click)="isModalOpen = false">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-receipt text-primary me-2"></i> Log Financial Voucher Entry
              </h5>
              <button type="button" class="btn-close" (click)="isModalOpen = false"></button>
            </div>
            <form (ngSubmit)="saveTransaction()">
              <div class="modal-body-custom">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Entry Type *</label>
                    <div class="btn-group w-100" role="group">
                      <input type="radio" class="btn-check" name="txType" id="txIncome" [(ngModel)]="newTxn.type" value="Income">
                      <label class="btn btn-outline-success" for="txIncome"><i class="bi bi-arrow-down-left me-1"></i> Income (+)</label>

                      <input type="radio" class="btn-check" name="txType" id="txExpense" [(ngModel)]="newTxn.type" value="Expense">
                      <label class="btn btn-outline-danger" for="txExpense"><i class="bi bi-arrow-up-right me-1"></i> Expense (-)</label>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Amount (INR ₹) *</label>
                    <input type="number" class="form-control" [(ngModel)]="newTxn.amount" name="amount" required min="1" placeholder="e.g. 50000">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Category *</label>
                    <select class="form-select" [(ngModel)]="newTxn.category" name="category" required>
                      @for (cat of categories; track cat) {
                        <option [value]="cat">{{ cat }}</option>
                      }
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Payment Method *</label>
                    <select class="form-select" [(ngModel)]="newTxn.paymentMethod" name="paymentMethod" required>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                      <option value="UPI">UPI / Digital Wallet</option>
                      <option value="Credit Card">Corporate Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Transaction Date *</label>
                    <input type="date" class="form-control" [(ngModel)]="newTxn.date" name="date" required>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Reference ID / Invoice #</label>
                    <input type="text" class="form-control" [(ngModel)]="newTxn.referenceId" name="refId" placeholder="Optional PO-XXXX / SO-XXXX">
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Description / Remarks *</label>
                    <textarea class="form-control" [(ngModel)]="newTxn.description" name="description" rows="2" required placeholder="Detailed ledger description..."></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="isModalOpen = false">Cancel</button>
                <button type="submit" class="btn btn-primary-custom" [disabled]="!newTxn.amount || !newTxn.description">
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Ledger Transaction"
        [message]="'Are you sure you want to remove voucher ' + (txnToDelete?.transactionId || '') + ' (' + (txnToDelete?.description || '') + ')?'"
        confirmText="Yes, Delete Voucher"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `
})
export class FinanceComponent implements OnInit, AfterViewInit {
  @ViewChild('financeCanvas') financeCanvas!: ElementRef<HTMLCanvasElement>;

  protected financeService = inject(FinanceService);

  searchTerm = '';
  selectedType = '';
  selectedCategory = '';

  categories = [
    'Sales Revenue',
    'Inventory Purchase',
    'Payroll',
    'Office Rent & Facilities',
    'Utilities & Cloud Infra',
    'Consulting & Services',
    'Technical Support Contracts',
    'Marketing & Advertising',
    'Legal & Professional Fees',
    'Miscellaneous Expense'
  ];

  isModalOpen = false;
  isDeleteModalOpen = false;
  txnToDelete: FinanceTransaction | null = null;

  newTxn = {
    type: 'Expense' as TransactionType,
    category: 'Utilities & Cloud Infra',
    amount: 15000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    description: '',
    referenceId: ''
  };

  get salesRevenueSum(): number {
    return this.financeService.getAll()
      .filter(t => t.type === 'Income' && t.category === 'Sales Revenue')
      .reduce((acc, t) => acc + t.amount, 0);
  }

  get otherIncomeSum(): number {
    return this.financeService.getAll()
      .filter(t => t.type === 'Income' && t.category !== 'Sales Revenue')
      .reduce((acc, t) => acc + t.amount, 0);
  }

  get inventorySpendSum(): number {
    return this.financeService.getAll()
      .filter(t => t.type === 'Expense' && t.category === 'Inventory Purchase')
      .reduce((acc, t) => acc + t.amount, 0);
  }

  get operationalSpendSum(): number {
    return this.financeService.getAll()
      .filter(t => t.type === 'Expense' && t.category !== 'Inventory Purchase')
      .reduce((acc, t) => acc + t.amount, 0);
  }

  get filteredTransactions(): FinanceTransaction[] {
    return this.financeService.getAll().filter(t => {
      const matchSearch = !this.searchTerm ||
        t.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (t.referenceId && t.referenceId.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchType = !this.selectedType || t.type === this.selectedType;
      const matchCat = !this.selectedCategory || t.category === this.selectedCategory;

      return matchSearch && matchType && matchCat;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderFinanceChart();
    }, 100);
  }

  renderFinanceChart(): void {
    if (!this.financeCanvas) return;
    const canvas = this.financeCanvas.nativeElement;
    const summary = this.financeService.summary();

    if (typeof (window as any).Chart !== 'undefined') {
      try {
        new (window as any).Chart(canvas, {
          type: 'bar',
          data: {
            labels: ['Total Revenue / Inflows', 'Total Expenditures', 'Net Operating Profit'],
            datasets: [{
              label: 'Amount (INR ₹)',
              data: [summary.totalIncome, summary.totalExpenses, summary.netProfit],
              backgroundColor: ['#059669', '#dc2626', '#2563eb'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
        return;
      } catch (e) {
        console.warn('Finance Chart fallback', e);
      }
    }

    // Canvas fallback
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width = canvas.parentElement?.clientWidth || 400;
    const height = canvas.height = 240;
    ctx.clearRect(0, 0, width, height);

    const items = [
      { label: 'Income', value: summary.totalIncome, color: '#059669' },
      { label: 'Expenses', value: summary.totalExpenses, color: '#dc2626' },
      { label: 'Net Profit', value: Math.max(0, summary.netProfit), color: '#2563eb' }
    ];

    const maxValue = Math.max(...items.map(i => i.value), 1);
    const padding = 50;
    const barWidth = 70;
    const spacing = (width - (padding * 2) - (barWidth * items.length)) / (items.length + 1);

    ctx.font = '12px Inter, sans-serif';
    items.forEach((item, index) => {
      const x = padding + spacing + index * (barWidth + spacing);
      const barHeight = (item.value / maxValue) * (height - 80);
      const y = height - 40 - barHeight;

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText('₹' + Math.round(item.value / 1000) + 'k', x + (barWidth / 2), y - 6);

      ctx.fillStyle = '#64748b';
      ctx.fillText(item.label, x + (barWidth / 2), height - 15);
    });
  }

  openAddModal(): void {
    this.newTxn = {
      type: 'Expense',
      category: 'Utilities & Cloud Infra',
      amount: 15000,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      description: '',
      referenceId: ''
    };
    this.isModalOpen = true;
  }

  saveTransaction(): void {
    if (!this.newTxn.amount || !this.newTxn.description) return;

    this.financeService.addTransaction({
      type: this.newTxn.type,
      category: this.newTxn.category,
      amount: Number(this.newTxn.amount) || 0,
      date: this.newTxn.date,
      paymentMethod: this.newTxn.paymentMethod,
      description: this.newTxn.description,
      referenceId: this.newTxn.referenceId || undefined
    });

    this.isModalOpen = false;
    setTimeout(() => this.renderFinanceChart(), 100);
  }

  confirmDelete(txn: FinanceTransaction): void {
    this.txnToDelete = txn;
    this.isDeleteModalOpen = true;
  }

  executeDelete(): void {
    if (this.txnToDelete) {
      this.financeService.deleteTransaction(this.txnToDelete.id);
      this.isDeleteModalOpen = false;
      this.txnToDelete = null;
      setTimeout(() => this.renderFinanceChart(), 100);
    }
  }
}
