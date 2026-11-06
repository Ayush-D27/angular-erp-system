# NexusERP – Enterprise Resource Planning System

## Project Overview

NexusERP is a web-based Enterprise Resource Planning (ERP) application developed using Angular. It is designed to simplify and centralize business operations by bringing multiple departments together on a single platform.

The application provides dedicated modules for employee management, attendance tracking, inventory management, supplier management, purchase orders, sales, finance, and business reporting.

It offers a responsive user interface, interactive dashboards, data management features, and role-based access to help users manage organizational activities efficiently.

## Key Features

### 1. Dashboard
- Displays an overview of important business statistics.
- Shows total employees, products, suppliers, sales orders, and purchases.
- Provides financial summaries, including revenue and expenses.
- Includes charts for income, inventory distribution, sales, and procurement.
- Provides quick access to frequently used operations.

### 2. Employee Management
- Add, update, view, and delete employee records.
- Maintain employee information such as name, email, department, and designation.
- Automatically generate unique employee IDs.
- Search employees and filter records by department.

### 3. Attendance Management
- Record daily employee attendance.
- Manage attendance statuses such as Present, Absent, Half Day, and On Leave.
- Prevent duplicate attendance entries for the same employee on the same date.
- View attendance summaries and workforce statistics.

### 4. Inventory Management
- Add, update, and manage product information.
- Maintain product codes, categories, prices, and stock quantities.
- Monitor available stock levels.
- Display low-stock alerts when products fall below their reorder levels.
- Perform manual stock adjustments.

### 5. Supplier Management
- Maintain supplier and vendor information.
- Store company details, contact information, and GSTIN.
- Manage supplier categories and payment terms.
- View and maintain supplier records.

### 6. Purchase Management
- Create and manage purchase orders.
- Select suppliers and products for purchase.
- Calculate order totals, GST, and additional charges.
- Update inventory automatically when purchase orders are marked as received.
- Maintain purchase transaction records.

### 7. Sales Management
- Create and manage customer sales orders.
- Check product availability before creating orders.
- Update inventory when sales orders are completed.
- Generate printable sales invoices.
- Track order and payment statuses.

### 8. Finance Management
- Maintain income and expense records.
- Track financial transactions and payment methods.
- Calculate total revenue, expenses, and net profit.
- View financial summaries through the dashboard.

### 9. Reports and Analytics
- Generate reports for different business departments.
- View employee, attendance, inventory, supplier, purchase, sales, and finance records.
- Filter reports using dates and search keywords.
- Export reports in CSV format for further analysis.

### 10. Settings and Administration
- Manage organization information and preferences.
- Support different user roles, including Admin, HR Manager, Inventory Manager, and Finance Manager.
- Provide role-based access to application modules.
- Reset demonstration data to its initial state.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend Framework | Angular |
| Programming Language | TypeScript |
| Web Technologies | HTML5, CSS3 |
| CSS Framework | Bootstrap 5 |
| Icons | Bootstrap Icons |
| Charts | HTML5 Canvas |
| Routing | Angular Router |
| Data Storage | Browser LocalStorage |
| Development Tools | Visual Studio Code, Angular CLI |
| Version Control | Git and GitHub |

## Application Architecture

The application follows Angular's standalone component architecture. Its code is organized into separate folders to maintain modularity and make the project easier to understand and maintain.

- **Core:** Contains application services, data models, and route guards.
- **Features:** Contains individual business modules such as Dashboard, Employees, Attendance, Inventory, Suppliers, Purchases, Sales, Finance, Reports, and Settings.
- **Layout:** Contains the main application layout, navigation bar, and sidebar.
- **Shared:** Contains reusable components such as confirmation modals, page headers, statistic cards, and toast notifications.

## Installation and Setup

Follow these steps to run the project on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm
- Angular CLI (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/Ayush-D27/angular-erp-system.git
```

### 2. Navigate to the Project Directory

```bash
cd angular-erp-system
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm start
```

Alternatively, use:

```bash
npx ng serve
```

### 5. Open the Application

Open your browser and visit:

```text
http://localhost:4200/
```

## Project Directory Structure

```text
erp-system/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── models/
│   │   │   └── services/
│   │   │
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── inventory/
│   │   │   ├── suppliers/
│   │   │   ├── purchases/
│   │   │   ├── sales/
│   │   │   ├── finance/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── layout/
│   │   ├── shared/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   │
│   ├── index.html
│   ├── main.ts
│   └── styles.css
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Data Management

NexusERP uses browser LocalStorage through a centralized storage service to maintain application data. This allows records to remain available in the browser between sessions without requiring a separate database server.

## Future Enhancements

- Integration with a backend API and database.
- Secure authentication and authorization.
- Cloud-based data storage.
- Advanced analytics and reporting.
- Automated notifications and business alerts.

## Team Members

| Sr. No. | Name |
|---|---|
| 1 | Ayush Deore |
| 2 | Vedant Aadmane |
| 3 | Hrushil Sonawane |
| 4 | Yuvraj Gaikwad |

## Repository

GitHub: https://github.com/Ayush-D27/angular-erp-system

---

**Developed as an academic project at Sanjivani University, Department of Computer Science and Engineering.**