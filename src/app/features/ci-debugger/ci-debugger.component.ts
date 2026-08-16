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
  CiDebugAnalysis,
} from '../../core/models/analysis.model';

import {
  getApiError,
} from '../../core/utils/api-error';


@Component({
  selector:
    'app-ci-debugger',

  imports: [
    FormsModule,
    JsonPipe,
  ],

  template: `
    <div class="page-header">

      <div>

        <h1>
          CI Debugger
        </h1>

        <p>
          Investigate failed GitHub Actions runs and identify the root cause.
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="form-row">

        <input
          class="input"
          type="number"
          min="1"
          [(ngModel)]="runId"
          placeholder="GitHub Actions run ID"
        />

        <button
          class="btn btn-primary"
          [disabled]="
            loading() ||
            !runId ||
            !session.hasRepository()
          "
          (click)="debug()">

          {{
            loading()
              ? 'Investigating...'
              : 'Debug Run'
          }}

        </button>

      </div>

    </div>


    @if (error()) {

      <div class="error-box">
        {{ error() }}
      </div>

    }


    @if (report(); as data) {

      <div class="grid">

        <div class="stat-card">

          <span class="stat-label">
            Failure Category
          </span>

          <span class="stat-value">
            {{
              data.failureCategory ??
              'Unknown'
            }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Confidence
          </span>

          <span class="stat-value">
            {{
              data.confidence ??
              '-'
            }}
          </span>

        </div>

      </div>


      @if (data.summary) {

        <div class="panel">

          <h2>
            Summary
          </h2>

          <p>
            {{ data.summary }}
          </p>

        </div>

      }


      @if (data.rootCause) {

        <div class="panel">

          <h2>
            Root Cause
          </h2>

          <p>
            {{ data.rootCause }}
          </p>

        </div>

      }


      <div class="panel">

        <h2>
          Failed Jobs
        </h2>

        @for (
          job
          of data.failedJobs ?? [];
          track job
        ) {

          <div class="finding">
            {{ job }}
          </div>

        }

      </div>


      <div class="panel">

        <h2>
          Proposed Fixes
        </h2>

        <ol>

          @for (
            fix
            of data.proposedFixes ?? [];
            track fix
          ) {

            <li>
              {{ fix }}
            </li>

          }

        </ol>

      </div>


      @if (
        data.relevantLogLines?.length
      ) {

        <div class="panel">

          <h2>
            Relevant Logs
          </h2>

          <pre>
@for (
  line
  of data.relevantLogLines ?? [];
  track $index
) {
{{ line }}
}
          </pre>

        </div>

      }


      <div class="panel">

        <h2>
          Validation Plan
        </h2>

        <ul>

          @for (
            step
            of data.validationPlan ?? [];
            track step
          ) {

            <li>
              {{ step }}
            </li>

          }

        </ul>

      </div>


      <details class="panel">

        <summary>
          Raw debugger output
        </summary>

        <pre>{{ data | json }}</pre>

      </details>

    }
  `,
})
export class CiDebuggerComponent {

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected runId:
    number | null =
      null;

  protected readonly report =
    signal<
      CiDebugAnalysis |
      null
    >(null);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal<string | null>(
      null,
    );


  protected debug():
    void {

    const sessionId =
      this.session.sessionId();

    if (
      !sessionId ||
      !this.runId
    ) {
      return;
    }


    this.loading.set(true);

    this.error.set(null);


    this.api
      .debugWorkflowRun(
        sessionId,
        Number(
          this.runId,
        ),
      )
      .subscribe({

        next:
          report => {

            this.report.set(
              report,
            );

            this.loading.set(false);
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
}