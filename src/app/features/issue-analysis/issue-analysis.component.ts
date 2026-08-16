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
  IssueAnalysis,
} from '../../core/models/analysis.model';

import {
  getApiError,
} from '../../core/utils/api-error';


@Component({
  selector:
    'app-issue-analysis',

  imports: [
    FormsModule,
    JsonPipe,
  ],

  template: `
    <div class="page-header">

      <div>

        <h1>
          Issue Analyzer
        </h1>

        <p>
          Convert a GitHub issue into requirements, impact and an implementation plan.
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="form-row">

        <input
          class="input"
          type="number"
          min="1"
          [(ngModel)]="issueNumber"
          placeholder="Issue number"
        />

        <button
          class="btn btn-primary"
          [disabled]="
            loading() ||
            !issueNumber ||
            !session.hasRepository()
          "
          (click)="analyze()">

          {{
            loading()
              ? 'Analyzing...'
              : 'Analyze Issue'
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
            Type
          </span>

          <span class="stat-value">
            {{
              data.issueType ??
              'Issue'
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


      @if (
        data.rootCauseHypothesis
      ) {

        <div class="panel">

          <h2>
            Root Cause Hypothesis
          </h2>

          <p>
            {{
              data.rootCauseHypothesis
            }}
          </p>

        </div>

      }


      <div class="grid">

        <div class="panel">

          <h2>
            Explicit Requirements
          </h2>

          <ul>

            @for (
              item
              of data.explicitRequirements ?? [];
              track item
            ) {

              <li>
                {{ item }}
              </li>

            } @empty {

              <li>
                None identified.
              </li>

            }

          </ul>

        </div>


        <div class="panel">

          <h2>
            Missing Requirements
          </h2>

          <ul>

            @for (
              item
              of data.missingRequirements ?? [];
              track item
            ) {

              <li>
                {{ item }}
              </li>

            } @empty {

              <li>
                None identified.
              </li>

            }

          </ul>

        </div>

      </div>


      <div class="panel">

        <h2>
          Acceptance Criteria
        </h2>

        <ul>

          @for (
            item
            of data.acceptanceCriteria ?? [];
            track item
          ) {

            <li>
              {{ item }}
            </li>

          }

        </ul>

      </div>


      <div class="panel">

        <h2>
          Implementation Plan
        </h2>

        <ol>

          @for (
            item
            of data.implementationPlan ?? [];
            track item
          ) {

            <li>
              {{ item }}
            </li>

          }

        </ol>

      </div>


      <div class="panel">

        <h2>
          Testing Plan
        </h2>

        <ul>

          @for (
            item
            of data.testingPlan ?? [];
            track item
          ) {

            <li>
              {{ item }}
            </li>

          }

        </ul>

      </div>


      <details class="panel">

        <summary>
          Raw issue analysis
        </summary>

        <pre>{{ data | json }}</pre>

      </details>

    }
  `,

  styles: [`
    li {
      margin-bottom: 8px;

      line-height: 1.55;
    }
  `],
})
export class IssueAnalysisComponent {

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected issueNumber:
    number | null =
      null;

  protected readonly report =
    signal<
      IssueAnalysis |
      null
    >(null);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal<string | null>(
      null,
    );


  protected analyze():
    void {

    const sessionId =
      this.session.sessionId();

    if (
      !sessionId ||
      !this.issueNumber
    ) {
      return;
    }


    this.loading.set(true);

    this.error.set(null);


    this.api
      .analyzeIssue(
        sessionId,
        Number(
          this.issueNumber,
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