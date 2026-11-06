import { Component, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar-wrapper">
      <div class="d-flex align-items-center gap-3">
        <!-- Mobile Toggle Button -->
        <button 
          type="button" 
          class="btn btn-outline-custom p-1 px-2 d-lg-none" 
          (click)="toggleSidebar.emit()"
          title="Toggle Navigation Menu">
          <i class="bi bi-list fs-5"></i>
        </button>

        <!-- Current Date & System Time Live Badge -->
        <div class="d-none d-md-flex align-items-center gap-2 text-muted" style="font-size: 0.825rem;">
          <i class="bi bi-calendar3 text-primary"></i>
          <span class="fw-medium text-dark">{{ currentDateFormatted }}</span>
          <span class="text-secondary opacity-50">|</span>
          <i class="bi bi-clock text-primary"></i>
          <span class="fw-semibold text-secondary">{{ currentTimeFormatted }}</span>
        </div>
      </div>

      <!-- Right Action Items -->
      <div class="d-flex align-items-center gap-3">
        <!-- Low Stock Alert Bell -->
        <div class="position-relative cursor-pointer" (click)="goToInventory()" title="Low Stock Alerts">
          <button type="button" class="btn btn-outline-custom position-relative p-2 rounded-circle" style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <i class="bi bi-bell-fill text-secondary"></i>
            @if (lowStockCount > 0) {
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
                {{ lowStockCount }}
              </span>
            }
          </button>
        </div>

        <!-- Quick Demo Role Switcher -->
        <div class="dropdown d-none d-sm-block">
          <button class="btn btn-outline-custom dropdown-toggle btn-sm d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">{{ authService.userRole() }}</span>
            <span class="small fw-semibold text-dark">{{ authService.currentUser()?.fullName }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="font-size: 0.85rem;">
            <li><h6 class="dropdown-header text-uppercase" style="font-size: 0.7rem;">Quick Role Switch (Demo)</h6></li>
            <li><button class="dropdown-item py-2" (click)="switchRole('Admin')"><i class="bi bi-shield-check text-primary me-2"></i>Admin (Full Access)</button></li>
            <li><button class="dropdown-item py-2" (click)="switchRole('HR Manager')"><i class="bi bi-people text-info me-2"></i>HR Manager</button></li>
            <li><button class="dropdown-item py-2" (click)="switchRole('Inventory Manager')"><i class="bi bi-box text-warning me-2"></i>Inventory Manager</button></li>
            <li><button class="dropdown-item py-2" (click)="switchRole('Finance Manager')"><i class="bi bi-cash text-success me-2"></i>Finance Manager</button></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item py-2" (click)="goToSettings()"><i class="bi bi-gear me-2"></i>Settings & Profile</button></li>
            <li><button class="dropdown-item py-2 text-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
          </ul>
        </div>

        <!-- Logout button on mobile -->
        <button type="button" class="btn btn-outline-danger btn-sm d-sm-none" (click)="logout()" title="Logout">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      height: var(--navbar-height);
      background-color: #ffffff;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 1020;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  protected authService = inject(AuthService);
  protected inventoryService = inject(InventoryService);
  private router = inject(Router);

  private timer: any;
  currentDateFormatted = '';
  currentTimeFormatted = '';

  get lowStockCount(): number {
    return this.inventoryService.lowStockProducts().length;
  }

  ngOnInit(): void {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateClock(): void {
    const now = new Date();
    this.currentDateFormatted = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    this.currentTimeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  goToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  switchRole(role: any): void {
    this.authService.login('', role);
  }

  logout(): void {
    this.authService.logout();
  }
}
