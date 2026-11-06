import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ReportService } from '../../core/services/report.service';

export type ReportType = 'employees' | 'attendance' | 'inventory' | 'lowstock' | 'suppliers' | 'purchases' | 'sales' | 'finance';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent
  ],
  template: `
    <div class="reports-page">
      <app-page-header 
        title="Reports, Business Intelligence & Exports" 
        section="Analytics & Compliance" 
        subtitle="Generate audit-ready analytical summaries, inspect departmental data tables, and export standard CSV data files"
        actionButtonText="Export to CSV"
        actionIcon="bi bi-file-earmark-spreadsheet-fill"
        (actionClicked)="exportCurrentReport()">
      </app-page-header>

      <!-- Report Type Selector Tabs -->
      <div class="card card-enterprise p-2 mb-4">
        <ul class="nav nav-pills nav-fill flex-column flex-sm-row gap-1">
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'employees'" 
              (click)="selectReport('employees')">
              <i class="bi bi-people me-1"></i> Employees
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'attendance'" 
              (click)="selectReport('attendance')">
              <i class="bi bi-calendar-check me-1"></i> Attendance
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'inventory'" 
              (click)="selectReport('inventory')">
              <i class="bi bi-box-seam me-1"></i> Inventory
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'lowstock'" 
              (click)="selectReport('lowstock')">
              <i class="bi bi-exclamation-triangle me-1"></i> Low Stock
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'suppliers'" 
              (click)="selectReport('suppliers')">
              <i class="bi bi-truck me-1"></i> Suppliers
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'purchases'" 
              (click)="selectReport('purchases')">
              <i class="bi bi-cart-check me-1"></i> Purchases
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'sales'" 
              (click)="selectReport('sales')">
              <i class="bi bi-bag-check me-1"></i> Sales Orders
            </button>
          </li>
          <li class="nav-item">
            <button 
              type="button" 
              class="nav-link py-2 px-3 small fw-semibold" 
              [class.active]="selectedReport === 'finance'" 
              (click)="selectReport('finance')">
              <i class="bi bi-cash-stack me-1"></i> Finance P&L
            </button>
          </li>
        </ul>
      </div>

      <!-- Filters Toolbar -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search across all fields..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>

          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text bg-light"><small class="text-muted">From</small></span>
              <input type="date" class="form-control" [(ngModel)]="startDate" (change)="refreshData()">
            </div>
          </div>

          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text bg-light"><small class="text-muted">To</small></span>
              <input type="date" class="form-control" [(ngModel)]="endDate" (change)="refreshData()">
            </div>
          </div>

          <div class="col-md-2 text-md-end">
            <button type="button" class="btn btn-outline-custom w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-clockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Live Data Table Preview -->
      <div class="card card-enterprise">
        <div class="card-header-enterprise">
          <div>
            <h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">
              <i class="bi bi-table text-primary me-2"></i> {{ reportTitle }}
            </h5>
            <small class="text-muted">Displaying {{ filteredRows.length }} rows matching criteria</small>
          </div>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="exportCurrentReport()">
            <i class="bi bi-download me-1"></i> Download .CSV
          </button>
        </div>
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                @for (header of currentReportData.headers; track header) {
                  <th>{{ header }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of filteredRows; track $index) {
                <tr>
                  @for (cell of row; track $index) {
                    <td>{{ cell }}</td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td [attr.colspan]="currentReportData.headers.length || 1" class="text-center py-5 text-muted">
                    <i class="bi bi-file-earmark-x fs-2 d-block mb-2 text-secondary"></i>
                    No data records found for selected period and search terms.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
  private reportService = inject(ReportService);

  selectedReport: ReportType = 'employees';
  searchTerm = '';
  startDate = '';
  endDate = '';

  currentReportData: { headers: string[]; rows: any[] } = { headers: [], rows: [] };

  constructor() {
    this.refreshData();
  }

  get reportTitle(): string {
    switch (this.selectedReport) {
      case 'employees': return 'Employee Master Record Report';
      case 'attendance': return 'Staff Attendance & Workshift History';
      case 'inventory': return 'Warehouse Product Inventory & Asset Valuation';
      case 'lowstock': return 'Low Stock Reorder Exceptions Report';
      case 'suppliers': return 'Approved Vendor Directory & Material Sourcing';
      case 'purchases': return 'Procurement Orders & Spend Statement';
      case 'sales': return 'Sales Turnover & Commercial Order Fulfillment';
      case 'finance': return 'Financial General Ledger & Cashflow Vouchers';
    }
  }

  selectReport(type: ReportType): void {
    this.selectedReport = type;
    this.refreshData();
  }

  refreshData(): void {
    switch (this.selectedReport) {
      case 'employees':
        this.currentReportData = this.reportService.getEmployeeReport();
        break;
      case 'attendance':
        this.currentReportData = this.reportService.getAttendanceReport(this.startDate, this.endDate);
        break;
      case 'inventory':
        this.currentReportData = this.reportService.getInventoryReport();
        break;
      case 'lowstock':
        this.currentReportData = this.reportService.getLowStockReport();
        break;
      case 'suppliers':
        this.currentReportData = this.reportService.getSupplierReport();
        break;
      case 'purchases':
        this.currentReportData = this.reportService.getPurchaseReport(this.startDate, this.endDate);
        break;
      case 'sales':
        this.currentReportData = this.reportService.getSalesReport(this.startDate, this.endDate);
        break;
      case 'finance':
        this.currentReportData = this.reportService.getFinanceReport(this.startDate, this.endDate);
        break;
    }
  }

  get filteredRows(): any[] {
    if (!this.searchTerm) return this.currentReportData.rows;
    const term = this.searchTerm.toLowerCase();
    return this.currentReportData.rows.filter(row =>
      row.some((cell: any) => String(cell).toLowerCase().includes(term))
    );
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.refreshData();
  }

  exportCurrentReport(): void {
    this.reportService.exportToCsv(
      this.selectedReport + '_report',
      this.currentReportData.headers,
      this.filteredRows
    );
  }
}
