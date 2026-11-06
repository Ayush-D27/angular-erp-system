import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { EmployeesComponent } from './features/employees/employees';
import { AttendanceComponent } from './features/attendance/attendance';
import { InventoryComponent } from './features/inventory/inventory';
import { SuppliersComponent } from './features/suppliers/suppliers';
import { PurchasesComponent } from './features/purchases/purchases';
import { SalesComponent } from './features/sales/sales';
import { FinanceComponent } from './features/finance/finance';
import { ReportsComponent } from './features/reports/reports';
import { SettingsComponent } from './features/settings/settings';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'sales', component: SalesComponent },
      { path: 'finance', component: FinanceComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
