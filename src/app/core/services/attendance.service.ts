import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { AttendanceRecord, AttendanceSummary, AttendanceStatus } from '../models/attendance.model';
import { EmployeeService } from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private attendanceSignal = signal<AttendanceRecord[]>([]);
  public attendance = this.attendanceSignal.asReadonly();

  constructor(
    private storage: StorageService,
    private notification: NotificationService,
    private employeeService: EmployeeService
  ) {
    this.loadAttendance();
  }

  loadAttendance(): void {
    const records = this.storage.getItem<AttendanceRecord[]>('attendance', []);
    this.attendanceSignal.set(records);
  }

  getAll(): AttendanceRecord[] {
    return this.attendanceSignal();
  }

  getByDate(date: string): AttendanceRecord[] {
    return this.attendanceSignal().filter(a => a.date === date);
  }

  isAttendanceMarked(employeeId: string, date: string): boolean {
    return this.attendanceSignal().some(a => a.employeeId === employeeId && a.date === date);
  }

  markAttendance(data: {
    employeeId: string;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  }): { success: boolean; message: string; record?: AttendanceRecord } {
    // 1. Prevent duplicate attendance on same date
    if (this.isAttendanceMarked(data.employeeId, data.date)) {
      const msg = `Attendance for ${data.employeeId} on ${data.date} is already recorded. Cannot create duplicate entry.`;
      this.notification.warning('Duplicate Entry Prevented', msg);
      return { success: false, message: msg };
    }

    const employee = this.employeeService.getById(data.employeeId);
    const employeeName = employee ? employee.fullName : data.employeeId;
    const department = employee ? employee.department : 'General';

    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now().toString(),
      employeeId: data.employeeId,
      employeeName,
      department,
      date: data.date,
      status: data.status,
      checkInTime: data.checkInTime || (data.status === 'Present' ? '09:00' : undefined),
      checkOutTime: data.checkOutTime || (data.status === 'Present' ? '18:00' : undefined),
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...this.attendanceSignal()];
    this.attendanceSignal.set(updated);
    this.storage.setItem('attendance', updated);
    this.notification.success('Attendance Recorded', `Marked ${data.status} for ${employeeName} on ${data.date}`);
    return { success: true, message: 'Recorded successfully', record: newRecord };
  }

  updateRecord(id: string, updates: Partial<AttendanceRecord>): boolean {
    const current = this.attendanceSignal();
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return false;

    const updatedRecord = { ...current[index], ...updates };
    const updated = [...current];
    updated[index] = updatedRecord;

    this.attendanceSignal.set(updated);
    this.storage.setItem('attendance', updated);
    this.notification.success('Record Updated', 'Attendance record updated.');
    return true;
  }

  deleteRecord(id: string): boolean {
    const current = this.attendanceSignal();
    const filtered = current.filter(a => a.id !== id);
    this.attendanceSignal.set(filtered);
    this.storage.setItem('attendance', filtered);
    this.notification.info('Record Deleted', 'Attendance record removed.');
    return true;
  }

  getSummary(date?: string): AttendanceSummary {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const employees = this.employeeService.getAll();
    const dayRecords = this.getByDate(targetDate);

    const totalEmployees = employees.length;
    const totalPresent = dayRecords.filter(r => r.status === 'Present').length;
    const totalHalfDay = dayRecords.filter(r => r.status === 'Half Day').length;
    const totalOnLeave = dayRecords.filter(r => r.status === 'On Leave').length;
    const totalAbsent = dayRecords.filter(r => r.status === 'Absent').length;

    // Calculation: (Present + 0.5 * HalfDay) / TotalEmployees * 100
    const presentWeight = totalPresent + (totalHalfDay * 0.5);
    const attendancePercentage = totalEmployees > 0 
      ? Math.round((presentWeight / totalEmployees) * 100) 
      : 0;

    return {
      totalEmployees,
      totalPresent,
      totalAbsent,
      totalHalfDay,
      totalOnLeave,
      attendancePercentage,
      date: targetDate
    };
  }
}
