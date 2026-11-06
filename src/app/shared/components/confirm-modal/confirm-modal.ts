import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-backdrop-custom" (click)="onCancel()">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()" style="max-width: 480px;">
          <div class="modal-header-custom">
            <h5 class="m-0 fw-bold d-flex align-items-center gap-2" [class.text-danger]="isDanger">
              @if (isDanger) {
                <i class="bi bi-exclamation-triangle-fill"></i>
              } @else {
                <i class="bi bi-question-circle-fill text-primary"></i>
              }
              {{ title }}
            </h5>
            <button type="button" class="btn-close" (click)="onCancel()"></button>
          </div>
          <div class="modal-body-custom py-4">
            <p class="text-secondary mb-0" style="font-size: 0.95rem; line-height: 1.6;">
              {{ message }}
            </p>
          </div>
          <div class="modal-footer-custom">
            <button type="button" class="btn btn-outline-custom" (click)="onCancel()">
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              [class]="isDanger ? 'btn btn-danger' : 'btn btn-primary-custom'" 
              (click)="onConfirm()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
