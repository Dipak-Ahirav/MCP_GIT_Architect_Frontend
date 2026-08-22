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

import type {
  GitHubApprovalRequired,
} from '../../core/models/approval.model';

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
            autoFixLoading() ||
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

        <button
          class="btn btn-secondary"
          [disabled]="
            loading() ||
            autoFixLoading() ||
            !runId ||
            !session.hasRepository()
          "
          (click)="prepareAutoFix()">

          {{
            autoFixLoading()
              ? 'Preparing fix...'
              : 'Prepare CI Auto Fix'
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
            Workflow
          </span>

          <span class="stat-value">
            {{
              data.workflowRun?.workflowName ??
              'Unknown'
            }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Conclusion
          </span>

          <span class="stat-value">
            {{
              data.workflowRun?.conclusion ??
              data.workflowRun?.status ??
              '-'
            }}
          </span>

        </div>


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
              rootCauseConfidence(data) ??
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

          @if (rootCauseTitle(data)) {

            <h3>
              {{ rootCauseTitle(data) }}
            </h3>

          }

          <p>
            {{ rootCauseExplanation(data) }}
          </p>

          @if (rootCauseEvidence(data).length) {

            <h3>
              Evidence
            </h3>

            <ul>

              @for (
                evidence
                of rootCauseEvidence(data);
                track evidence
              ) {

                <li>
                  {{ evidence }}
                </li>

              }

            </ul>

          }

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

            <h3>
              {{ failedJobName(job) }}
            </h3>

            <p>
              {{ failedJobSummary(job) }}
            </p>

            @if (failedJobMeta(job).length) {

              <div class="meta-row">

                @for (
                  item
                  of failedJobMeta(job);
                  track item
                ) {

                  <span class="badge">
                    {{ item }}
                  </span>

                }

              </div>

            }

            @if (failedJobLogs(job).length) {

              <pre>{{ failedJobLogs(job).join('\n') }}</pre>

            }

          </div>

        } @empty {

          <p class="muted">
            No failed jobs reported.
          </p>

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
              <strong>
                {{ fixTitle(fix) }}
              </strong>

              <p>
                {{ fixDescription(fix) }}
              </p>

              @if (fixFiles(fix).length) {

                <p class="muted">
                  Files:
                  {{ fixFiles(fix).join(', ') }}
                </p>

              }

              @if (fixValidation(fix)) {

                <p class="muted">
                  Validation:
                  {{ fixValidation(fix) }}
                </p>

              }
            </li>

          } @empty {

            <li>
              No proposed fixes reported.
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


      @if (
        data.relatedCode?.length
      ) {

        <div class="panel">

          <h2>
            Related Code
          </h2>

          @for (
            item
            of data.relatedCode ?? [];
            track item
          ) {

            <div class="finding">

              <h3>
                {{ relatedCodePath(item) }}
              </h3>

              <p>
                {{ relatedCodeRelevance(item) }}
              </p>

              @if (relatedCodeLikelyCause(item)) {

                <span class="badge">
                  likely cause
                </span>

              }

            </div>

          }

        </div>

      }


      @if (
        data.reproduction?.length
      ) {

        <div class="panel">

          <h2>
            Reproduction
          </h2>

          <ol>

            @for (
              step
              of data.reproduction ?? [];
              track step
            ) {

              <li>
                {{ step }}
              </li>

            }

          </ol>

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

          } @empty {

            <li>
              No validation plan reported.
            </li>

          }

        </ul>

      </div>


      @if (
        data.environmentalFactors?.length ||
        data.filesInspected?.length ||
        data.logsInspected?.length ||
        data.limitations?.length
      ) {

        <div class="panel">

          <h2>
            Evidence and Limitations
          </h2>

          @if (data.environmentalFactors?.length) {

            <h3>
              Environment
            </h3>

            <ul>

              @for (
                item
                of data.environmentalFactors ?? [];
                track item
              ) {

                <li>
                  {{ item }}
                </li>

              }

            </ul>

          }

          @if (data.filesInspected?.length) {

            <h3>
              Files Inspected
            </h3>

            <ul>

              @for (
                file
                of data.filesInspected ?? [];
                track file
              ) {

                <li>
                  {{ file }}
                </li>

              }

            </ul>

          }

          @if (data.logsInspected?.length) {

            <h3>
              Logs Inspected
            </h3>

            <ul>

              @for (
                log
                of data.logsInspected ?? [];
                track log
              ) {

                <li>
                  {{ log }}
                </li>

              }

            </ul>

          }

          @if (data.limitations?.length) {

            <h3>
              Limitations
            </h3>

            <ul>

              @for (
                limitation
                of data.limitations ?? [];
                track limitation
              ) {

                <li>
                  {{ limitation }}
                </li>

              }

            </ul>

          }

        </div>

      }


      <details class="panel">

        <summary>
          Raw debugger output
        </summary>

        <pre>{{ data | json }}</pre>

      </details>

    }


    @if (
      approval();
      as pending
    ) {

      <div class="approval-panel">

        <span class="badge badge-warning">
          APPROVAL REQUIRED
        </span>

        <h2>
          Review CI auto-fix action
        </h2>

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

            <pre>{{ action.arguments | json }}</pre>

            <div class="approval-actions">

              <button
                class="btn btn-success"
                [disabled]="resolving()"
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
                [disabled]="resolving()"
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


    @if (autoFixMessage()) {

      <div class="panel">

        <span class="badge badge-success">
          CI Auto Fix
        </span>

        <p>
          {{ autoFixMessage() }}
        </p>

      </div>

    }
  `,

  styles: [`
    .finding {
      margin-bottom: 12px;

      padding: 14px;

      border:
        1px solid #e2e8f0;

      border-radius: 10px;

      background: #f8fafc;
    }

    .finding h3 {
      margin:
        0 0 7px;

      font-size: 1rem;
    }

    .finding p {
      margin:
        0 0 8px;

      line-height: 1.55;
    }

    .panel h3 {
      margin:
        14px 0 7px;

      font-size: 1rem;
    }

    .panel p,
    .panel li {
      line-height: 1.55;
    }

    .meta-row {
      display: flex;

      flex-wrap: wrap;

      gap: 8px;

      margin-bottom: 10px;
    }

    .muted {
      color: #64748b;
    }

    .approval-panel {
      margin-top: 24px;

      padding: 22px;

      border:
        2px solid #f59e0b;

      background: #fffbeb;

      border-radius: 14px;
    }

    .approval-panel h2 {
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

    pre {
      overflow: auto;

      padding: 12px;

      border-radius: 8px;

      background: #0f172a;

      color: #e2e8f0;

      white-space: pre-wrap;
    }
  `],
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

  protected readonly autoFixLoading =
    signal(false);

  protected readonly resolving =
    signal(false);

  protected readonly approval =
    signal<
      GitHubApprovalRequired |
      null
    >(null);

  protected readonly autoFixMessage =
    signal<string | null>(
      null,
    );

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

    this.autoFixMessage.set(null);

    this.approval.set(null);


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


  protected prepareAutoFix():
    void {

    const sessionId =
      this.session.sessionId();

    if (
      !sessionId ||
      !this.runId
    ) {
      return;
    }

    this.autoFixLoading.set(true);

    this.error.set(null);

    this.autoFixMessage.set(null);

    this.approval.set(null);

    this.api
      .prepareCiAutoFix(
        sessionId,
        Number(
          this.runId,
        ),
        this.report() ?? undefined,
      )
      .subscribe({

        next:
          result => {

            this.autoFixLoading.set(false);

            if (
              result.analysis
            ) {
              this.report.set(
                result.analysis,
              );
            }

            if (
              result.status ===
              'approval_required'
            ) {
              this.approval.set(
                result,
              );

              return;
            }

            this.autoFixMessage.set(
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

            this.autoFixLoading.set(false);
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

    if (!pending.approvalId) {
      this.error.set(
        'Approval id is missing. Prepare the CI auto fix again.',
      );

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
                  result.actions ?? [],
              });

              return;
            }

            this.approval.set(
              null,
            );

            this.autoFixMessage.set(
              result.response ??
              (
                decision === 'approve'
                  ? 'CI auto fix completed.'
                  : 'CI auto fix rejected.'
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


  protected rootCauseTitle(
    data: CiDebugAnalysis,
  ): string {

    if (
      typeof data.rootCause ===
      'string'
    ) {
      return '';
    }

    return data.rootCause?.title ?? '';
  }


  protected rootCauseExplanation(
    data: CiDebugAnalysis,
  ): string {

    if (
      typeof data.rootCause ===
      'string'
    ) {
      return data.rootCause;
    }

    return data.rootCause?.explanation ?? '';
  }


  protected rootCauseConfidence(
    data: CiDebugAnalysis,
  ): string {

    if (
      typeof data.rootCause ===
      'string'
    ) {
      return '';
    }

    return data.rootCause?.confidence ?? '';
  }


  protected rootCauseEvidence(
    data: CiDebugAnalysis,
  ): string[] {

    if (
      typeof data.rootCause ===
      'string'
    ) {
      return [];
    }

    return data.rootCause?.evidence ?? [];
  }


  protected failedJobName(
    job: NonNullable<CiDebugAnalysis['failedJobs']>[number],
  ): string {

    if (
      typeof job ===
      'string'
    ) {
      return job;
    }

    return job.name ?? 'Failed job';
  }


  protected failedJobSummary(
    job: NonNullable<CiDebugAnalysis['failedJobs']>[number],
  ): string {

    if (
      typeof job ===
      'string'
    ) {
      return '';
    }

    return job.errorSummary ?? '';
  }


  protected failedJobMeta(
    job: NonNullable<CiDebugAnalysis['failedJobs']>[number],
  ): string[] {

    if (
      typeof job ===
      'string'
    ) {
      return [];
    }

    return [
      job.conclusion,
      job.failedStep
        ? `failed step: ${job.failedStep}`
        : '',
      job.jobId
        ? `job ${job.jobId}`
        : '',
    ].filter(Boolean) as string[];
  }


  protected failedJobLogs(
    job: NonNullable<CiDebugAnalysis['failedJobs']>[number],
  ): string[] {

    if (
      typeof job ===
      'string'
    ) {
      return [];
    }

    return job.relevantLogLines ?? [];
  }


  protected fixTitle(
    fix: NonNullable<CiDebugAnalysis['proposedFixes']>[number],
  ): string {

    if (
      typeof fix ===
      'string'
    ) {
      return fix;
    }

    return fix.title ?? 'Proposed fix';
  }


  protected fixDescription(
    fix: NonNullable<CiDebugAnalysis['proposedFixes']>[number],
  ): string {

    if (
      typeof fix ===
      'string'
    ) {
      return '';
    }

    return fix.description ?? '';
  }


  protected fixFiles(
    fix: NonNullable<CiDebugAnalysis['proposedFixes']>[number],
  ): string[] {

    if (
      typeof fix ===
      'string'
    ) {
      return [];
    }

    return fix.files ?? [];
  }


  protected fixValidation(
    fix: NonNullable<CiDebugAnalysis['proposedFixes']>[number],
  ): string {

    if (
      typeof fix ===
      'string'
    ) {
      return '';
    }

    return fix.validation ?? '';
  }


  protected relatedCodePath(
    item: NonNullable<CiDebugAnalysis['relatedCode']>[number],
  ): string {

    if (
      typeof item ===
      'string'
    ) {
      return item;
    }

    return item.path ?? 'Related code';
  }


  protected relatedCodeRelevance(
    item: NonNullable<CiDebugAnalysis['relatedCode']>[number],
  ): string {

    if (
      typeof item ===
      'string'
    ) {
      return '';
    }

    return item.relevance ?? '';
  }


  protected relatedCodeLikelyCause(
    item: NonNullable<CiDebugAnalysis['relatedCode']>[number],
  ): boolean {

    return (
      typeof item !== 'string' &&
      item.likelyCause === true
    );
  }
}
