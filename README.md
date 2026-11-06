# NexusERP - Enterprise Resource Planning (ERP) System

A fully functional, modern, responsive Enterprise Resource Planning (ERP) web application developed with **Angular** using a standalone component architecture, TypeScript, Bootstrap 5, Bootstrap Icons, and LocalStorage for persistent data storage.

This project was built for the **Front-End UI Design and Development (Angular)** college main project by a **4-member group**.

---

## 1. Key Features & Modules

The application consists of 10 fully implemented, production-quality functional modules:

1. **Executive Dashboard:**
   - 8 live KPI summary cards strictly calculated from application data (Total Employees, Total Products, Total Suppliers, Total Sales, Total Purchases, Total Revenue, Net Profit, Low Stock Alerts).
   - 4 interactive Canvas charts (Income vs Expenses, Inventory Category Distribution, Sales Order Breakdown, Procurement Spend).
   - Low stock threshold table with one-click reorder shortcut.
   - Recent operational ledger transactions feed.
   - Quick action shortcuts.

2. **Employee Management:**
   - Automated sequential ID generation (`EMP-1001`, `EMP-1002`, ...).
   - Full CRUD operations (Add, Edit, View Details, Delete with confirmation).
   - Multi-field search (name, ID, email, designation) and filtering by department and employment status.
   - Employee profile cards with salary, contact info, and joining dates.

3. **Attendance Management:**
   - Daily clock-in/out logging (Present, Absent, Half Day, On Leave).
   - **Duplicate Attendance Prevention:** Prevents registering multiple attendance records for the same employee on the same calendar date.
   - Real-time attendance rate calculation (`Total Present / Total Workforce * 100`).
   - Historical date filter and query table.

4. **Inventory & Warehouse Management:**
   - Automated SKU generation (`PRD-1001`, ...).
   - Warehouse stock quantity tracking, minimum reorder thresholds, and asset valuation.
   - Low-stock warning alert banners for critical inventory.
   - Manual stock adjustment modal with audit reason tracking and delta math.
   - CRUD operations and category filtering.

5. **Supplier Directory:**
   - Vendor records with contact details, GST/Tax IDs, payment terms (Net 15, Net 30, etc.).
   - Material categorization tags.
   - Add, edit, search, and delete suppliers.

6. **Purchase Orders & Procurement:**
   - Dynamic PO builder with supplier picker, multi-item line picker, automatic 18% GST calculation, shipping fees, and grand total.
   - Status pipeline: `Pending` -> `Approved` -> `Received` -> `Cancelled`.
   - **Crucial Inventory Integration:** When an order is marked `Received`, warehouse stock is automatically incremented and expense is logged to finance.
   - **Duplicate Stock Prevention:** Ensures stock cannot be incremented more than once for any received order.

7. **Sales Orders & Invoicing:**
   - Customer sales order generation with customer details, item selection, tax, and discount calculation.
   - **Real-Time Stock Availability Check:** Strictly prevents creating orders for quantities exceeding available warehouse stock.
   - **Single-Execution Stock Deduction:** When marked `Completed`, inventory quantities are automatically deducted and sales income is logged in the financial ledger.
   - Commercial printable tax invoice preview modal.

8. **Finance & General Ledger:**
   - Double-entry operating journal vouchers for both Income and Expenses.
   - Accurate P&L formula: `Net Profit = Total Income - Total Expenses`.
   - Automated voucher generation from received purchases (expense) and completed sales (income) without double-counting.
   - Interactive cashflow trend visualizer.

9. **Reports & Analytics:**
   - 8 comprehensive report views: Employees, Attendance, Inventory, Low Stock Exceptions, Suppliers, Purchases, Sales Orders, and Finance Ledger.
   - Real-time date range filters and cross-field query engine.
   - **Universal One-Click CSV Export:** Generates formatted `.csv` spreadsheet files for download.

10. **System Settings & User Profile:**
    - Profile editor for the active user.
    - Organization configuration (Company name, email, currency: ₹ INR / $ USD).
    - **One-Click Demo Data Reset:** Restores factory pristine seed data across all modules anytime during presentation.
    - Role-based access control simulation (Admin, HR Manager, Inventory Manager, Finance Manager).

---

## 2. Technology Stack

- **Framework:** Angular 21/22 (Standalone Components Architecture)
- **Language:** TypeScript 5.9+
- **Markup & Styling:** HTML5, CSS3, Bootstrap 5.3.3, Bootstrap Icons 1.11.3
- **State & Data Persistence:** Browser `localStorage` via central `StorageService`
- **Visualizations:** HTML5 Canvas & Chart.js compatible dynamic charts
- **Control Flow:** Modern Angular control syntax (`@if`, `@for`, `@empty`)

---

## 3. Demonstration Login Credentials

Quick one-click login buttons are provided on the login page, or use any of the credentials below:

| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@erp.com` | `admin123` | Full access across all 10 modules |
| **HR Manager** | `hr@erp.com` | `hr123` | Employees, Attendance, Reports, Settings |
| **Inventory Manager** | `inventory@erp.com` | `inv123` | Inventory, Suppliers, Purchases, Reports, Settings |
| **Finance Manager** | `finance@erp.com` | `fin123` | Sales Orders, Finance Ledger, Purchases, Reports, Settings |

---

## 4. How to Run the Application Locally

### Prerequisites
- Node.js (v18, v20, v22, or v26)
- npm (v9+)
- Angular CLI

### Steps to Start

1. Open a terminal and navigate to the project directory:
   ```bash
   cd "c:\Users\ayush\OneDrive\Desktop\CLASS PROJECT\erp-system"
   ```

2. Start the local Angular development server:
   ```bash
   npm start
   ```
   *Alternatively:*
   ```bash
   npx ng serve
   ```

3. Open your web browser and navigate to:
   ```
   http://localhost:4200/
   ```

4. Click on any of the **Demo Quick-Access Roles** (e.g. *Admin*) on the login screen to sign in instantly.

---

## 5. Project Directory Structure

```
erp-system/
├── public/                     # Static assets & favicon
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts           # Route protection guard
│   │   │   ├── models/
│   │   │   │   ├── attendance.model.ts     # Attendance data interfaces
│   │   │   │   ├── employee.model.ts       # Employee records model
│   │   │   │   ├── finance.model.ts        # Accounting ledger models
│   │   │   │   ├── inventory.model.ts      # Product SKU models
│   │   │   │   ├── notification.model.ts   # Toast alert models
│   │   │   │   ├── purchase.model.ts       # Purchase order models
│   │   │   │   ├── sale.model.ts           # Sales order models
│   │   │   │   ├── supplier.model.ts       # Vendor directory models
│   │   │   │   └── user.model.ts           # User & settings models
│   │   │   └── services/
│   │   │       ├── attendance.service.ts   # Attendance business logic
│   │   │       ├── auth.service.ts         # Authentication & RBAC
│   │   │       ├── employee.service.ts     # Employee CRUD & auto IDs
│   │   │       ├── finance.service.ts      # Ledger, P&L calculations
│   │   │       ├── inventory.service.ts    # Stock checks & valuation
│   │   │       ├── notification.service.ts # Global toast emitter
│   │   │       ├── purchase.service.ts     # PO logic & stock sync
│   │   │       ├── report.service.ts       # Analytics & CSV exporter
│   │   │       ├── sale.service.ts         # Sales fulfillment & stock check
│   │   │       ├── storage.service.ts      # LocalStorage & factory seed
│   │   │       └── supplier.service.ts     # Vendor registry service
│   │   ├── features/
│   │   │   ├── attendance/                 # Module 3: Attendance tracker
│   │   │   ├── auth/                       # Demonstration login screen
│   │   │   ├── dashboard/                  # Module 1: Executive KPI dashboard
│   │   │   ├── employees/                  # Module 2: Employee directory
│   │   │   ├── finance/                    # Module 8: Cashflow & ledger
│   │   │   ├── inventory/                  # Module 4: Warehouse stock
│   │   │   ├── purchases/                  # Module 6: Procurement orders
│   │   │   ├── reports/                    # Module 9: Reports & CSV downloads
│   │   │   ├── sales/                      # Module 7: Commercial orders & invoicing
│   │   │   ├── settings/                   # Module 10: Settings & data reset
│   │   │   └── suppliers/                  # Module 5: Supplier directory
│   │   ├── layout/
│   │   │   ├── main-layout/                # Master layout container
│   │   │   ├── navbar/                     # Top bar with clock & notifications
│   │   │   └── sidebar/                    # 10-module responsive sidebar
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── confirm-modal/          # Reusable confirmation dialog
│   │   │       ├── page-header/            # Breadcrumb & title headers
│   │   │       ├── stat-card/              # Reusable KPI metric card
│   │   │       └── toast-container/        # Floating toast notifications
│   │   ├── app.config.ts                   # Application configuration & routing
│   │   ├── app.routes.ts                   # Full Angular route hierarchy
│   │   ├── app.ts                          # Root component
│   │   ├── app.html                        # Router outlet
│   │   └── app.css                         # Root styles
│   ├── index.html                          # HTML shell (Bootstrap 5, Icons, Chart.js)
│   ├── main.ts                             # Angular bootstrap entrypoint
│   └── styles.css                          # Enterprise design tokens & CSS rules
├── angular.json                            # Angular CLI workspace config
├── CONTRIBUTIONS.md                        # 4-Member student responsibility matrix
├── package.json                            # Dependencies & npm scripts
└── README.md                               # Project documentation
```

---

## 6. Academic Contributions

See `CONTRIBUTIONS.md` for the 4-member group breakdown and customizable viva presentation details.
