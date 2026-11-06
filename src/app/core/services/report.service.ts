import { Injectable } from '@angular/core';
import { EmployeeService } from './employee.service';
import { AttendanceService } from './attendance.service';
import { InventoryService } from './inventory.service';
import { SupplierService } from './supplier.service';
import { PurchaseService } from './purchase.service';
import { SaleService } from './sale.service';
import { FinanceService } from './finance.service';
import { NotificationService } from './notification.service';

export interface ReportItem {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private saleService: SaleService,
    private financeService: FinanceService,
    private notification: NotificationService
  ) {}

  getEmployeeReport(): { headers: string[]; rows: any[] } {
    const list = this.employeeService.getAll();
    const headers = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Email', 'Phone', 'Joining Date', 'Salary (INR)', 'Status'];
    const rows = list.map(e => [
      e.employeeId,
      e.fullName,
      e.department,
      e.designation,
      e.email,
      e.phone,
      e.joiningDate,
      e.salary,
      e.employmentStatus
    ]);
    return { headers, rows };
  }

  getAttendanceReport(startDate?: string, endDate?: string): { headers: string[]; rows: any[] } {
    let list = this.attendanceService.getAll();
    if (startDate) list = list.filter(a => a.date >= startDate);
    if (endDate) list = list.filter(a => a.date <= endDate);

    const headers = ['Record ID', 'Employee ID', 'Employee Name', 'Department', 'Date', 'Status', 'Check In', 'Check Out', 'Notes'];
    const rows = list.map(a => [
      a.id,
      a.employeeId,
      a.employeeName,
      a.department,
      a.date,
      a.status,
      a.checkInTime || '-',
      a.checkOutTime || '-',
      a.notes || ''
    ]);
    return { headers, rows };
  }

  getInventoryReport(): { headers: string[]; rows: any[] } {
    const list = this.inventoryService.getAll();
    const headers = ['Product ID', 'Product Name', 'Category', 'Unit Price (INR)', 'Stock Quantity', 'Min Level', 'Stock Status', 'Total Value (INR)', 'Supplier'];
    const rows = list.map(p => [
      p.productId,
      p.productName,
      p.category,
      p.unitPrice,
      p.stockQuantity,
      p.minStockLevel,
      p.stockQuantity <= p.minStockLevel ? 'LOW STOCK' : 'IN STOCK',
      p.stockQuantity * p.unitPrice,
      p.supplierName
    ]);
    return { headers, rows };
  }

  getLowStockReport(): { headers: string[]; rows: any[] } {
    const list = this.inventoryService.lowStockProducts();
    const headers = ['Product ID', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Deficit', 'Supplier'];
    const rows = list.map(p => [
      p.productId,
      p.productName,
      p.category,
      p.stockQuantity,
      p.minStockLevel,
      Math.max(0, p.minStockLevel - p.stockQuantity),
      p.supplierName
    ]);
    return { headers, rows };
  }

  getSupplierReport(): { headers: string[]; rows: any[] } {
    const list = this.supplierService.getAll();
    const headers = ['Supplier ID', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Supplied Products', 'Payment Terms'];
    const rows = list.map(s => [
      s.supplierId,
      s.companyName,
      s.supplierName,
      s.email,
      s.phone,
      s.suppliedProducts.join('; '),
      s.paymentTerms || 'Net 30'
    ]);
    return { headers, rows };
  }

  getPurchaseReport(startDate?: string, endDate?: string): { headers: string[]; rows: any[] } {
    let list = this.purchaseService.getAll();
    if (startDate) list = list.filter(p => p.orderDate >= startDate);
    if (endDate) list = list.filter(p => p.orderDate <= endDate);

    const headers = ['PO ID', 'Supplier', 'Items Count', 'Subtotal (INR)', 'Tax (INR)', 'Total (INR)', 'Status', 'Order Date', 'Received Date', 'Stock Updated'];
    const rows = list.map(p => [
      p.purchaseId,
      p.supplierName,
      p.items.length,
      p.subtotal,
      p.taxAmount,
      p.totalAmount,
      p.status,
      p.orderDate,
      p.receivedDate || '-',
      p.stockUpdated ? 'Yes' : 'No'
    ]);
    return { headers, rows };
  }

  getSalesReport(startDate?: string, endDate?: string): { headers: string[]; rows: any[] } {
    let list = this.saleService.getAll();
    if (startDate) list = list.filter(s => s.orderDate >= startDate);
    if (endDate) list = list.filter(s => s.orderDate <= endDate);

    const headers = ['Sale ID', 'Customer Name', 'Items Count', 'Subtotal (INR)', 'Discount', 'Total (INR)', 'Status', 'Payment Method', 'Order Date', 'Completed Date'];
    const rows = list.map(s => [
      s.saleId,
      s.customer.name,
      s.items.length,
      s.subtotal,
      s.discountAmount,
      s.totalAmount,
      s.status,
      s.paymentMethod,
      s.orderDate,
      s.completedDate || '-'
    ]);
    return { headers, rows };
  }

  getFinanceReport(startDate?: string, endDate?: string): { headers: string[]; rows: any[] } {
    let list = this.financeService.getAll();
    if (startDate) list = list.filter(t => t.date >= startDate);
    if (endDate) list = list.filter(t => t.date <= endDate);

    const headers = ['Transaction ID', 'Type', 'Category', 'Amount (INR)', 'Date', 'Payment Method', 'Description', 'Reference ID'];
    const rows = list.map(t => [
      t.transactionId,
      t.type,
      t.category,
      t.amount,
      t.date,
      t.paymentMethod,
      `"${t.description.replace(/"/g, '""')}"`,
      t.referenceId || '-'
    ]);
    return { headers, rows };
  }

  exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
    try {
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          }).join(',')
        )
      ].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.notification.success('Export Successful', `Downloaded ${filename}.csv with ${rows.length} records.`);
    } catch (e) {
      console.error('CSV export failed', e);
      this.notification.error('Export Error', 'Failed to generate CSV file.');
    }
  }
}
