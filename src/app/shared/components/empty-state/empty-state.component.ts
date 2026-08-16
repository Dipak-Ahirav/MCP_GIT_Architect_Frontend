import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <section class="empty-state">
      <h2>{{ title() }}</h2>
      <p>{{ description() }}</p>
    </section>
  `,
  styles: [
    `
      .empty-state {
        border: 1px solid #d7dde8;
        border-radius: 8px;
        padding: 24px;
        background: #ffffff;
      }

      h2 {
        margin: 0 0 8px;
        font-size: 1.15rem;
      }

      p {
        margin: 0;
        color: #526071;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}

