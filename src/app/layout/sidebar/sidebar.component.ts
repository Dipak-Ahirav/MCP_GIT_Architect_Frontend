import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav aria-label="Primary navigation">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active">
            {{ item.label }}
          </a>
        }
      </nav>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Repositories', path: '/repositories' },
    { label: 'Chat', path: '/chat' },
    { label: 'Repository Intelligence', path: '/repository-intelligence' },
    { label: 'Pull Request Review', path: '/pull-request-review' },
    { label: 'Issue Analysis', path: '/issue-analysis' },
    { label: 'CI Debugger', path: '/ci-debugger' },
    { label: 'Approvals', path: '/approvals' },
  ];
}

