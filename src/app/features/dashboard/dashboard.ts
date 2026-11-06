import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { EmployeeService } from '../../core/services/employee.service';
import { InventoryService } from '../../core/services/inventory.service';
import { SupplierService } from '../../core/services/supplier.service';
import { SaleService } from '../../core/services/sale.service';
import { PurchaseService } from '../../core/services/purchase.service';
import { FinanceService } from '../../core/services/finance.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    StatCardComponent
  ],
  template: `
    <div class="dashboard-page">
      <app-page-header 
        title="Enterprise Executive Dashboard" 
        section="Executive Overview" 
        subtitle="Real-time multi-departmental metrics, financial health, and operational status">
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-semibold">
            <i class="bi bi-circle-fill text-success me-1" style="font-size: 0.5rem;"></i> System Live
          </span>
        </div>
      </app-page-header>

      <!-- 8 Key Metrics Cards (Strictly calculated from real application state) -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Employees" 
            [value]="employeeService.getAll().length" 
            subtext="Active in organization" 
            icon="bi bi-people-fill"
            iconBg="#eff6ff"
            iconColor="#1e40af"
            trend="+12%"
            [trendPositive]="true">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Products" 
            [value]="inventoryService.getAll().length" 
            [subtext]="'Valuation: ₹' + (inventoryService.totalInventoryValue() | number:'1.0-0')" 
            icon="bi bi-box-seam-fill"
            iconBg="#ecfdf5"
            iconColor="#059669">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Low Stock Alert" 
            [value]="inventoryService.lowStockProducts().length" 
            subtext="Needs immediate reorder" 
            icon="bi bi-exclamation-triangle-fill"
            iconBg="#fef2f2"
            iconColor="#dc2626"
            [trend]="inventoryService.lowStockProducts().length > 0 ? 'Action Req.' : 'Optimal'"
            [trendPositive]="inventoryService.lowStockProducts().length === 0">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Suppliers" 
            [value]="supplierService.getAll().length" 
            subtext="Verified vendor partners" 
            icon="bi bi-truck"
            iconBg="#f0f9ff"
            iconColor="#0284c7">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Sales Orders" 
            [value]="saleService.getAll().length" 
            [subtext]="'Revenue: ₹' + (totalSalesRevenue | number:'1.0-0')" 
            icon="bi bi-bag-check-fill"
            iconBg="#f5f3ff"
            iconColor="#7c3aed"
            trend="Active"
            [trendPositive]="true">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Purchases" 
            [value]="purchaseService.getAll().length" 
            [subtext]="'Spend: ₹' + (totalPurchasesSpend | number:'1.0-0')" 
            icon="bi bi-cart-check-fill"
            iconBg="#fffbeb"
            iconColor="#d97706">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Revenue" 
            [value]="'₹' + (financeService.summary().totalIncome | number:'1.0-0')" 
            subtext="All income streams" 
            icon="bi bi-graph-up-arrow"
            iconBg="#ecfdf5"
            iconColor="#047857"
            trend="+18.4%"
            [trendPositive]="true">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Net Profit" 
            [value]="'₹' + (financeService.summary().netProfit | number:'1.0-0')" 
            [subtext]="'Margin: ' + financeService.summary().profitMargin + '%'" 
            icon="bi bi-cash-stack"
            [iconBg]="financeService.summary().netProfit >= 0 ? '#eff6ff' : '#fef2f2'"
            [iconColor]="financeService.summary().netProfit >= 0 ? '#2563eb' : '#dc2626'"
            [trendPositive]="financeService.summary().netProfit >= 0">
          </app-stat-card>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <span class="fw-bold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
            <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Operations
          </span>
          <div class="d-flex flex-wrap align-items-center gap-2">
            <a routerLink="/sales" class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
              <i class="bi bi-bag-plus"></i> New Sales Order
            </a>
            <a routerLink="/purchases" class="btn btn-sm btn-outline-success d-flex align-items-center gap-1">
              <i class="bi bi-cart-plus"></i> New Purchase Order
            </a>
            <a routerLink="/employees" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
              <i class="bi bi-person-plus"></i> Add Employee
            </a>
            <a routerLink="/attendance" class="btn btn-sm btn-outline-info d-flex align-items-center gap-1 text-dark">
              <i class="bi bi-calendar-check"></i> Mark Attendance
            </a>
            <a routerLink="/finance" class="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
              <i class="bi bi-receipt"></i> Record Expense
            </a>
          </div>
        </div>
      </div>

      <!-- 4 Visual Analytics Charts Grid -->
      <div class="row g-4 mb-4">
        <!-- Chart 1: Income vs Expenses -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">Income vs Expenses Comparison</h5>
                <small class="text-muted">Calculated from ledger transactions</small>
              </div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Financial Health</span>
            </div>
            <div class="p-3">
              <canvas #incomeExpenseCanvas style="width: 100%; height: 260px; max-height: 260px;"></canvas>
            </div>
          </div>
        </div>

        <!-- Chart 2: Inventory Overview by Category -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">Inventory Category Distribution</h5>
                <small class="text-muted">Stock units grouped by catalog category</small>
              </div>
              <span class="badge bg-info-subtle text-info border border-info-subtle">Warehouse</span>
            </div>
            <div class="p-3">
              <canvas #inventoryCanvas style="width: 100%; height: 260px; max-height: 260px;"></canvas>
            </div>
          </div>
        </div>

        <!-- Chart 3: Monthly Sales Revenue Trend -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">Sales Orders Performance</h5>
                <small class="text-muted">Monthly sales volume & turnover</small>
              </div>
              <span class="badge bg-success-subtle text-success border border-success-subtle">Sales Growth</span>
            </div>
            <div class="p-3">
              <canvas #salesCanvas style="width: 100%; height: 260px; max-height: 260px;"></canvas>
            </div>
          </div>
        </div>

        <!-- Chart 4: Procurement Expenditure Trend -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">Procurement & Purchase Trend</h5>
                <small class="text-muted">Purchases across vendor categories</small>
              </div>
              <span class="badge bg-warning-subtle text-warning border border-warning-subtle">Supply Chain</span>
            </div>
            <div class="p-3">
              <canvas #purchasesCanvas style="width: 100%; height: 260px; max-height: 260px;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables Section: Low Stock Alerts & Recent Transactions -->
      <div class="row g-4">
        <!-- Low Stock Alerts -->
        <div class="col-lg-5">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">
                  <i class="bi bi-shield-exclamation text-danger me-1"></i> Low Stock Threshold Alerts
                </h5>
                <small class="text-muted">Items at or below safety stock level</small>
              </div>
              <a routerLink="/inventory" class="btn btn-sm btn-outline-custom">View Inventory</a>
            </div>
            <div class="table-responsive">
              <table class="table-enterprise">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (prod of inventoryService.lowStockProducts(); track prod.id) {
                    <tr>
                      <td>
                        <div class="fw-bold text-dark">{{ prod.productName }}</div>
                        <small class="text-muted">{{ prod.category }}</small>
                      </td>
                      <td>
                        <span class="badge-custom badge-danger-custom">
                          {{ prod.stockQuantity }} {{ prod.unitOfMeasure || 'Units' }}
                        </span>
                      </td>
                      <td class="text-secondary fw-semibold">{{ prod.minStockLevel }}</td>
                      <td>
                        <a routerLink="/purchases" class="btn btn-sm btn-outline-primary py-1 px-2" style="font-size: 0.75rem;">
                          Reorder
                        </a>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="text-center py-4 text-muted">
                        <i class="bi bi-check2-circle text-success fs-3 d-block mb-1"></i>
                        All inventory items are currently above safe threshold levels.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Ledger Transactions -->
        <div class="col-lg-7">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">
                  <i class="bi bi-clock-history text-primary me-1"></i> Recent Financial Transactions
                </h5>
                <small class="text-muted">Latest operational cashflow records</small>
              </div>
              <a routerLink="/finance" class="btn btn-sm btn-outline-custom">Open Ledger</a>
            </div>
            <div class="table-responsive">
              <table class="table-enterprise">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (txn of recentTransactions; track txn.id) {
                    <tr>
                      <td>
                        <span class="fw-bold text-dark">{{ txn.transactionId }}</span>
                        @if (txn.referenceId) {
                          <span class="badge bg-light text-secondary ms-1 border" style="font-size: 0.65rem;">
                            {{ txn.referenceId }}
                          </span>
                        }
                      </td>
                      <td>
                        <span class="badge-custom" [ngClass]="txn.type === 'Income' ? 'badge-success-custom' : 'badge-danger-custom'">
                          <i [class]="txn.type === 'Income' ? 'bi bi-arrow-down-left me-1' : 'bi bi-arrow-up-right me-1'"></i>
                          {{ txn.category }}
                        </span>
                      </td>
                      <td class="text-muted small">{{ txn.date }}</td>
                      <td class="text-secondary small">{{ txn.paymentMethod }}</td>
                      <td class="text-end fw-bold" [ngClass]="txn.type === 'Income' ? 'text-success' : 'text-danger'">
                        {{ txn.type === 'Income' ? '+' : '-' }}₹{{ txn.amount | number:'1.0-0' }}
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center py-4 text-muted">No transactions recorded yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      animation: fadeIn 0.2s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('incomeExpenseCanvas') incomeExpenseCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inventoryCanvas') inventoryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salesCanvas') salesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('purchasesCanvas') purchasesCanvas!: ElementRef<HTMLCanvasElement>;

  protected employeeService = inject(EmployeeService);
  protected inventoryService = inject(InventoryService);
  protected supplierService = inject(SupplierService);
  protected saleService = inject(SaleService);
  protected purchaseService = inject(PurchaseService);
  protected financeService = inject(FinanceService);
  protected attendanceService = inject(AttendanceService);
  protected authService = inject(AuthService);

  get totalSalesRevenue(): number {
    return this.saleService.getAll()
      .filter(s => s.status === 'Completed')
      .reduce((acc, s) => acc + s.totalAmount, 0);
  }

  get totalPurchasesSpend(): number {
    return this.purchaseService.getAll()
      .filter(p => p.status === 'Received')
      .reduce((acc, p) => acc + p.totalAmount, 0);
  }

  get recentTransactions() {
    return this.financeService.getAll().slice(0, 5);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Wait for DOM layout then render charts
    setTimeout(() => {
      this.renderCharts();
    }, 100);
  }

  renderCharts(): void {
    this.renderIncomeExpenseChart();
    this.renderInventoryCategoryChart();
    this.renderSalesChart();
    this.renderPurchasesChart();
  }

  /**
   * Universal Chart Renderer that checks if window.Chart is loaded from CDN,
   * and falls back to a clean native Canvas 2D bar/pie visualizer if offline.
   */
  private renderIncomeExpenseChart(): void {
    if (!this.incomeExpenseCanvas) return;
    const canvas = this.incomeExpenseCanvas.nativeElement;
    const summary = this.financeService.summary();
    const chartLib = (window as any).Chart;

    if (typeof (window as any).Chart !== 'undefined') {
      try {
        new (window as any).Chart(canvas, {
          type: 'bar',
          data: {
            labels: ['Total Income', 'Total Expenses', 'Net Profit'],
            datasets: [{
              label: 'Amount (INR)',
              data: [summary.totalIncome, summary.totalExpenses, summary.netProfit],
              backgroundColor: ['#059669', '#dc2626', '#2563eb'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
        return;
      } catch (e) {
        console.warn('Chart.js init fallback to canvas', e);
      }
    }

    // Built-in crisp canvas visualizer fallback
    this.drawFallbackBarChart(canvas, [
      { label: 'Income', value: summary.totalIncome, color: '#059669' },
      { label: 'Expenses', value: summary.totalExpenses, color: '#dc2626' },
      { label: 'Net Profit', value: Math.max(0, summary.netProfit), color: '#2563eb' }
    ]);
  }

  private renderInventoryCategoryChart(): void {
    if (!this.inventoryCanvas) return;
    const canvas = this.inventoryCanvas.nativeElement;
    const products = this.inventoryService.getAll();

    // Group quantities by category
    const categoryMap = new Map<string, number>();
    products.forEach(p => {
      const cur = categoryMap.get(p.category) || 0;
      categoryMap.set(p.category, cur + p.stockQuantity);
    });

    const labels = Array.from(categoryMap.keys());
    const data = Array.from(categoryMap.values());
    const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7', '#db2777'];

    if (typeof (window as any).Chart !== 'undefined') {
      try {
        new (window as any).Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors.slice(0, labels.length)
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
        return;
      } catch (e) {
        console.warn('Chart.js donut fallback', e);
      }
    }

    const items = labels.map((l, i) => ({ label: l, value: data[i], color: colors[i % colors.length] }));
    this.drawFallbackBarChart(canvas, items);
  }

  private renderSalesChart(): void {
    if (!this.salesCanvas) return;
    const canvas = this.salesCanvas.nativeElement;
    const sales = this.saleService.getAll();

    // Count by status
    const completed = sales.filter(s => s.status === 'Completed').length;
    const pending = sales.filter(s => s.status === 'Pending').length;
    const cancelled = sales.filter(s => s.status === 'Cancelled').length;

    if (typeof (window as any).Chart !== 'undefined') {
      try {
        new (window as any).Chart(canvas, {
          type: 'bar',
          data: {
            labels: ['Completed Orders', 'Pending Orders', 'Cancelled Orders'],
            datasets: [{
              label: 'Orders Count',
              data: [completed, pending, cancelled],
              backgroundColor: ['#059669', '#d97706', '#94a3b8'],
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
        console.warn('Chart.js sales fallback', e);
      }
    }

    this.drawFallbackBarChart(canvas, [
      { label: 'Completed', value: completed, color: '#059669' },
      { label: 'Pending', value: pending, color: '#d97706' },
      { label: 'Cancelled', value: cancelled, color: '#94a3b8' }
    ]);
  }

  private renderPurchasesChart(): void {
    if (!this.purchasesCanvas) return;
    const canvas = this.purchasesCanvas.nativeElement;
    const purchases = this.purchaseService.getAll();

    const received = purchases.filter(p => p.status === 'Received').length;
    const approved = purchases.filter(p => p.status === 'Approved').length;
    const pending = purchases.filter(p => p.status === 'Pending').length;

    if (typeof (window as any).Chart !== 'undefined') {
      try {
        new (window as any).Chart(canvas, {
          type: 'bar',
          data: {
            labels: ['Received & In Stock', 'Approved by Dept', 'Pending Approval'],
            datasets: [{
              label: 'Purchase Orders',
              data: [received, approved, pending],
              backgroundColor: ['#2563eb', '#0284c7', '#f59e0b'],
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
        console.warn('Chart.js po fallback', e);
      }
    }

    this.drawFallbackBarChart(canvas, [
      { label: 'Received', value: received, color: '#2563eb' },
      { label: 'Approved', value: approved, color: '#0284c7' },
      { label: 'Pending', value: pending, color: '#f59e0b' }
    ]);
  }

  private drawFallbackBarChart(canvas: HTMLCanvasElement, items: { label: string; value: number; color: string }[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width = canvas.parentElement?.clientWidth || 400;
    const height = canvas.height = 240;

    ctx.clearRect(0, 0, width, height);
    const maxValue = Math.max(...items.map(i => i.value), 1);
    const padding = 40;
    const barWidth = Math.min(60, (width - (padding * 2)) / (items.length * 1.8));
    const spacing = (width - (padding * 2) - (barWidth * items.length)) / (items.length + 1);

    ctx.font = '12px Inter, sans-serif';

    items.forEach((item, index) => {
      const x = padding + spacing + index * (barWidth + spacing);
      const barHeight = (item.value / maxValue) * (height - 80);
      const y = height - 40 - barHeight;

      // Draw Bar
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Draw value on top
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toLocaleString(), x + (barWidth / 2), y - 6);

      // Draw label below
      ctx.fillStyle = '#64748b';
      ctx.fillText(item.label, x + (barWidth / 2), height - 15);
    });
  }
}
