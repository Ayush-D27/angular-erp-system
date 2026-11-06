import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, UserRole, AppSettings } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="settings-page">
      <app-page-header 
        title="System Settings, Profile & Demonstration Tools" 
        section="Administration" 
        subtitle="Manage user credentials, organization metadata, demo roles, and database seed resets">
      </app-page-header>

      <div class="row g-4">
        <!-- User Profile Card -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark">
                  <i class="bi bi-person-badge text-primary me-2"></i> Current User Profile
                </h5>
                <small class="text-muted">Demonstration identity & contact information</small>
              </div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                {{ authService.userRole() }}
              </span>
            </div>
            <div class="p-4">
              <form (ngSubmit)="saveProfile()">
                <div class="mb-3 text-center">
                  <div class="avatar-profile mx-auto mb-2">
                    {{ (userProfile.fullName || 'U').charAt(0) }}
                  </div>
                  <h5 class="fw-bold text-dark mb-0">{{ userProfile.fullName }}</h5>
                  <div class="text-muted small">{{ userProfile.department }}</div>
                </div>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Full Name</label>
                    <input type="text" class="form-control" [(ngModel)]="userProfile.fullName" name="fullName" required>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Email Address</label>
                    <input type="email" class="form-control" [(ngModel)]="userProfile.email" name="email" required>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input type="text" class="form-control" [(ngModel)]="userProfile.phone" name="phone">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Department</label>
                    <input type="text" class="form-control" [(ngModel)]="userProfile.department" name="department">
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                  <button type="button" class="btn btn-outline-danger btn-sm" (click)="logout()">
                    <i class="bi bi-box-arrow-right me-1"></i> Sign Out
                  </button>
                  <button type="submit" class="btn btn-primary-custom">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Role Switcher Card -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark">
                  <i class="bi bi-people text-info me-2"></i> Role-Based Access Simulation
                </h5>
                <small class="text-muted">Instantly switch between demonstration personas</small>
              </div>
            </div>
            <div class="p-4">
              <p class="text-secondary small mb-3">
                NexusERP features fine-grained role-based navigation. Select any of the four department heads below to experience individual permission scopes during viva presentation:
              </p>

              <div class="d-grid gap-2">
                <button 
                  type="button" 
                  class="btn p-3 text-start border d-flex align-items-center justify-content-between"
                  [class.btn-primary]="authService.userRole() === 'Admin'"
                  [class.btn-outline-custom]="authService.userRole() !== 'Admin'"
                  (click)="switchRole('Admin')">
                  <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-shield-check fs-4 text-primary"></i>
                    <div>
                      <div class="fw-bold">System Administrator</div>
                      <div class="small text-muted">Full uninhibited access across all 10 ERP modules</div>
                    </div>
                  </div>
                  @if (authService.userRole() === 'Admin') {
                    <span class="badge bg-white text-primary">Active</span>
                  }
                </button>

                <button 
                  type="button" 
                  class="btn p-3 text-start border d-flex align-items-center justify-content-between"
                  [class.btn-info]="authService.userRole() === 'HR Manager'"
                  [class.btn-outline-custom]="authService.userRole() !== 'HR Manager'"
                  (click)="switchRole('HR Manager')">
                  <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-people-fill fs-4 text-info"></i>
                    <div>
                      <div class="fw-bold">HR Manager</div>
                      <div class="small text-muted">Employee Directory & Attendance Roster management</div>
                    </div>
                  </div>
                  @if (authService.userRole() === 'HR Manager') {
                    <span class="badge bg-dark text-white">Active</span>
                  }
                </button>

                <button 
                  type="button" 
                  class="btn p-3 text-start border d-flex align-items-center justify-content-between"
                  [class.btn-warning]="authService.userRole() === 'Inventory Manager'"
                  [class.btn-outline-custom]="authService.userRole() !== 'Inventory Manager'"
                  (click)="switchRole('Inventory Manager')">
                  <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-box-seam-fill fs-4 text-warning"></i>
                    <div>
                      <div class="fw-bold">Inventory & Procurement Manager</div>
                      <div class="small text-muted">Warehouse stock, vendor directories, and purchase orders</div>
                    </div>
                  </div>
                  @if (authService.userRole() === 'Inventory Manager') {
                    <span class="badge bg-dark text-white">Active</span>
                  }
                </button>

                <button 
                  type="button" 
                  class="btn p-3 text-start border d-flex align-items-center justify-content-between"
                  [class.btn-success]="authService.userRole() === 'Finance Manager'"
                  [class.btn-outline-custom]="authService.userRole() !== 'Finance Manager'"
                  (click)="switchRole('Finance Manager')">
                  <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-cash-stack fs-4 text-success"></i>
                    <div>
                      <div class="fw-bold">Finance & Sales Manager</div>
                      <div class="small text-muted">Customer orders, billing, operating ledger, and P&L</div>
                    </div>
                  </div>
                  @if (authService.userRole() === 'Finance Manager') {
                    <span class="badge bg-white text-success">Active</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Organization Settings Card -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100">
            <div class="card-header-enterprise">
              <div>
                <h5 class="fw-bold mb-0 text-dark">
                  <i class="bi bi-sliders text-primary me-2"></i> Organization Configuration
                </h5>
                <small class="text-muted">Entity profile, currency & thresholds</small>
              </div>
            </div>
            <div class="p-4">
              <form (ngSubmit)="saveSettings()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Company Name</label>
                    <input type="text" class="form-control" [(ngModel)]="appSettings.companyName" name="cName" required>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Official Email</label>
                    <input type="email" class="form-control" [(ngModel)]="appSettings.companyEmail" name="cEmail" required>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Phone Support</label>
                    <input type="text" class="form-control" [(ngModel)]="appSettings.companyPhone" name="cPhone">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Base Currency</label>
                    <select class="form-select" [(ngModel)]="appSettings.currency" name="currency">
                      <option value="INR">Indian Rupee (INR - ₹)</option>
                      <option value="USD">US Dollar (USD - $)</option>
                      <option value="EUR">Euro (EUR - €)</option>
                      <option value="GBP">British Pound (GBP - £)</option>
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Headquarters Address</label>
                    <textarea class="form-control" [(ngModel)]="appSettings.companyAddress" name="cAddr" rows="2"></textarea>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-top text-end">
                  <button type="submit" class="btn btn-primary-custom">Save Organization Settings</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Demonstration Data Management Card -->
        <div class="col-lg-6">
          <div class="card card-enterprise h-100 border-warning-subtle">
            <div class="card-header-enterprise bg-warning-subtle">
              <div>
                <h5 class="fw-bold mb-0 text-dark">
                  <i class="bi bi-database-fill-gear text-warning me-2"></i> Demonstration Data Management
                </h5>
                <small class="text-secondary">Reset test data back to clean factory state</small>
              </div>
            </div>
            <div class="p-4">
              <p class="text-secondary small mb-3">
                During faculty demonstrations and individual member vivas, users may create, edit, or delete mock records. You can restore the pristine seed dataset at any time with a single click.
              </p>

              <div class="p-3 bg-light rounded border mb-4">
                <div class="fw-bold small text-dark mb-1">What will be reset:</div>
                <ul class="mb-0 text-muted small ps-3">
                  <li>8 verified employees across 5 departments</li>
                  <li>Today's attendance records with check-in/out stamps</li>
                  <li>8 hardware, peripheral & networking warehouse products</li>
                  <li>4 registered vendor suppliers with catalog items</li>
                  <li>3 purchase orders (with stock update tracking)</li>
                  <li>3 sales orders with customer fulfillment & stock checks</li>
                  <li>Balanced finance journal ledger vouchers</li>
                </ul>
              </div>

              <button type="button" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2" (click)="isResetModalOpen = true">
                <i class="bi bi-arrow-counterclockwise fs-5"></i>
                <span class="fw-bold">Reset All Modules to Factory Demo State</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isResetModalOpen"
        title="Reset Application Demo Data"
        message="Are you sure you want to restore factory default demo records? Any custom employees, products, orders, or transactions you added will be refreshed to default state."
        confirmText="Yes, Reset Everything"
        [isDanger]="true"
        (confirm)="executeDataReset()"
        (cancel)="isResetModalOpen = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .avatar-profile {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #1e40af;
      color: #ffffff;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 10px rgba(30, 64, 175, 0.2);
    }
  `]
})
export class SettingsComponent implements OnInit {
  protected authService = inject(AuthService);
  private storageService = inject(StorageService);
  private notification = inject(NotificationService);

  userProfile: Partial<User> = {};
  appSettings: AppSettings = {
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'YYYY-MM-DD',
    enableNotifications: true,
    lowStockThreshold: 15
  };

  isResetModalOpen = false;

  ngOnInit(): void {
    const cur = this.authService.currentUser();
    if (cur) {
      this.userProfile = { ...cur };
    }
    this.appSettings = { ...this.authService.getSettings() };
  }

  saveProfile(): void {
    this.authService.updateProfile(this.userProfile);
  }

  saveSettings(): void {
    this.authService.updateSettings(this.appSettings);
  }

  switchRole(role: UserRole): void {
    this.authService.login('', role);
    const cur = this.authService.currentUser();
    if (cur) {
      this.userProfile = { ...cur };
    }
  }

  logout(): void {
    this.authService.logout();
  }

  executeDataReset(): void {
    this.storageService.resetToDemoData();
    this.isResetModalOpen = false;
    this.notification.success('Database Reset Complete', 'All modules restored to factory demo data.');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}
