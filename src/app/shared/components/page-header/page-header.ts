import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <div class="d-flex align-items-center gap-2 text-muted mb-1" style="font-size: 0.8rem;">
          <span class="text-uppercase fw-semibold" style="letter-spacing: 0.05em;">{{ section }}</span>
          <i class="bi bi-chevron-right" style="font-size: 0.7rem;"></i>
          <span>{{ title }}</span>
        </div>
        <h2 class="h3 fw-bold mb-0 text-dark">{{ title }}</h2>
        @if (subtitle) {
          <p class="text-muted small mb-0 mt-1">{{ subtitle }}</p>
        }
      </div>

      <div class="d-flex align-items-center gap-2">
        <ng-content></ng-content>
        @if (actionButtonText) {
          <button 
            type="button" 
            class="btn btn-primary-custom d-flex align-items-center gap-2"
            (click)="actionClicked.emit()">
            @if (actionIcon) {
              <i [class]="actionIcon"></i>
            }
            <span>{{ actionButtonText }}</span>
          </button>
        }
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() section = 'Enterprise ERP';
  @Input() subtitle?: string;
  @Input() actionButtonText?: string;
  @Input() actionIcon?: string;

  @Output() actionClicked = new EventEmitter<void>();
}
