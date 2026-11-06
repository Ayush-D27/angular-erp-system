import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { AttendanceRecord } from '../models/attendance.model';
import { Product } from '../models/inventory.model';
import { Supplier } from '../models/supplier.model';
import { PurchaseOrder } from '../models/purchase.model';
import { SalesOrder } from '../models/sale.model';
import { FinanceTransaction } from '../models/finance.model';
import { User, AppSettings } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_PREFIX = 'erp_nexus_';

  constructor() {
    this.initializeDemoDataIfEmpty();
  }

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (data === null || data === undefined) {
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading key ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving key ${key} to localStorage`, e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + key);
    } catch (e) {
      console.error(`Error removing key ${key} from localStorage`, e);
    }
  }

  initializeDemoDataIfEmpty(): void {
    const initialized = localStorage.getItem(this.STORAGE_PREFIX + 'initialized');
    if (!initialized) {
      this.resetToDemoData();
    }
  }

  resetToDemoData(): void {
    const today = new Date().toISOString().split('T')[0];

    // 1. Initial Users
    const users: User[] = [
      {
        id: 'usr-1',
        username: 'admin',
        fullName: 'Dr. Sarah Jenkins',
        email: 'admin@erp.com',
        role: 'Admin',
        department: 'Executive Administration',
        phone: '+1 (555) 019-2834',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-2',
        username: 'hr_manager',
        fullName: 'Marcus Vance',
        email: 'hr@erp.com',
        role: 'HR Manager',
        department: 'Human Resources',
        phone: '+1 (555) 018-9921',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-3',
        username: 'inv_manager',
        fullName: 'Elena Rostova',
        email: 'inventory@erp.com',
        role: 'Inventory Manager',
        department: 'Logistics & Supply',
        phone: '+1 (555) 014-4412',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-4',
        username: 'fin_manager',
        fullName: 'Devon Patel',
        email: 'finance@erp.com',
        role: 'Finance Manager',
        department: 'Finance & Accounts',
        phone: '+1 (555) 012-7788',
        lastLogin: new Date().toISOString()
      }
    ];

    // 2. Settings
    const settings: AppSettings = {
      companyName: 'Nexus Enterprise Technologies Ltd.',
      companyEmail: 'contact@nexus-erp.global',
      companyPhone: '+1 (800) 555-0199',
      companyAddress: 'Suite 450, Innovation Park, Silicon Boulevard, CA',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'YYYY-MM-DD',
      enableNotifications: true,
      lowStockThreshold: 15
    };

    // 3. Employees
    const employees: Employee[] = [
      {
        id: 'emp-1',
        employeeId: 'EMP-1001',
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@nexus-erp.global',
        phone: '+91 98765 43210',
        department: 'Engineering',
        designation: 'Principal Solutions Architect',
        joiningDate: '2023-01-15',
        salary: 145000,
        employmentStatus: 'Active',
        address: 'B-402 Marvel Towers, Bangalore'
      },
      {
        id: 'emp-2',
        employeeId: 'EMP-1002',
        fullName: 'Priya Iyer',
        email: 'priya.iyer@nexus-erp.global',
        phone: '+91 98234 56789',
        department: 'Finance',
        designation: 'Senior Financial Analyst',
        joiningDate: '2023-03-01',
        salary: 95000,
        employmentStatus: 'Active',
        address: 'Flat 12, Sunrise Residency, Pune'
      },
      {
        id: 'emp-3',
        employeeId: 'EMP-1003',
        fullName: 'Rohan Mehra',
        email: 'rohan.mehra@nexus-erp.global',
        phone: '+91 98450 12345',
        department: 'Sales',
        designation: 'Enterprise Account Executive',
        joiningDate: '2023-05-10',
        salary: 85000,
        employmentStatus: 'Active',
        address: 'Sector 44, Gurgaon'
      },
      {
        id: 'emp-4',
        employeeId: 'EMP-1004',
        fullName: 'Ananya Deshmukh',
        email: 'ananya.d@nexus-erp.global',
        phone: '+91 99112 33445',
        department: 'Human Resources',
        designation: 'Talent Acquisition Lead',
        joiningDate: '2023-07-20',
        salary: 75000,
        employmentStatus: 'Active',
        address: 'Kothrud, Pune'
      },
      {
        id: 'emp-5',
        employeeId: 'EMP-1005',
        fullName: 'Vikramaditya Roy',
        email: 'vikram.roy@nexus-erp.global',
        phone: '+91 97890 65432',
        department: 'Operations & Logistics',
        designation: 'Supply Chain Operations Head',
        joiningDate: '2023-08-14',
        salary: 110000,
        employmentStatus: 'Active',
        address: 'Salt Lake Sector 5, Kolkata'
      },
      {
        id: 'emp-6',
        employeeId: 'EMP-1006',
        fullName: 'Neha Kapoor',
        email: 'neha.kapoor@nexus-erp.global',
        phone: '+91 98100 45678',
        department: 'Engineering',
        designation: 'Full Stack Tech Lead',
        joiningDate: '2023-11-01',
        salary: 120000,
        employmentStatus: 'Active',
        address: 'Indiranagar, Bangalore'
      },
      {
        id: 'emp-7',
        employeeId: 'EMP-1007',
        fullName: 'Karthik Raja',
        email: 'karthik.raja@nexus-erp.global',
        phone: '+91 94440 98765',
        department: 'Sales',
        designation: 'Regional Sales Manager',
        joiningDate: '2024-02-15',
        salary: 90000,
        employmentStatus: 'Active',
        address: 'T. Nagar, Chennai'
      },
      {
        id: 'emp-8',
        employeeId: 'EMP-1008',
        fullName: 'Sneha Kulkarni',
        email: 'sneha.k@nexus-erp.global',
        phone: '+91 98670 11223',
        department: 'Finance',
        designation: 'Accounts & Audit Officer',
        joiningDate: '2024-04-10',
        salary: 65000,
        employmentStatus: 'On Leave',
        address: 'Thane West, Mumbai'
      }
    ];

    // 4. Attendance
    const attendance: AttendanceRecord[] = [
      { id: 'att-1', employeeId: 'EMP-1001', employeeName: 'Aarav Sharma', department: 'Engineering', date: today, status: 'Present', checkInTime: '09:05', checkOutTime: '18:10', createdAt: today },
      { id: 'att-2', employeeId: 'EMP-1002', employeeName: 'Priya Iyer', department: 'Finance', date: today, status: 'Present', checkInTime: '08:55', checkOutTime: '18:00', createdAt: today },
      { id: 'att-3', employeeId: 'EMP-1003', employeeName: 'Rohan Mehra', department: 'Sales', date: today, status: 'Present', checkInTime: '09:20', checkOutTime: '18:30', createdAt: today },
      { id: 'att-4', employeeId: 'EMP-1004', employeeName: 'Ananya Deshmukh', department: 'Human Resources', date: today, status: 'Present', checkInTime: '09:00', checkOutTime: '17:45', createdAt: today },
      { id: 'att-5', employeeId: 'EMP-1005', employeeName: 'Vikramaditya Roy', department: 'Operations & Logistics', date: today, status: 'Present', checkInTime: '08:45', checkOutTime: '18:15', createdAt: today },
      { id: 'att-6', employeeId: 'EMP-1006', employeeName: 'Neha Kapoor', department: 'Engineering', date: today, status: 'Half Day', checkInTime: '09:30', checkOutTime: '14:00', notes: 'Dentist appointment', createdAt: today },
      { id: 'att-7', employeeId: 'EMP-1007', employeeName: 'Karthik Raja', department: 'Sales', date: today, status: 'Present', checkInTime: '09:10', checkOutTime: '18:05', createdAt: today },
      { id: 'att-8', employeeId: 'EMP-1008', employeeName: 'Sneha Kulkarni', department: 'Finance', date: today, status: 'On Leave', notes: 'Approved medical leave', createdAt: today }
    ];

    // 5. Suppliers
    const suppliers: Supplier[] = [
      {
        id: 'sup-1',
        supplierId: 'SUP-1001',
        supplierName: 'Apex Micro Systems',
        companyName: 'Apex Micro Systems Pvt Ltd',
        email: 'sales@apexmicro.in',
        phone: '+91 22 2847 9000',
        address: 'Plot 45, Electronics Zone, MIDC Navi Mumbai',
        suppliedProducts: ['Enterprise Laptops', 'Server Modules', 'SSD Storage', 'DDR5 RAM Modules'],
        taxNumber: 'GSTIN27AABCA1234D1Z5',
        paymentTerms: 'Net 30'
      },
      {
        id: 'sup-2',
        supplierId: 'SUP-1002',
        supplierName: 'CyberNet Peripherals',
        companyName: 'CyberNet Technologies India',
        email: 'b2b@cybernetperipherals.com',
        phone: '+91 80 4123 7890',
        address: 'Brigade Software Park, Banashankari, Bangalore',
        suppliedProducts: ['UltraWide Monitors', 'Ergonomic Keyboards', 'Wireless Mice', 'Webcams 4K'],
        taxNumber: 'GSTIN29AACCC5678B1Z2',
        paymentTerms: 'Net 15'
      },
      {
        id: 'sup-3',
        supplierId: 'SUP-1003',
        supplierName: 'Global Office Furnishings',
        companyName: 'Global Ergonomics Ltd',
        email: 'orders@globalfurnish.com',
        phone: '+91 11 4567 1122',
        address: 'Okhla Industrial Area Phase 3, New Delhi',
        suppliedProducts: ['Ergonomic Mesh Chairs', 'Motorized Standing Desks', 'Acoustic Partitions'],
        taxNumber: 'GSTIN07AABFG9012A1Z8',
        paymentTerms: 'Net 30'
      },
      {
        id: 'sup-4',
        supplierId: 'SUP-1004',
        supplierName: 'Optima Network Solutions',
        companyName: 'Optima Networks Infra Pvt Ltd',
        email: 'support@optimanets.com',
        phone: '+91 44 2250 8899',
        address: 'Guindy Industrial Estate, Chennai',
        suppliedProducts: ['Gigabit Managed Switches', 'Wi-Fi 6 Routers', 'Cat6A Patch Cables'],
        taxNumber: 'GSTIN33AADDO3456C1Z9',
        paymentTerms: 'Immediate'
      }
    ];

    // 6. Products (Inventory)
    const products: Product[] = [
      {
        id: 'prd-1',
        productId: 'PRD-1001',
        productName: 'ThinkStation Workstation Pro',
        category: 'Hardware',
        description: 'Intel Core i9, 64GB RAM, 2TB NVMe SSD Enterprise Workstation',
        unitPrice: 125000,
        stockQuantity: 24,
        minStockLevel: 10,
        supplierName: 'Apex Micro Systems',
        unitOfMeasure: 'Units'
      },
      {
        id: 'prd-2',
        productId: 'PRD-1002',
        productName: 'UltraSharp 34" Curved Monitor',
        category: 'Peripherals',
        description: 'WQHD 3440x1440 USB-C Hub Monitor with 90W Power Delivery',
        unitPrice: 58000,
        stockQuantity: 38,
        minStockLevel: 15,
        supplierName: 'CyberNet Peripherals',
        unitOfMeasure: 'Units'
      },
      {
        id: 'prd-3',
        productId: 'PRD-1003',
        productName: 'ErgoDynamic Mesh Task Chair',
        category: 'Office Furniture',
        description: 'High-back ergonomic lumbar support chair with 3D armrests',
        unitPrice: 16500,
        stockQuantity: 42,
        minStockLevel: 20,
        supplierName: 'Global Office Furnishings',
        unitOfMeasure: 'Pcs'
      },
      {
        id: 'prd-4',
        productId: 'PRD-1004',
        productName: 'Enterprise NVMe 2TB SSD',
        category: 'Components',
        description: 'PCIe 4.0 Read up to 7450 MB/s High Endurance Data Center Drive',
        unitPrice: 14500,
        stockQuantity: 8, // LOW STOCK ALERT! (8 <= 15)
        minStockLevel: 15,
        supplierName: 'Apex Micro Systems',
        unitOfMeasure: 'Units'
      },
      {
        id: 'prd-5',
        productId: 'PRD-1005',
        productName: 'Motorized Dual-Motor Standing Desk',
        category: 'Office Furniture',
        description: 'Electric height adjustable 160x80cm solid oak finish desk',
        unitPrice: 32000,
        stockQuantity: 6, // LOW STOCK ALERT! (6 <= 10)
        minStockLevel: 10,
        supplierName: 'Global Office Furnishings',
        unitOfMeasure: 'Units'
      },
      {
        id: 'prd-6',
        productId: 'PRD-1006',
        productName: '48-Port Gigabit PoE+ Managed Switch',
        category: 'Networking',
        description: 'Layer 3 Managed Switch with 4x 10G SFP+ Uplinks 370W PoE',
        unitPrice: 46000,
        stockQuantity: 19,
        minStockLevel: 8,
        supplierName: 'Optima Network Solutions',
        unitOfMeasure: 'Units'
      },
      {
        id: 'prd-7',
        productId: 'PRD-1007',
        productName: 'Wireless Mechanical Pro Keyboard',
        category: 'Peripherals',
        description: 'Hot-swappable tactile switches, multi-device Bluetooth & 2.4G',
        unitPrice: 7500,
        stockQuantity: 55,
        minStockLevel: 25,
        supplierName: 'CyberNet Peripherals',
        unitOfMeasure: 'Units'
      },
      {
        id: 'prd-8',
        productId: 'PRD-1008',
        productName: 'Wi-Fi 6 Enterprise Access Point',
        category: 'Networking',
        description: 'Tri-band AX5400 ceiling mount AP with Seamless Mesh Roaming',
        unitPrice: 18500,
        stockQuantity: 28,
        minStockLevel: 12,
        supplierName: 'Optima Network Solutions',
        unitOfMeasure: 'Units'
      }
    ];

    // 7. Purchases
    const purchases: PurchaseOrder[] = [
      {
        id: 'po-1',
        purchaseId: 'PO-1001',
        supplierId: 'sup-1',
        supplierName: 'Apex Micro Systems',
        items: [
          { productId: 'prd-1', productName: 'ThinkStation Workstation Pro', quantity: 10, unitPrice: 105000, subtotal: 1050000 },
          { productId: 'prd-4', productName: 'Enterprise NVMe 2TB SSD', quantity: 20, unitPrice: 12000, subtotal: 240000 }
        ],
        subtotal: 1290000,
        taxAmount: 232200,
        shippingFee: 5000,
        totalAmount: 1527200,
        status: 'Received',
        orderDate: '2026-10-15',
        receivedDate: '2026-10-22',
        stockUpdated: true,
        financeRecorded: true,
        notes: 'Q4 Core Hardware procurement batch',
        createdAt: '2026-10-15'
      },
      {
        id: 'po-2',
        purchaseId: 'PO-1002',
        supplierId: 'sup-2',
        supplierName: 'CyberNet Peripherals',
        items: [
          { productId: 'prd-2', productName: 'UltraSharp 34" Curved Monitor', quantity: 15, unitPrice: 48000, subtotal: 720000 },
          { productId: 'prd-7', productName: 'Wireless Mechanical Pro Keyboard', quantity: 30, unitPrice: 5800, subtotal: 174000 }
        ],
        subtotal: 894000,
        taxAmount: 160920,
        shippingFee: 3500,
        totalAmount: 1058420,
        status: 'Received',
        orderDate: '2026-10-24',
        receivedDate: '2026-10-29',
        stockUpdated: true,
        financeRecorded: true,
        notes: 'Peripherals replenishment for workstations',
        createdAt: '2026-10-24'
      },
      {
        id: 'po-3',
        purchaseId: 'PO-1003',
        supplierId: 'sup-3',
        supplierName: 'Global Office Furnishings',
        items: [
          { productId: 'prd-3', productName: 'ErgoDynamic Mesh Task Chair', quantity: 20, unitPrice: 13000, subtotal: 260000 },
          { productId: 'prd-5', productName: 'Motorized Dual-Motor Standing Desk', quantity: 5, unitPrice: 25000, subtotal: 125000 }
        ],
        subtotal: 385000,
        taxAmount: 69300,
        shippingFee: 8000,
        totalAmount: 462300,
        status: 'Approved',
        orderDate: '2026-11-01',
        stockUpdated: false,
        financeRecorded: false,
        notes: 'Awaiting logistics dispatch confirmation',
        createdAt: '2026-11-01'
      }
    ];

    // 8. Sales Orders
    const sales: SalesOrder[] = [
      {
        id: 'so-1',
        saleId: 'SO-1001',
        customer: {
          name: 'TechVista Innovations Pvt Ltd',
          email: 'procurement@techvista.io',
          phone: '+91 99887 76655',
          address: 'Cyber City, Tower B, Hyderabad'
        },
        items: [
          { productId: 'prd-1', productName: 'ThinkStation Workstation Pro', quantity: 5, unitPrice: 125000, subtotal: 625000 },
          { productId: 'prd-2', productName: 'UltraSharp 34" Curved Monitor', quantity: 5, unitPrice: 58000, subtotal: 290000 }
        ],
        subtotal: 915000,
        taxAmount: 164700,
        discountAmount: 15000,
        totalAmount: 1064700,
        status: 'Completed',
        orderDate: '2026-10-20',
        completedDate: '2026-10-22',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Paid',
        stockDeducted: true,
        financeRecorded: true,
        notes: 'Corporate dev team setup package',
        createdAt: '2026-10-20'
      },
      {
        id: 'so-2',
        saleId: 'SO-1002',
        customer: {
          name: 'InfraCloud Software Solutions',
          email: 'admin@infracloud.co',
          phone: '+91 98712 34567',
          address: 'EON Free Zone, Kharadi, Pune'
        },
        items: [
          { productId: 'prd-6', productName: '48-Port Gigabit PoE+ Managed Switch', quantity: 2, unitPrice: 46000, subtotal: 92000 },
          { productId: 'prd-8', productName: 'Wi-Fi 6 Enterprise Access Point', quantity: 6, unitPrice: 18500, subtotal: 111000 }
        ],
        subtotal: 203000,
        taxAmount: 36540,
        discountAmount: 5000,
        totalAmount: 234540,
        status: 'Completed',
        orderDate: '2026-10-28',
        completedDate: '2026-10-29',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Paid',
        stockDeducted: true,
        financeRecorded: true,
        notes: 'Branch office network rollout',
        createdAt: '2026-10-28'
      },
      {
        id: 'so-3',
        saleId: 'SO-1003',
        customer: {
          name: 'Apex Analytics Corp',
          email: 'accounts@apexanalytics.com',
          phone: '+91 98111 22334',
          address: 'BKC, Mumbai'
        },
        items: [
          { productId: 'prd-3', productName: 'ErgoDynamic Mesh Task Chair', quantity: 8, unitPrice: 16500, subtotal: 132000 },
          { productId: 'prd-7', productName: 'Wireless Mechanical Pro Keyboard', quantity: 8, unitPrice: 7500, subtotal: 60000 }
        ],
        subtotal: 192000,
        taxAmount: 34560,
        discountAmount: 0,
        totalAmount: 226560,
        status: 'Pending',
        orderDate: '2026-11-02',
        paymentMethod: 'UPI',
        paymentStatus: 'Unpaid',
        stockDeducted: false,
        financeRecorded: false,
        notes: 'Awaiting client PO sign-off',
        createdAt: '2026-11-02'
      }
    ];

    // 9. Finance Transactions
    const finance: FinanceTransaction[] = [
      {
        id: 'txn-1',
        transactionId: 'TXN-1001',
        type: 'Expense',
        category: 'Inventory Purchase',
        amount: 1527200,
        date: '2026-10-22',
        paymentMethod: 'Bank Transfer',
        description: 'Payment for Purchase Order PO-1001 to Apex Micro Systems',
        referenceId: 'PO-1001',
        createdAt: '2026-10-22'
      },
      {
        id: 'txn-2',
        transactionId: 'TXN-1002',
        type: 'Income',
        category: 'Sales Revenue',
        amount: 1064700,
        date: '2026-10-22',
        paymentMethod: 'Bank Transfer',
        description: 'Received payment for Sales Order SO-1001 from TechVista Innovations',
        referenceId: 'SO-1001',
        createdAt: '2026-10-22'
      },
      {
        id: 'txn-3',
        transactionId: 'TXN-1003',
        type: 'Expense',
        category: 'Inventory Purchase',
        amount: 1058420,
        date: '2026-10-29',
        paymentMethod: 'Bank Transfer',
        description: 'Payment for Purchase Order PO-1002 to CyberNet Peripherals',
        referenceId: 'PO-1002',
        createdAt: '2026-10-29'
      },
      {
        id: 'txn-4',
        transactionId: 'TXN-1004',
        type: 'Income',
        category: 'Sales Revenue',
        amount: 234540,
        date: '2026-10-29',
        paymentMethod: 'Bank Transfer',
        description: 'Received payment for Sales Order SO-1002 from InfraCloud Solutions',
        referenceId: 'SO-1002',
        createdAt: '2026-10-29'
      },
      {
        id: 'txn-5',
        transactionId: 'TXN-1005',
        type: 'Income',
        category: 'Consulting & Services',
        amount: 850000,
        date: '2026-10-31',
        paymentMethod: 'Bank Transfer',
        description: 'Enterprise Cloud Architecture & ERP Customization Retainer Q3',
        createdAt: '2026-10-31'
      },
      {
        id: 'txn-6',
        transactionId: 'TXN-1006',
        type: 'Expense',
        category: 'Payroll',
        amount: 685000,
        date: '2026-10-31',
        paymentMethod: 'Bank Transfer',
        description: 'Monthly Employee Salaries Disbursal for October 2026',
        createdAt: '2026-10-31'
      },
      {
        id: 'txn-7',
        transactionId: 'TXN-1007',
        type: 'Expense',
        category: 'Office Rent & Facilities',
        amount: 120000,
        date: '2026-11-01',
        paymentMethod: 'Bank Transfer',
        description: 'Monthly Office Space Lease & Facility Charges',
        createdAt: '2026-11-01'
      },
      {
        id: 'txn-8',
        transactionId: 'TXN-1008',
        type: 'Expense',
        category: 'Utilities & Cloud Infra',
        amount: 45000,
        date: '2026-11-01',
        paymentMethod: 'Credit Card',
        description: 'AWS / Cloud Hosting Servers & High Speed Leased Line Fiber',
        createdAt: '2026-11-01'
      },
      {
        id: 'txn-9',
        transactionId: 'TXN-1009',
        type: 'Income',
        category: 'Technical Support Contracts',
        amount: 320000,
        date: '2026-11-02',
        paymentMethod: 'UPI',
        description: 'Annual Maintenance Support Contract for Matrix FinTech',
        createdAt: '2026-11-02'
      }
    ];

    // Commit all to localStorage
    this.setItem('users', users);
    this.setItem('currentUser', users[0]); // default to admin
    this.setItem('settings', settings);
    this.setItem('employees', employees);
    this.setItem('attendance', attendance);
    this.setItem('suppliers', suppliers);
    this.setItem('products', products);
    this.setItem('purchases', purchases);
    this.setItem('sales', sales);
    this.setItem('finance', finance);
    this.setItem('initialized', true);
  }
}
