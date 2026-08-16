import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-approvals',
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state
      title="Approvals"
      description="Review and approve agent actions before repository write operations are executed."
    />
  `,
})
export class ApprovalsComponent {}

