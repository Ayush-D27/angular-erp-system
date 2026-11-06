import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee, EmploymentStatus } from '../../core/models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="employees-page">
      <app-page-header 
        title="Employee Directory & Staff Records" 
        section="Human Resources" 
        subtitle="Manage personnel, organizational structure, designations and compensation"
        actionButtonText="Register Employee"
        actionIcon="bi bi-person-plus-fill"
        (actionClicked)="openAddModal()">
      </app-page-header>

      <!-- Search & Filters Bar -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search by name, ID, email, or designation..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="selectedDepartment">
              <option value="">All Departments</option>
              @for (dept of departments; track dept) {
                <option [value]="dept">{{ dept }}</option>
              }
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" [(ngModel)]="selectedStatus">
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
          <div class="col-md-2 text-md-end text-muted small">
            <span>Showing: <strong>{{ filteredEmployees.length }}</strong> of {{ employeeService.getAll().length }}</span>
          </div>
        </div>
      </div>

      <!-- Employees Data Table -->
      <div class="card card-enterprise">
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Details</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Monthly Salary</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filteredEmployees; track emp.id) {
                <tr>
                  <td>
                    <span class="badge bg-light text-primary border border-primary-subtle fw-bold">
                      {{ emp.employeeId }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-sm">
                        {{ emp.fullName.charAt(0) }}
                      </div>
                      <div>
                        <div class="fw-bold text-dark">{{ emp.fullName }}</div>
                        <div class="text-muted small">{{ emp.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                      {{ emp.department }}
                    </span>
                  </td>
                  <td class="text-secondary fw-semibold">{{ emp.designation }}</td>
                  <td class="text-muted small">{{ emp.joiningDate }}</td>
                  <td class="fw-bold text-dark">₹{{ emp.salary | number:'1.0-0' }}</td>
                  <td>
                    <span class="badge-custom" [ngClass]="getStatusBadgeClass(emp.employmentStatus)">
                      {{ emp.employmentStatus }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-info" 
                        title="View Details"
                        (click)="viewDetails(emp)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-primary" 
                        title="Edit Employee"
                        (click)="openEditModal(emp)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-outline-custom text-danger" 
                        title="Delete Employee"
                        (click)="confirmDelete(emp)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-person-x fs-2 d-block mb-2 text-secondary"></i>
                    No employee records match the filter criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Employee Modal -->
      @if (isModalOpen) {
        <div class="modal-backdrop-custom" (click)="closeModal()">
          <div class="modal-dialog-custom modal-dialog-lg" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i [class]="isEditMode ? 'bi bi-pencil-square text-primary' : 'bi bi-person-plus text-primary'" class="me-2"></i>
                {{ isEditMode ? 'Edit Employee Details' : 'Register New Employee' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveEmployee()">
              <div class="modal-body-custom">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Full Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentEmployee.fullName" name="fullName" required placeholder="e.g. Rahul Sharma">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Email Address *</label>
                    <input type="email" class="form-control" [(ngModel)]="currentEmployee.email" name="email" required placeholder="e.g. rahul@nexus-erp.global">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Phone Number *</label>
                    <input type="tel" class="form-control" [(ngModel)]="currentEmployee.phone" name="phone" required placeholder="e.g. +91 98765 43210">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Department *</label>
                    <select class="form-select" [(ngModel)]="currentEmployee.department" name="department" required>
                      @for (dept of departments; track dept) {
                        <option [value]="dept">{{ dept }}</option>
                      }
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Designation *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentEmployee.designation" name="designation" required placeholder="e.g. Lead Software Engineer">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Joining Date *</label>
                    <input type="date" class="form-control" [(ngModel)]="currentEmployee.joiningDate" name="joiningDate" required>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Monthly Salary (INR ₹) *</label>
                    <input type="number" class="form-control" [(ngModel)]="currentEmployee.salary" name="salary" required min="1000" placeholder="e.g. 85000">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Employment Status *</label>
                    <select class="form-select" [(ngModel)]="currentEmployee.employmentStatus" name="employmentStatus" required>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">Residential Address</label>
                    <textarea class="form-control" [(ngModel)]="currentEmployee.address" name="address" rows="2" placeholder="Full residential address..."></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary-custom">
                  {{ isEditMode ? 'Save Changes' : 'Register Employee' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- View Details Modal -->
      @if (selectedEmployeeForView) {
        <div class="modal-backdrop-custom" (click)="selectedEmployeeForView = null">
          <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-person-badge text-primary me-2"></i> Employee Profile
              </h5>
              <button type="button" class="btn-close" (click)="selectedEmployeeForView = null"></button>
            </div>
            <div class="modal-body-custom">
              <div class="text-center mb-4">
                <div class="avatar-lg mx-auto mb-2">
                  {{ selectedEmployeeForView.fullName.charAt(0) }}
                </div>
                <h4 class="fw-bold mb-0 text-dark">{{ selectedEmployeeForView.fullName }}</h4>
                <div class="text-muted">{{ selectedEmployeeForView.designation }}</div>
                <span class="badge-custom mt-2" [ngClass]="getStatusBadgeClass(selectedEmployeeForView.employmentStatus)">
                  {{ selectedEmployeeForView.employmentStatus }}
                </span>
              </div>

              <div class="border rounded p-3 bg-light">
                <div class="row g-2 small">
                  <div class="col-6 text-muted">Employee ID:</div>
                  <div class="col-6 fw-bold text-dark">{{ selectedEmployeeForView.employeeId }}</div>

                  <div class="col-6 text-muted">Department:</div>
                  <div class="col-6 fw-bold text-dark">{{ selectedEmployeeForView.department }}</div>

                  <div class="col-6 text-muted">Email:</div>
                  <div class="col-6 text-dark">{{ selectedEmployeeForView.email }}</div>

                  <div class="col-6 text-muted">Phone:</div>
                  <div class="col-6 text-dark">{{ selectedEmployeeForView.phone }}</div>

                  <div class="col-6 text-muted">Joining Date:</div>
                  <div class="col-6 text-dark">{{ selectedEmployeeForView.joiningDate }}</div>

                  <div class="col-6 text-muted">Monthly Salary:</div>
                  <div class="col-6 fw-bold text-success">₹{{ selectedEmployeeForView.salary | number:'1.0-0' }}</div>

                  <div class="col-6 text-muted">Address:</div>
                  <div class="col-6 text-dark">{{ selectedEmployeeForView.address || 'Not Provided' }}</div>
                </div>
              </div>
            </div>
            <div class="modal-footer-custom">
              <button type="button" class="btn btn-outline-custom" (click)="selectedEmployeeForView = null">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Employee Record"
        [message]="'Are you sure you want to delete employee record for ' + (employeeToDelete?.fullName || '') + '? This action cannot be reversed.'"
        confirmText="Yes, Delete Record"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .avatar-sm {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #e0e7ff;
      color: #3730a3;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
    .avatar-lg {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #1e40af;
      color: #ffffff;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      box-shadow: 0 4px 10px rgba(30, 64, 175, 0.25);
    }
  `]
})
export class EmployeesComponent {
  protected employeeService = inject(EmployeeService);

  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  departments = [
    'Engineering',
    'Finance',
    'Sales',
    'Human Resources',
    'Operations & Logistics',
    'Marketing',
    'Legal & Compliance'
  ];

  isModalOpen = false;
  isEditMode = false;
  editingId: string | null = null;

  currentEmployee: Partial<Employee> = {
    fullName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 50000,
    employmentStatus: 'Active',
    address: ''
  };

  selectedEmployeeForView: Employee | null = null;

  isDeleteModalOpen = false;
  employeeToDelete: Employee | null = null;

  get filteredEmployees(): Employee[] {
    return this.employeeService.getAll().filter(emp => {
      const matchSearch = !this.searchTerm ||
        emp.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchDept = !this.selectedDepartment || emp.department === this.selectedDepartment;
      const matchStatus = !this.selectedStatus || emp.employmentStatus === this.selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });
  }

  getStatusBadgeClass(status: EmploymentStatus): string {
    switch (status) {
      case 'Active': return 'badge-success-custom';
      case 'On Leave': return 'badge-warning-custom';
      case 'Terminated': return 'badge-danger-custom';
      default: return 'badge-secondary-custom';
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.currentEmployee = {
      fullName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 50000,
      employmentStatus: 'Active',
      address: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(emp: Employee): void {
    this.isEditMode = true;
    this.editingId = emp.id;
    this.currentEmployee = { ...emp };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveEmployee(): void {
    if (!this.currentEmployee.fullName || !this.currentEmployee.email) return;

    if (this.isEditMode && this.editingId) {
      this.employeeService.update(this.editingId, this.currentEmployee);
    } else {
      this.employeeService.create({
        fullName: this.currentEmployee.fullName!,
        email: this.currentEmployee.email!,
        phone: this.currentEmployee.phone || '',
        department: this.currentEmployee.department || 'General',
        designation: this.currentEmployee.designation || 'Staff',
        joiningDate: this.currentEmployee.joiningDate || new Date().toISOString().split('T')[0],
        salary: Number(this.currentEmployee.salary) || 0,
        employmentStatus: (this.currentEmployee.employmentStatus as EmploymentStatus) || 'Active',
        address: this.currentEmployee.address
      });
    }

    this.closeModal();
  }

  viewDetails(emp: Employee): void {
    this.selectedEmployeeForView = emp;
  }

  confirmDelete(emp: Employee): void {
    this.employeeToDelete = emp;
    this.isDeleteModalOpen = true;
  }

  executeDelete(): void {
    if (this.employeeToDelete) {
      this.employeeService.delete(this.employeeToDelete.id);
      this.isDeleteModalOpen = false;
      this.employeeToDelete = null;
    }
  }
}
