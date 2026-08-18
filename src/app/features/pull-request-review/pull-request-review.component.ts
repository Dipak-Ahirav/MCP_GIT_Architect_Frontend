import {
  Component,
  computed,
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
            Pull Request
          </span>

          <span class="stat-value">
            {{
              data.pullRequest?.number
                ? '#' + data.pullRequest?.number
                : '#' + pullNumber
            }}
          </span>

          @if (data.pullRequest?.status) {
            <span class="badge">
              {{ data.pullRequest?.status }}
            </span>
          }
        </div>

        <div class="stat-card">
          <span class="stat-label">
            Recommendation
          </span>

          <span class="stat-value">
            {{
              data.reviewRecommendation ??
              '-'
            }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label">
            Risk
          </span>

          <span class="stat-value">
            {{ data.riskLevel ?? '-' }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label">
            Overall Score
          </span>

          <span class="stat-value">
            {{
              data.scores?.['overall'] ??
              '-'
            }}
          </span>
        </div>
      </div>

      @if (
        data.pullRequest?.title ||
        data.pullRequest?.author
      ) {
        <div class="panel">
          @if (data.pullRequest?.title) {
            <h2>
              {{ data.pullRequest?.title }}
            </h2>
          }

          <div class="meta-row">
            @if (data.pullRequest?.author) {
              <span class="badge">
                {{ data.pullRequest?.author }}
              </span>
            }

            @if (data.pullRequest?.baseBranch) {
              <span class="badge">
                base: {{ data.pullRequest?.baseBranch }}
              </span>
            }

            @if (data.pullRequest?.headBranch) {
              <span class="badge">
                head: {{ data.pullRequest?.headBranch }}
              </span>
            }
          </div>
        </div>
      }

      <div class="grid">
        <div class="stat-card">
          <span class="stat-label">
            Changed Files
          </span>

          <span class="stat-value">
            {{
              data.pullRequest?.changedFiles ??
              data.filesReviewed?.length ??
              0
            }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label">
            Additions
          </span>

          <span class="stat-value">
            {{
              data.pullRequest?.additions ??
              0
            }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label">
            Deletions
          </span>

          <span class="stat-value">
            {{
              data.pullRequest?.deletions ??
              0
            }}
          </span>
        </div>

        <div class="stat-card">
          <span class="stat-label">
            Check Status
          </span>

          <span class="stat-value">
            {{
              data.checks?.status ??
              'unknown'
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

      <div class="panel">
        <h2>
          Scores
        </h2>

        <div class="score-grid">
          @for (
            score
            of scores();
            track score.key
          ) {
            <div class="score">
              <span>
                {{ score.key | titlecase }}
              </span>

              <strong>
                {{ score.value }}
              </strong>
            </div>
          } @empty {
            <p>
              No scores reported.
            </p>
          }
        </div>
      </div>

      <div class="grid">
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
            } @empty {
              <li>
                None reported.
              </li>
            }
          </ul>
        </div>

        <div class="panel">
          <h2>
            Files Reviewed
          </h2>

          <ul>
            @for (
              file
              of data.filesReviewed ?? [];
              track file
            ) {
              <li>
                {{ file }}
              </li>
            } @empty {
              <li>
                No files reviewed.
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="grid">
        <div class="panel">
          <h2>
            Testing Assessment
          </h2>

          <span class="badge">
            {{
              data.testingAssessment?.confidence ??
              'unknown'
            }}
          </span>

          <ul>
            @for (
              note
              of data.testingAssessment?.notes ?? [];
              track note
            ) {
              <li>
                {{ note }}
              </li>
            } @empty {
              <li>
                No testing assessment notes.
              </li>
            }
          </ul>
        </div>

        <div class="panel">
          <h2>
            Checks
          </h2>

          <span class="badge">
            {{
              data.checks?.status ??
              'unknown'
            }}
          </span>

          <ul>
            @for (
              note
              of data.checks?.notes ?? [];
              track note
            ) {
              <li>
                {{ note }}
              </li>
            } @empty {
              <li>
                No check notes reported.
              </li>
            }
          </ul>
        </div>
      </div>

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
            <div class="meta-row">
              <span class="badge">
                {{
                  finding.severity ??
                  'info'
                }}
              </span>

              @if (finding.category) {
                <span class="badge">
                  {{ finding.category }}
                </span>
              }
            </div>

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

            @if (finding.description) {
              <p>
                {{ finding.description }}
              </p>
            }

            @if (finding.whyItMatters) {
              <p>
                <strong>
                  Why it matters:
                </strong>
                {{ finding.whyItMatters }}
              </p>
            }

            @if (
              finding.suggestion ||
              finding.recommendation
            ) {
              <p>
                <strong>
                  Suggestion:
                </strong>
                {{
                  finding.suggestion ??
                  finding.recommendation
                }}
              </p>
            }
          </div>
        } @empty {
          <p>
            No review findings reported.
          </p>
        }
      </div>

      <div class="panel">
        <h2>
          Limitations
        </h2>

        <ul>
          @for (
            limitation
            of data.limitations ?? [];
            track limitation
          ) {
            <li>
              {{ limitation }}
            </li>
          } @empty {
            <li>
              None reported.
            </li>
          }
        </ul>
      </div>

      <details class="panel">
        <summary>
          Raw review
        </summary>

        <pre>{{ data | json }}</pre>
      </details>
    }
  `,

  styles: [`
    .meta-row {
      display: flex;

      flex-wrap: wrap;

      gap: 8px;
    }

    .stat-card {
      display: grid;

      align-content: start;

      gap: 8px;
    }

    li {
      margin-bottom: 8px;

      line-height: 1.55;
    }

    p {
      line-height: 1.55;
    }

    small {
      display: block;

      color: #64748b;

      line-height: 1.5;

      overflow-wrap: anywhere;
    }
  `],
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

  protected readonly scores =
    computed(
      () =>
        Object.entries(
          this.report()
            ?.scores ??
          {},
        )
          .filter(
            ([, value]) =>
              value !== null &&
              value !== undefined,
          )
          .map(
            ([key, value]) => ({
              key,
              value,
            }),
          ),
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
