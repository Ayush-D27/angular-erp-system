import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastContainerComponent],
  template: `
    <div class="login-wrapper">
      <div class="login-card-container">
        <!-- Brand Header -->
        <div class="text-center mb-4">
          <div class="brand-badge mb-2">
            <i class="bi bi-boxes fs-3 text-primary"></i>
          </div>
          <h2 class="fw-bold text-dark mb-1">Nexus<span class="text-primary">ERP</span></h2>
          <p class="text-muted small">Enterprise Resource Planning Management Suite</p>
        </div>

        <div class="card card-enterprise shadow-md p-4">
          <h4 class="fw-bold mb-3 text-dark">Sign In</h4>
          <p class="text-secondary small mb-4">Select a pre-configured role below for instant demo login, or enter credentials manually.</p>

          <!-- One-Click Demonstration Quick Login Buttons -->
          <div class="demo-roles-section mb-4">
            <div class="fw-semibold text-muted text-uppercase mb-2" style="font-size: 0.72rem; letter-spacing: 0.05em;">
              Demo Quick-Access Roles
            </div>
            <div class="row g-2">
              <div class="col-6">
                <button 
                  type="button" 
                  class="btn btn-outline-primary w-100 p-2 text-start d-flex align-items-center gap-2"
                  (click)="quickLogin('Admin')">
                  <i class="bi bi-shield-check fs-5"></i>
                  <div>
                    <div class="fw-bold small lh-1">Admin</div>
                    <small class="text-muted" style="font-size: 0.68rem;">Full Access</small>
                  </div>
                </button>
              </div>
              <div class="col-6">
                <button 
                  type="button" 
                  class="btn btn-outline-info w-100 p-2 text-start d-flex align-items-center gap-2 text-dark"
                  (click)="quickLogin('HR Manager')">
                  <i class="bi bi-people fs-5 text-info"></i>
                  <div>
                    <div class="fw-bold small lh-1">HR Lead</div>
                    <small class="text-muted" style="font-size: 0.68rem;">Staff & Attendance</small>
                  </div>
                </button>
              </div>
              <div class="col-6">
                <button 
                  type="button" 
                  class="btn btn-outline-warning w-100 p-2 text-start d-flex align-items-center gap-2 text-dark"
                  (click)="quickLogin('Inventory Manager')">
                  <i class="bi bi-box-seam fs-5 text-warning"></i>
                  <div>
                    <div class="fw-bold small lh-1">Inventory</div>
                    <small class="text-muted" style="font-size: 0.68rem;">Stock & Orders</small>
                  </div>
                </button>
              </div>
              <div class="col-6">
                <button 
                  type="button" 
                  class="btn btn-outline-success w-100 p-2 text-start d-flex align-items-center gap-2 text-dark"
                  (click)="quickLogin('Finance Manager')">
                  <i class="bi bi-cash-coin fs-5 text-success"></i>
                  <div>
                    <div class="fw-bold small lh-1">Finance</div>
                    <small class="text-muted" style="font-size: 0.68rem;">Sales & P&L</small>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="position-relative text-center my-3">
            <hr class="text-muted opacity-25">
            <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">or sign in with email</span>
          </div>

          <!-- Standard Form -->
          <form (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Email Address</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                <input 
                  type="email" 
                  class="form-control border-start-0" 
                  [(ngModel)]="email" 
                  name="email" 
                  placeholder="admin@erp.com" 
                  required>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">Password</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                <input 
                  type="password" 
                  class="form-control border-start-0" 
                  [(ngModel)]="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-box-arrow-in-right"></i>
              <span>Enter ERP Portal</span>
            </button>
          </form>
        </div>

        <!-- Academic Footer Notice -->
        <div class="text-center mt-3 text-muted small">
          <div>College Main Project • Front-End UI Development</div>
          <div class="opacity-75">Angular Standalone Architecture • LocalStorage Persistence</div>
        </div>
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 10% 20%, #eff6ff 0%, #f1f5f9 90%);
      padding: 1.5rem;
    }
    .login-card-container {
      width: 100%;
      max-width: 460px;
    }
    .brand-badge {
      width: 58px;
      height: 58px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.12);
      border: 1px solid var(--border-color);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = 'admin@erp.com';
  password = 'password123';

  quickLogin(role: UserRole): void {
    let email = 'admin@erp.com';
    if (role === 'HR Manager') email = 'hr@erp.com';
    else if (role === 'Inventory Manager') email = 'inventory@erp.com';
    else if (role === 'Finance Manager') email = 'finance@erp.com';

    this.authService.login(email, role);
  }

  onSubmit(): void {
    if (!this.email) return;
    this.authService.login(this.email);
  }
}
