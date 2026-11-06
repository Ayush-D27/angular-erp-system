import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { NavbarComponent } from '../navbar/navbar';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="app-layout-container">
      <!-- Responsive Sidebar -->
      <app-sidebar 
        [isOpen]="isSidebarMobileOpen" 
        (closeSidebar)="isSidebarMobileOpen = false">
      </app-sidebar>

      <!-- Main Content Container with Left Margin on Desktop -->
      <div class="app-main-content">
        <!-- Top Sticky Navbar -->
        <app-navbar (toggleSidebar)="isSidebarMobileOpen = !isSidebarMobileOpen"></app-navbar>

        <!-- Dynamic Routed Content -->
        <main class="page-content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Global Toast Container -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout-container {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main);
    }

    .app-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin-left 0.25s ease;
    }

    @media (min-width: 992px) {
      .app-main-content {
        margin-left: var(--sidebar-width);
      }
    }

    .page-content-wrapper {
      flex: 1;
      padding: 1.5rem;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .page-content-wrapper {
        padding: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent {
  isSidebarMobileOpen = false;
}
