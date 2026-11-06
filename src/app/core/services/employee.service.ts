import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesSignal = signal<Employee[]>([]);
  public employees = this.employeesSignal.asReadonly();

  constructor(
    private storage: StorageService,
    private notification: NotificationService
  ) {
    this.loadEmployees();
  }

  loadEmployees(): void {
    const list = this.storage.getItem<Employee[]>('employees', []);
    this.employeesSignal.set(list);
  }

  getAll(): Employee[] {
    return this.employeesSignal();
  }

  getById(id: string): Employee | undefined {
    return this.employeesSignal().find(e => e.id === id || e.employeeId === id);
  }

  generateEmployeeId(): string {
    const current = this.employeesSignal();
    if (current.length === 0) return 'EMP-1001';

    const numbers = current
      .map(e => {
        const match = e.employeeId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      })
      .filter(n => !isNaN(n));

    const max = Math.max(...numbers, 1000);
    return `EMP-${max + 1}`;
  }

  create(employee: Omit<Employee, 'id' | 'employeeId'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: 'emp-' + Date.now().toString(),
      employeeId: this.generateEmployeeId(),
      createdAt: new Date().toISOString()
    };

    const updated = [newEmployee, ...this.employeesSignal()];
    this.employeesSignal.set(updated);
    this.storage.setItem('employees', updated);
    this.notification.success('Employee Added', `${newEmployee.fullName} (${newEmployee.employeeId}) has been registered.`);
    return newEmployee;
  }

  update(id: string, employeeData: Partial<Employee>): boolean {
    const current = this.employeesSignal();
    const index = current.findIndex(e => e.id === id);
    if (index === -1) {
      this.notification.error('Error', 'Employee record not found.');
      return false;
    }

    const updatedEmployee = { ...current[index], ...employeeData };
    const updated = [...current];
    updated[index] = updatedEmployee;

    this.employeesSignal.set(updated);
    this.storage.setItem('employees', updated);
    this.notification.success('Employee Updated', `Changes to ${updatedEmployee.fullName} have been saved.`);
    return true;
  }

  delete(id: string): boolean {
    const current = this.employeesSignal();
    const employee = current.find(e => e.id === id);
    if (!employee) return false;

    const filtered = current.filter(e => e.id !== id);
    this.employeesSignal.set(filtered);
    this.storage.setItem('employees', filtered);
    this.notification.info('Employee Removed', `${employee.fullName} has been deleted.`);
    return true;
  }
}
