import {
  Component,
  inject,
} from '@angular/core';

import {
  AppSessionService,
} from '../../core/state/app-session.service';


@Component({
  selector:
    'app-header',

  template: `
    <header class="topbar">

      <div>

        <strong>
          GitArchitect
        </strong>

        <small>
          AI-powered GitHub Engineering Assistant
        </small>

      </div>


      <div>

        @if (
          session.repository();
          as repository
        ) {

          <span class="badge badge-success">
            {{ repository.fullName }}
          </span>

        } @else {

          <span class="badge">
            No repository selected
          </span>

        }

      </div>

    </header>
  `,

  styles: [`
    .topbar {
      min-height: 72px;

      padding:
        0 28px;

      display: flex;

      align-items: center;

      justify-content:
        space-between;

      gap: 20px;

      background: white;

      border-bottom:
        1px solid #e2e8f0;
    }

    small {
      display: block;

      margin-top: 4px;

      color: #64748b;
    }
  `],
})
export class HeaderComponent {

  protected readonly session =
    inject(
      AppSessionService,
    );
}