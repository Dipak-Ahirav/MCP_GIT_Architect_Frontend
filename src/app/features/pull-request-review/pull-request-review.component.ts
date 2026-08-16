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
  TitleCasePipe,
} from '@angular/common';

import {
  AgentApiService,
} from '../../core/api/agent-api.service';

import {
  AppSessionService,
} from '../../core/state/app-session.service';

import type {
  PullRequestReview,
} from '../../core/models/analysis.model';

import {
  getApiError,
} from '../../core/utils/api-error';


@Component({
  selector:
    'app-pull-request-review',

  imports: [
    FormsModule,
    JsonPipe,
    TitleCasePipe,
  ],

  template: `
    <div class="page-header">

      <div>

        <h1>
          Pull Request Review
        </h1>

        <p>
          Review code changes using repository context and GitHub MCP.
        </p>

      </div>

    </div>


    <div class="panel">

      <div class="form-row">

        <input
          class="input"
          type="number"
          min="1"
          [(ngModel)]="pullNumber"
          placeholder="PR number"
        />

        <button
          class="btn btn-primary"
          [disabled]="
            loading() ||
            !pullNumber ||
            !session.hasRepository()
          "
          (click)="review()">

          {{
            loading()
              ? 'Reviewing...'
              : 'Review PR'
          }}

        </button>

      </div>

    </div>


    @if (!session.hasRepository()) {

      <div class="info-box">
        Select a repository first.
      </div>

    }


    @if (error()) {

      <div class="error-box">
        {{ error() }}
      </div>

    }


    @if (report(); as data) {

      <div class="grid">

        <div class="stat-card">

          <span class="stat-label">
            Recommendation
          </span>

          <span class="stat-value">
            {{
              data.recommendation ??
              '-'
            }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Risk
          </span>

          <span class="stat-value">
            {{ data.risk ?? '-' }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Files Reviewed
          </span>

          <span class="stat-value">
            {{
              data.filesReviewed
                ?.length ??
              0
            }}
          </span>

        </div>

      </div>


      @if (data.summary) {

        <div class="panel">

          <h2>
            Review Summary
          </h2>

          <p>
            {{ data.summary }}
          </p>

        </div>

      }


      @if (data.positives?.length) {

        <div class="panel">

          <h2>
            Positives
          </h2>

          <ul>

            @for (
              positive
              of data.positives ?? [];
              track positive
            ) {

              <li>
                {{ positive }}
              </li>

            }

          </ul>

        </div>

      }


      <div class="panel">

        <h2>
          Findings
        </h2>

        @for (
          finding
          of data.findings ?? [];
          track $index
        ) {

          <div class="finding">

            <span class="badge">
              {{
                finding.severity ??
                'info'
              }}
            </span>

            <h4>
              {{
                finding.title ??
                finding.message ??
                finding.description
              }}
            </h4>

            @if (finding.path) {

              <small>
                {{ finding.path }}

                @if (finding.line) {
                  :{{ finding.line }}
                }

              </small>

            }

            @if (
              finding.recommendation
            ) {

              <p>
                {{ finding.recommendation }}
              </p>

            }

          </div>

        } @empty {

          <p>
            No review findings reported.
          </p>

        }

      </div>


      <details class="panel">

        <summary>
          Raw review
        </summary>

        <pre>{{ data | json }}</pre>

      </details>

    }
  `,
})
export class PullRequestReviewComponent {

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected pullNumber:
    number | null =
      null;

  protected readonly report =
    signal<
      PullRequestReview |
      null
    >(null);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal<string | null>(
      null,
    );


  protected review():
    void {

    const sessionId =
      this.session.sessionId();

    if (
      !sessionId ||
      !this.pullNumber
    ) {
      return;
    }


    this.loading.set(true);

    this.error.set(null);

    this.report.set(null);


    this.api
      .reviewPullRequest(
        sessionId,
        Number(
          this.pullNumber,
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