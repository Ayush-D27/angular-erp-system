export type UserRole = 'Admin' | 'HR Manager' | 'Inventory Manager' | 'Finance Manager';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  phone?: string;
  lastLogin?: string;
}

export interface AppSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  enableNotifications: boolean;
  lowStockThreshold: number;
}
