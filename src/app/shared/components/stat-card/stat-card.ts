import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card h-100">
      <div>
        <span class="text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">
          {{ title }}
        </span>
        <h3 class="mt-1 mb-1 fw-bold text-dark" style="font-size: 1.6rem;">{{ value }}</h3>
        @if (subtext) {
          <div class="d-flex align-items-center gap-1 mt-1" style="font-size: 0.8rem;">
            @if (trend) {
              <span [class]="trendClass">
                <i [class]="trendIcon"></i> {{ trend }}
              </span>
            }
            <span class="text-muted">{{ subtext }}</span>
          </div>
        }
      </div>
      <div class="kpi-icon-box" [style.background-color]="iconBg" [style.color]="iconColor">
        <i [class]="icon"></i>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() subtext?: string;
  @Input() icon: string = 'bi bi-activity';
  @Input() iconBg: string = '#eff6ff';
  @Input() iconColor: string = '#1e40af';
  @Input() trend?: string;
  @Input() trendPositive?: boolean;

  get trendClass(): string {
    return this.trendPositive === true 
      ? 'text-success fw-bold' 
      : this.trendPositive === false 
        ? 'text-danger fw-bold' 
        : 'text-secondary fw-semibold';
  }

  get trendIcon(): string {
    return this.trendPositive === true 
      ? 'bi bi-arrow-up-right' 
      : this.trendPositive === false 
        ? 'bi bi-arrow-down-right' 
        : 'bi bi-dash';
  }
}
