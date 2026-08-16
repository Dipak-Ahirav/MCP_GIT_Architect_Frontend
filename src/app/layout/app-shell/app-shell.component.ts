import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  imports: [HeaderComponent, RouterOutlet, SidebarComponent],
  template: `
    <app-header />
    <div class="shell-body">
      <app-sidebar />
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {}

