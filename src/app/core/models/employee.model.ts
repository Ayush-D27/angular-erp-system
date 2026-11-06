export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-1001
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string; // YYYY-MM-DD
  salary: number;
  employmentStatus: EmploymentStatus;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
}
