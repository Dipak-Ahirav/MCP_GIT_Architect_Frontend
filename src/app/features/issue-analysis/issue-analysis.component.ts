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
    TitleCasePipe,
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
            Issue
          </span>

          <span class="stat-value">
            {{
              data.issue?.number
                ? '#' + data.issue?.number
                : '#' + issueNumber
            }}
          </span>

          @if (data.issue?.state) {

            <span class="badge">
              {{ data.issue?.state }}
            </span>

          }

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Type
          </span>

          <span class="stat-value">
            {{
              data.issueType ??
              'unknown'
            }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Readiness
          </span>

          <span class="stat-value">
            {{
              data.implementationReadiness ??
              '-'
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


      @if (
        data.issue?.title ||
        data.issue?.author ||
        data.issue?.labels?.length
      ) {

        <div class="panel">

          @if (data.issue?.title) {

            <h2>
              {{ data.issue?.title }}
            </h2>

          }

          <div class="meta-row">

            @if (data.issue?.author) {

              <span class="badge">
                {{ data.issue?.author }}
              </span>

            }

            @for (
              label
              of data.issue?.labels ?? [];
              track label
            ) {

              <span class="badge">
                {{ label }}
              </span>

            }

          </div>

        </div>

      }


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


      @if (data.problemStatement) {

        <div class="panel">

          <h2>
            Problem Statement
          </h2>

          <p>
            {{ data.problemStatement }}
          </p>

        </div>

      }


      @if (
        data.rootCauseAnalysis?.applicable ||
        data.rootCauseAnalysis?.hypothesis
      ) {

        <div class="panel">

          <h2>
            Root Cause Hypothesis
          </h2>

          <p>
            {{
              data.rootCauseAnalysis?.hypothesis ||
              'No root cause hypothesis provided.'
            }}
          </p>

          <div class="meta-row">

            <span class="badge">
              {{
                data.rootCauseAnalysis?.confidence ??
                'unknown'
              }}
            </span>

            @for (
              path
              of data.rootCauseAnalysis?.evidencePaths ?? [];
              track path
            ) {

              <span class="badge">
                {{ path }}
              </span>

            }

          </div>

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
              of data.requirements?.explicit ?? [];
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
            Inferred Requirements
          </h2>

          <ul>

            @for (
              item
              of data.requirements?.inferred ?? [];
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
              of data.requirements?.missing ?? [];
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

          @empty {

            <li>
              None reported.
            </li>

          }

        </ul>

      </div>


      @if (data.affectedAreas?.length) {

        <div class="panel">

          <h2>
            Affected Areas
          </h2>

          <div class="card-list">

            @for (
              area
              of data.affectedAreas ?? [];
              track $index
            ) {

              <div class="detail-card">

                <h3>
                  {{ area.area ?? 'Area' }}
                </h3>

                <p>
                  {{ area.reason }}
                </p>

                @if (area.evidencePaths?.length) {

                  <small>
                    Evidence:
                    {{
                      area.evidencePaths?.join(', ')
                    }}
                  </small>

                }

              </div>

            }

          </div>

        </div>

      }


      <div class="panel">

        <h2>
          Implementation Plan
        </h2>

        <ol>

          @for (
            step
            of data.implementationPlan ?? [];
            track step.order ?? $index
          ) {

            <li>
              <strong>
                {{
                  step.title ??
                  'Step'
                }}
              </strong>

              <p>
                {{ step.description }}
              </p>

              @if (step.files?.length) {

                <small>
                  Files:
                  {{ step.files?.join(', ') }}
                </small>

              }

              @if (step.validation) {

                <small>
                  Validation:
                  {{ step.validation }}
                </small>

              }
            </li>

          } @empty {

            <li>
              No implementation steps reported.
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
            test
            of data.testingPlan ?? [];
            track $index
          ) {

            <li>
              <strong>
                {{
                  test.type ??
                  'test'
                    | titlecase
                }}
              </strong>

              <p>
                {{ test.scenario }}
              </p>

              @if (test.expectedResult) {

                <small>
                  Expected:
                  {{ test.expectedResult }}
                </small>

              }
            </li>

          } @empty {

            <li>
              No testing steps reported.
            </li>

          }

        </ul>

      </div>


      <div class="grid">

        <div class="panel">

          <h2>
            Risks
          </h2>

          <div class="card-list">

            @for (
              risk
              of data.risks ?? [];
              track $index
            ) {

              <div class="detail-card">

                <span class="badge">
                  {{ risk.level ?? 'risk' }}
                </span>

                <h3>
                  {{ risk.risk }}
                </h3>

                @if (risk.mitigation) {

                  <p>
                    {{ risk.mitigation }}
                  </p>

                }

              </div>

            } @empty {

              <p>
                No risks reported.
              </p>

            }

          </div>

        </div>


        <div class="panel">

          <h2>
            Questions
          </h2>

          <ul>

            @for (
              question
              of data.questions ?? [];
              track question
            ) {

              <li>
                {{ question }}
              </li>

            } @empty {

              <li>
                No open questions.
              </li>

            }

          </ul>

        </div>

      </div>


      <div class="grid">

        <div class="panel">

          <h2>
            Related Files
          </h2>

          <div class="card-list">

            @for (
              file
              of data.relatedFiles ?? [];
              track file.path ?? $index
            ) {

              <div class="detail-card">

                <h3>
                  {{ file.path }}
                </h3>

                <p>
                  {{ file.relevance }}
                </p>

                <span class="badge">
                  {{
                    file.likelyChange
                      ? 'likely change'
                      : 'reference'
                  }}
                </span>

              </div>

            } @empty {

              <p>
                No related files reported.
              </p>

            }

          </div>

        </div>


        <div class="panel">

          <h2>
            Related Pull Requests
          </h2>

          <div class="card-list">

            @for (
              pr
              of data.relatedPullRequests ?? [];
              track pr.number ?? $index
            ) {

              <div class="detail-card">

                <h3>
                  #{{ pr.number }}
                </h3>

                <p>
                  {{ pr.relationship }}
                </p>

              </div>

            } @empty {

              <p>
                No related pull requests reported.
              </p>

            }

          </div>

        </div>

      </div>


      <div class="grid">

        <div class="panel">

          <h2>
            Files Inspected
          </h2>

          <ul>

            @for (
              file
              of data.filesInspected ?? [];
              track file
            ) {

              <li>
                {{ file }}
              </li>

            } @empty {

              <li>
                No files inspected.
              </li>

            }

          </ul>

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
    .meta-row {
      display: flex;

      flex-wrap: wrap;

      gap: 8px;
    }

    .card-list {
      display: grid;

      gap: 12px;
    }

    .detail-card {
      border:
        1px solid #e2e8f0;

      border-radius: 8px;

      background: #f8fafc;

      padding: 14px;
    }

    .detail-card h3 {
      margin:
        8px 0 6px;

      font-size: 15px;

      overflow-wrap: anywhere;
    }

    .detail-card p,
    li p {
      margin:
        6px 0;

      color: #334155;
    }

    small {
      display: block;

      color: #64748b;

      line-height: 1.5;

      overflow-wrap: anywhere;
    }

    li {
      margin-bottom: 8px;

      line-height: 1.55;
    }

    .stat-card {
      display: grid;

      align-content: start;

      gap: 8px;
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

    this.report.set(null);


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
