import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  JsonPipe,
} from '@angular/common';

import {
  AgentApiService,
} from '../../core/api/agent-api.service';

import {
  AppSessionService,
} from '../../core/state/app-session.service';

import type {
  GitHubApprovalRequired,
} from '../../core/models/approval.model';

import {
  getApiError,
} from '../../core/utils/api-error';


@Component({
  selector:
    'app-github-writes',

  imports: [
    FormsModule,
    JsonPipe,
  ],

  template: `
    <div class="page-header">

      <div>

        <h1>
          Human-Approved GitHub Actions
        </h1>

        <p>
          GitArchitect may propose mutations, but you decide whether they execute.
        </p>

      </div>

    </div>


    @if (
      session.repository();
      as repository
    ) {

      <div class="info-box">
        Writes are scoped to:
        <strong>
          {{ repository.fullName }}
        </strong>
      </div>

    } @else {

      <div class="info-box">
        Select a repository before requesting a GitHub write.
      </div>

    }


    <div class="panel">

      <label>
        <strong>
          Instruction
        </strong>
      </label>

      <textarea
        class="textarea"
        [(ngModel)]="instruction"
        placeholder="Example: Add a comment to issue #42 saying: MongoDB persistence test."
      ></textarea>


      <div class="examples">

        <button
          class="btn btn-secondary"
          (click)="
            instruction =
              'Add a comment to issue #42 saying: GitArchitect test comment.'
          ">

          Issue comment example

        </button>

      </div>


      <button
        class="btn btn-primary"
        [disabled]="
          loading() ||
          !instruction.trim() ||
          !session.hasRepository()
        "
        (click)="requestWrite()">

        {{
          loading()
            ? 'Preparing action...'
            : 'Prepare GitHub Action'
        }}

      </button>

    </div>


    @if (error()) {

      <div class="error-box">
        {{ error() }}
      </div>

    }


    @if (
      approval();
      as pending
    ) {

      <div class="approval-panel">

        <div class="approval-header">

          <div>

            <span class="badge badge-warning">
              APPROVAL REQUIRED
            </span>

            <h2>
              Review proposed GitHub action
            </h2>

          </div>

        </div>


        <p>
          Repository:
          <strong>
            {{ pending.repository }}
          </strong>
        </p>


        @for (
          action
          of pending.actions;
          track action.actionIndex
        ) {

          <div class="action-card">

            <strong>
              Tool:
              {{ action.tool }}
            </strong>

            <pre>
{{ action.arguments | json }}
            </pre>


            <div class="approval-actions">

              <button
                class="btn btn-success"
                [disabled]="
                  resolving()
                "
                (click)="
                  decide(
                    'approve',
                    action.actionIndex
                  )
                ">

                Approve

              </button>


              <button
                class="btn btn-danger"
                [disabled]="
                  resolving()
                "
                (click)="
                  decide(
                    'reject',
                    action.actionIndex
                  )
                ">

                Reject

              </button>

            </div>

          </div>

        }

      </div>

    }


    @if (resultMessage()) {

      <div class="panel">

        <span class="badge badge-success">
          Completed
        </span>

        <p>
          {{ resultMessage() }}
        </p>

      </div>

    }
  `,

  styles: [`
    .examples {
      margin:
        12px 0;
    }

    .approval-panel {
      padding: 22px;

      border:
        2px solid #f59e0b;

      background: #fffbeb;

      border-radius: 14px;
    }

    .approval-header h2 {
      margin:
        10px 0;
    }

    .action-card {
      margin-top: 16px;

      padding: 16px;

      background: white;

      border:
        1px solid #fde68a;

      border-radius: 10px;
    }

    .approval-actions {
      display: flex;

      gap: 10px;
    }
  `],
})
export class GithubWritesComponent {

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected instruction =
    '';

  protected readonly loading =
    signal(false);

  protected readonly resolving =
    signal(false);

  protected readonly approval =
    signal<
      GitHubApprovalRequired |
      null
    >(null);

  protected readonly resultMessage =
    signal<string | null>(
      null,
    );

  protected readonly error =
    signal<string | null>(
      null,
    );


  protected requestWrite():
    void {

    const sessionId =
      this.session.sessionId();

    if (
      !sessionId ||
      !this.instruction.trim()
    ) {
      return;
    }


    this.loading.set(true);

    this.error.set(null);

    this.resultMessage.set(null);

    this.approval.set(null);


    this.api
      .requestGitHubWrite(
        sessionId,
        this.instruction.trim(),
      )
      .subscribe({

        next:
          result => {

            this.loading.set(false);


            if (
              result.status ===
              'approval_required'
            ) {

              this.approval.set(
                result,
              );

              return;
            }


            this.resultMessage.set(
              result.response,
            );
          },

        error:
          error => {

            this.error.set(
              getApiError(
                error,
              ),
            );

            this.loading.set(false);
          },
      });
  }


  protected decide(
    decision:
      'approve' |
      'reject',

    actionIndex:
      number,
  ): void {

    const pending =
      this.approval();

    if (!pending) {
      return;
    }


    this.resolving.set(true);

    this.error.set(null);


    this.api
      .decideApproval(
        pending.approvalId,
        decision,
        actionIndex,
      )
      .subscribe({

        next:
          result => {

            this.resolving.set(
              false,
            );


            if (
              result.status ===
              'approval_required'
            ) {

              this.approval.set({
                status:
                  'approval_required',

                approvalId:
                  result.approvalId ??
                  pending.approvalId,

                repository:
                  pending.repository,

                actions:
                  result.actions ??
                  [],
              });

              return;
            }


            this.approval.set(
              null,
            );


            this.resultMessage.set(
              result.response ??
              (
                decision === 'approve'
                  ? 'GitHub action completed.'
                  : 'GitHub action rejected.'
              ),
            );
          },

        error:
          error => {

            this.error.set(
              getApiError(
                error,
              ),
            );

            this.resolving.set(
              false,
            );
          },
      });
  }
}