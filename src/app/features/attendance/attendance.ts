import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AttendanceRecord, AttendanceStatus, AttendanceSummary } from '../../core/models/attendance.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatCardComponent
  ],
  template: `
    <div class="attendance-page">
      <app-page-header 
        title="Employee Attendance Tracker" 
        section="Human Resources" 
        subtitle="Daily roster verification, shift clock-in/out logging, and attendance percentage tracking"
        actionButtonText="Log Attendance Entry"
        actionIcon="bi bi-clock-history"
        (actionClicked)="openMarkModal()">
      </app-page-header>

      <!-- Today's Attendance Metric Cards -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Total Registered Staff" 
            [value]="summary.totalEmployees" 
            subtext="Available workforce" 
            icon="bi bi-people"
            iconBg="#eff6ff"
            iconColor="#1e40af">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Staff Present Today" 
            [value]="summary.totalPresent" 
            [subtext]="summary.totalHalfDay + ' half-day shifts'" 
            icon="bi bi-check-circle-fill"
            iconBg="#ecfdf5"
            iconColor="#059669"
            [trend]="summary.attendancePercentage + '% rate'"
            [trendPositive]="summary.attendancePercentage >= 80">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Staff Absent" 
            [value]="summary.totalAbsent" 
            [subtext]="summary.totalOnLeave + ' on authorized leave'" 
            icon="bi bi-x-circle-fill"
            iconBg="#fef2f2"
            iconColor="#dc2626"
            [trendPositive]="summary.totalAbsent === 0">
          </app-stat-card>
        </div>

        <div class="col-xl-3 col-sm-6">
          <app-stat-card 
            title="Attendance Rate" 
            [value]="summary.attendancePercentage + '%'" 
            subtext="Calculated weighted ratio" 
            icon="bi bi-pie-chart-fill"
            [iconBg]="summary.attendancePercentage >= 75 ? '#eff6ff' : '#fffbeb'"
            [iconColor]="summary.attendancePercentage >= 75 ? '#2563eb' : '#d97706'"
            [trendPositive]="summary.attendancePercentage >= 75">
          </app-stat-card>
        </div>
      </div>

      <!-- Filters & Actions -->
      <div class="card card-enterprise p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Search by employee name or ID..." 
                [(ngModel)]="searchTerm">
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="bi bi-calendar-event text-muted"></i></span>
              <input type="date" class="form-control" [(ngModel)]="filterDate" (change)="onDateChange()">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="filterStatus">
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <div class="col-md-2 text-md-end">
            <button type="button" class="btn btn-outline-custom w-100" (click)="resetDateFilter()">
              <i class="bi bi-arrow-clockwise me-1"></i> Today
            </button>
          </div>
        </div>
      </div>

      <!-- Attendance Records Table -->
      <div class="card card-enterprise">
        <div class="table-responsive">
          <table class="table-enterprise">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Remarks / Notes</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (rec of filteredRecords; track rec.id) {
                <tr>
                  <td class="fw-bold text-dark">{{ rec.date }}</td>
                  <td>
                    <div class="fw-bold text-dark">{{ rec.employeeName }}</div>
                    <span class="badge bg-light text-secondary border" style="font-size: 0.7rem;">
                      {{ rec.employeeId }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                      {{ rec.department }}
                    </span>
                  </td>
                  <td>
                    <span class="badge-custom" [ngClass]="getStatusBadge(rec.status)">
                      {{ rec.status }}
                    </span>
                  </td>
                  <td class="text-muted small">
                    <i class="bi bi-box-arrow-in-right text-success me-1"></i>
                    {{ rec.checkInTime || '—' }}
                  </td>
                  <td class="text-muted small">
                    <i class="bi bi-box-arrow-left text-danger me-1"></i>
                    {{ rec.checkOutTime || '—' }}
                  </td>
                  <td class="text-secondary small">{{ rec.notes || '—' }}</td>
                  <td class="text-end">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-custom text-danger" 
                      title="Delete Entry"
                      (click)="deleteEntry(rec.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-calendar-x fs-2 d-block mb-2 text-secondary"></i>
                    No attendance logs recorded for selected filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mark Attendance Modal with Duplicate Prevention -->
      @if (isModalOpen) {
        <div class="modal-backdrop-custom" (click)="isModalOpen = false">
          <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
            <div class="modal-header-custom">
              <h5 class="fw-bold mb-0 text-dark">
                <i class="bi bi-clock-history text-primary me-2"></i> Log Daily Attendance
              </h5>
              <button type="button" class="btn-close" (click)="isModalOpen = false"></button>
            </div>
            <form (ngSubmit)="submitAttendance()">
              <div class="modal-body-custom">
                @if (duplicateErrorMsg) {
                  <div class="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 small" role="alert">
                    <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>{{ duplicateErrorMsg }}</div>
                  </div>
                }

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Select Employee *</label>
                  <select class="form-select" [(ngModel)]="newRecord.employeeId" name="employeeId" required (change)="duplicateErrorMsg = ''">
                    <option value="">-- Choose Employee --</option>
                    @for (emp of employeeService.getAll(); track emp.id) {
                      <option [value]="emp.employeeId">
                        {{ emp.fullName }} ({{ emp.employeeId }} - {{ emp.department }})
                      </option>
                    }
                  </select>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Date *</label>
                    <input type="date" class="form-control" [(ngModel)]="newRecord.date" name="date" required (change)="duplicateErrorMsg = ''">
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Status *</label>
                    <select class="form-select" [(ngModel)]="newRecord.status" name="status" required>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Clock-In Time</label>
                    <input type="time" class="form-control" [(ngModel)]="newRecord.checkInTime" name="checkInTime">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">Clock-Out Time</label>
                    <input type="time" class="form-control" [(ngModel)]="newRecord.checkOutTime" name="checkOutTime">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Notes / Leave Reason</label>
                  <input type="text" class="form-control" [(ngModel)]="newRecord.notes" name="notes" placeholder="Optional remarks...">
                </div>
              </div>
              <div class="modal-footer-custom">
                <button type="button" class="btn btn-outline-custom" (click)="isModalOpen = false">Cancel</button>
                <button type="submit" class="btn btn-primary-custom">Confirm & Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  protected attendanceService = inject(AttendanceService);
  protected employeeService = inject(EmployeeService);

  todayStr = new Date().toISOString().split('T')[0];
  filterDate = this.todayStr;
  filterStatus = '';
  searchTerm = '';
  summary!: AttendanceSummary;

  isModalOpen = false;
  duplicateErrorMsg = '';

  newRecord = {
    employeeId: '',
    date: this.todayStr,
    status: 'Present' as AttendanceStatus,
    checkInTime: '09:00',
    checkOutTime: '18:00',
    notes: ''
  };

  ngOnInit(): void {
    this.refreshSummary();
  }

  refreshSummary(): void {
    this.summary = this.attendanceService.getSummary(this.filterDate);
  }

  onDateChange(): void {
    this.refreshSummary();
  }

  resetDateFilter(): void {
    this.filterDate = this.todayStr;
    this.refreshSummary();
  }

  get filteredRecords(): AttendanceRecord[] {
    return this.attendanceService.getAll().filter(r => {
      const matchDate = !this.filterDate || r.date === this.filterDate;
      const matchStatus = !this.filterStatus || r.status === this.filterStatus;
      const matchSearch = !this.searchTerm ||
        r.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchDate && matchStatus && matchSearch;
    });
  }

  getStatusBadge(status: AttendanceStatus): string {
    switch (status) {
      case 'Present': return 'badge-success-custom';
      case 'Half Day': return 'badge-info-custom';
      case 'On Leave': return 'badge-warning-custom';
      case 'Absent': return 'badge-danger-custom';
      default: return 'badge-secondary-custom';
    }
  }

  openMarkModal(): void {
    this.duplicateErrorMsg = '';
    this.newRecord = {
      employeeId: '',
      date: this.todayStr,
      status: 'Present',
      checkInTime: '09:00',
      checkOutTime: '18:00',
      notes: ''
    };
    this.isModalOpen = true;
  }

  submitAttendance(): void {
    if (!this.newRecord.employeeId || !this.newRecord.date) return;

    const res = this.attendanceService.markAttendance(this.newRecord);
    if (!res.success) {
      this.duplicateErrorMsg = res.message;
      return;
    }

    this.isModalOpen = false;
    this.refreshSummary();
  }

  deleteEntry(id: string): void {
    this.attendanceService.deleteRecord(id);
    this.refreshSummary();
  }
}
