import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { User, UserRole, AppSettings } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public userRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(
    private storage: StorageService,
    private router: Router,
    private notification: NotificationService
  ) {
    const savedUser = this.storage.getItem<User | null>('currentUser', null);
    if (savedUser) {
      this.currentUserSignal.set(savedUser);
    }
  }

  getUsers(): User[] {
    return this.storage.getItem<User[]>('users', []);
  }

  getSettings(): AppSettings {
    return this.storage.getItem<AppSettings>('settings', {
      companyName: 'Nexus Enterprise Technologies Ltd.',
      companyEmail: 'contact@nexus-erp.global',
      companyPhone: '+1 (800) 555-0199',
      companyAddress: 'Suite 450, Innovation Park, CA',
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'YYYY-MM-DD',
      enableNotifications: true,
      lowStockThreshold: 15
    });
  }

  updateSettings(settings: AppSettings): void {
    this.storage.setItem('settings', settings);
    this.notification.success('Settings Saved', 'System configurations updated successfully.');
  }

  login(email: string, role?: UserRole): boolean {
    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user && role) {
      user = users.find(u => u.role === role);
    }

    if (!user) {
      // Allow fallback if user types an email with matching role
      if (email.includes('admin')) {
        user = users.find(u => u.role === 'Admin');
      } else if (email.includes('hr')) {
        user = users.find(u => u.role === 'HR Manager');
      } else if (email.includes('inv')) {
        user = users.find(u => u.role === 'Inventory Manager');
      } else if (email.includes('fin')) {
        user = users.find(u => u.role === 'Finance Manager');
      }
    }

    if (user) {
      user.lastLogin = new Date().toISOString();
      this.currentUserSignal.set(user);
      this.storage.setItem('currentUser', user);
      this.notification.success('Welcome back', `Signed in as ${user.fullName} (${user.role})`);
      this.router.navigate(['/dashboard']);
      return true;
    }

    this.notification.error('Login Failed', 'Invalid credentials. Please select one of the demonstration roles.');
    return false;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.storage.removeItem('currentUser');
    this.notification.info('Signed Out', 'You have been safely signed out.');
    this.router.navigate(['/login']);
  }

  updateProfile(updatedData: Partial<User>): void {
    const current = this.currentUserSignal();
    if (!current) return;

    const updatedUser: User = { ...current, ...updatedData };
    this.currentUserSignal.set(updatedUser);
    this.storage.setItem('currentUser', updatedUser);

    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.storage.setItem('users', users);
    this.notification.success('Profile Updated', 'Your profile details have been saved.');
  }

  canAccess(moduleName: string): boolean {
    const role = this.userRole();
    if (!role) return false;
    if (role === 'Admin') return true; // Admin has full access

    switch (moduleName) {
      case 'dashboard':
        return true;
      case 'employees':
      case 'attendance':
        return role === 'HR Manager';
      case 'inventory':
      case 'suppliers':
        return role === 'Inventory Manager';
      case 'purchases':
        return role === 'Inventory Manager' || role === 'Finance Manager';
      case 'sales':
      case 'finance':
        return role === 'Finance Manager';
      case 'reports':
      case 'settings':
        return true; // All managers can view reports & settings
      default:
        return true;
    }
  }
}
