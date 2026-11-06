export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  notes?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  totalEmployees: number;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalOnLeave: number;
  attendancePercentage: number;
  date: string;
}
