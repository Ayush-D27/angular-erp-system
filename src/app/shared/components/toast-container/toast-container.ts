import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container-custom">
      @for (toast of notificationService.notifications(); track toast.id) {
        <div class="toast-item shadow-lg" [ngClass]="getToastClass(toast.type)">
          <i [class]="getToastIcon(toast.type)" style="font-size: 1.25rem;"></i>
          <div class="flex-grow-1">
            <div class="fw-bold" style="font-size: 0.85rem;">{{ toast.title }}</div>
            <div style="font-size: 0.8rem; opacity: 0.95;">{{ toast.message }}</div>
          </div>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            style="transform: scale(0.75); opacity: 0.8;" 
            (click)="notificationService.dismiss(toast.id)">
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  protected notificationService = inject(NotificationService);

  getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      default: return 'toast-info';
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi bi-check-circle-fill';
      case 'error': return 'bi bi-x-octagon-fill';
      case 'warning': return 'bi bi-exclamation-triangle-fill';
      default: return 'bi bi-info-circle-fill';
    }
  }
}
