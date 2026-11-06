import { Injectable, signal } from '@angular/core';
import { ToastNotification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<ToastNotification[]>([]);
  public notifications = this.notificationsSignal.asReadonly();

  show(type: NotificationType, title: string, message: string, duration = 3500): void {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { id, type, title, message, duration };

    this.notificationsSignal.update(list => [...list, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message, 4500);
  }

  warning(title: string, message: string): void {
    this.show('warning', title, message);
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  dismiss(id: string): void {
    this.notificationsSignal.update(list => list.filter(t => t.id !== id));
  }
}
