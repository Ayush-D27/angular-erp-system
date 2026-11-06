import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  module: string;
  badge?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-wrapper" [class.mobile-open]="isOpen">
      <!-- Brand Logo -->
      <div class="sidebar-header">
        <div class="d-flex align-items-center gap-2">
          <div class="brand-icon">
            <i class="bi bi-boxes"></i>
          </div>
          <div>
            <div class="brand-title">NEXUS<span>ERP</span></div>
            <div class="brand-subtitle">Enterprise Suite v2.4</div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-link text-white d-lg-none p-0 ms-auto" (click)="closeSidebar.emit()">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <!-- User Role Pill -->
      <div class="sidebar-user-info">
        <div class="d-flex align-items-center gap-2">
          <div class="user-avatar-circle">
            {{ userInitial }}
          </div>
          <div class="overflow-hidden">
            <div class="user-name text-truncate">{{ authService.currentUser()?.fullName }}</div>
            <div class="user-role-badge">
              <span class="role-dot"></span>
              {{ authService.currentUser()?.role }}
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="sidebar-nav-container">
        <div class="nav-section-title">Core Management</div>
        <nav class="nav flex-column">
          @for (item of mainNavItems; track item.route) {
            @if (canAccess(item.module)) {
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                class="nav-link-custom"
                (click)="onNavClick()">
                <i [class]="item.icon"></i>
                <span>{{ item.label }}</span>
                @if (item.badge) {
                  <span class="nav-badge" [ngClass]="item.badgeClass || 'bg-primary'">{{ item.badge }}</span>
                }
              </a>
            }
          }
        </nav>

        <div class="nav-section-title mt-4">System & Config</div>
        <nav class="nav flex-column">
          @for (item of systemNavItems; track item.route) {
            @if (canAccess(item.module)) {
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                class="nav-link-custom"
                (click)="onNavClick()">
                <i [class]="item.icon"></i>
                <span>{{ item.label }}</span>
              </a>
            }
          }

          <button type="button" class="nav-link-custom logout-btn w-100 text-start border-0 bg-transparent mt-2" (click)="logout()">
            <i class="bi bi-box-arrow-right text-danger"></i>
            <span class="text-danger fw-semibold">Sign Out</span>
          </button>
        </nav>
      </div>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="footer-meta">
          <span>College Main Project</span>
          <span class="dot">•</span>
          <span>4-Member Team</span>
        </div>
      </div>
    </aside>

    @if (isOpen) {
      <div class="sidebar-backdrop d-lg-none" (click)="closeSidebar.emit()"></div>
    }
  `,
  styles: [`
    .sidebar-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background-color: var(--navy);
      color: #cbd5e1;
      display: flex;
      flex-direction: column;
      z-index: 1040;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 991.98px) {
      .sidebar-wrapper {
        transform: translateX(-100%);
      }
      .sidebar-wrapper.mobile-open {
        transform: translateX(0);
      }
    }

    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      z-index: 1030;
      backdrop-filter: blur(2px);
    }

    .sidebar-header {
      height: var(--navbar-height);
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.95);
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      line-height: 1;
    }

    .brand-title span {
      color: #60a5fa;
    }

    .brand-subtitle {
      font-size: 0.68rem;
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .sidebar-user-info {
      padding: 0.9rem 1.25rem;
      background: rgba(30, 41, 59, 0.7);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .user-avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #3b82f6;
      color: #ffffff;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .user-name {
      color: #f8fafc;
      font-weight: 600;
      font-size: 0.85rem;
      line-height: 1.2;
    }

    .user-role-badge {
      font-size: 0.72rem;
      color: #93c5fd;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 3px;
    }

    .role-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #10b981;
    }

    .sidebar-nav-container {
      padding: 1rem 0.85rem;
      overflow-y: auto;
      flex-grow: 1;
    }

    .nav-section-title {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 0 0.65rem 0.5rem;
    }

    .nav-link-custom {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
      margin-bottom: 2px;
      cursor: pointer;
    }

    .nav-link-custom i {
      font-size: 1.15rem;
      color: #64748b;
      transition: color 0.15s ease;
      width: 22px;
      text-align: center;
    }

    .nav-link-custom:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.06);
    }

    .nav-link-custom:hover i {
      color: #93c5fd;
    }

    .nav-link-custom.active {
      background: #1d4ed8;
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.35);
    }

    .nav-link-custom.active i {
      color: #ffffff;
    }

    .nav-badge {
      margin-left: auto;
      font-size: 0.65rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-weight: 700;
    }

    .sidebar-footer {
      padding: 0.85rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.95);
      font-size: 0.75rem;
      color: #64748b;
    }

    .footer-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  protected authService = inject(AuthService);
  private router = inject(Router);

  get userInitial(): string {
    const name = this.authService.currentUser()?.fullName || 'U';
    return name.charAt(0).toUpperCase();
  }

  mainNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'bi bi-grid-1x2-fill', module: 'dashboard' },
    { label: 'Employees', route: '/employees', icon: 'bi bi-people-fill', module: 'employees' },
    { label: 'Attendance', route: '/attendance', icon: 'bi bi-calendar-check-fill', module: 'attendance' },
    { label: 'Inventory', route: '/inventory', icon: 'bi bi-box-seam-fill', module: 'inventory' },
    { label: 'Suppliers', route: '/suppliers', icon: 'bi bi-truck', module: 'suppliers' },
    { label: 'Purchases', route: '/purchases', icon: 'bi bi-cart-check-fill', module: 'purchases' },
    { label: 'Sales Orders', route: '/sales', icon: 'bi bi-bag-check-fill', module: 'sales' },
    { label: 'Finance & Accounts', route: '/finance', icon: 'bi bi-cash-stack', module: 'finance' },
  ];

  systemNavItems: NavItem[] = [
    { label: 'Reports & Analytics', route: '/reports', icon: 'bi bi-bar-chart-fill', module: 'reports' },
    { label: 'Settings & Demo Data', route: '/settings', icon: 'bi bi-gear-fill', module: 'settings' },
  ];

  canAccess(moduleName: string): boolean {
    return this.authService.canAccess(moduleName);
  }

  onNavClick(): void {
    if (window.innerWidth < 992) {
      this.closeSidebar.emit();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
