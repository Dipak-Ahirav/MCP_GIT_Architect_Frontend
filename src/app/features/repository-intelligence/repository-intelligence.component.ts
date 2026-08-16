import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

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
  RepositoryIntelligenceResponse,
} from '../../core/models/analysis.model';

import {
  getApiError,
} from '../../core/utils/api-error';


@Component({
  selector:
    'app-repository-intelligence',

  imports: [
    JsonPipe,
    TitleCasePipe,
  ],

  template: `
    <div class="page-header">

      <div>

        <h1>
          Repository Intelligence
        </h1>

        <p>
          Multi-agent architecture, security, testing and technology analysis.
        </p>

      </div>

      <button
        class="btn btn-primary"
        [disabled]="
          loading() ||
          !session.hasRepository()
        "
        (click)="analyze()">

        {{
          loading()
            ? 'Analyzing...'
            : 'Analyze repository'
        }}

      </button>

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
            Overall Score
          </span>

          <span class="stat-value">
            {{ data.overallScore ?? '-' }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Project Type
          </span>

          <span class="stat-value">
            {{
              data.discovery?.projectType ??
              'Unknown'
            }}
          </span>

        </div>


        <div class="stat-card">

          <span class="stat-label">
            Engine
          </span>

          <span class="stat-value">
            {{
              data.engineVersion ??
              'v2'
            }}
          </span>

        </div>

      </div>


      <div class="panel">

        <h2>
          Specialists
        </h2>

        @for (
          specialist
          of data.specialistsRun ?? [];
          track specialist
        ) {

          <span class="badge specialist">
            {{ specialist }}
          </span>

        }

      </div>


      @if (
        data.analysis?.summary
      ) {

        <div class="panel">

          <h2>
            Summary
          </h2>

          <p>
            {{ data.analysis?.summary }}
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

          }

        </div>

      </div>


      @if (
        data.discovery;
        as discovery
      ) {

        <div class="panel">

          <h2>
            Stack Discovery
          </h2>

          <div class="stack-row">

            @for (
              framework
              of discovery.frameworks ?? [];
              track framework
            ) {

              <span class="badge">
                {{ framework }}
              </span>

            }

            @for (
              runtime
              of discovery.runtimes ?? [];
              track runtime
            ) {

              <span class="badge">
                {{ runtime }}
              </span>

            }

            @for (
              language
              of discovery.languages ?? [];
              track language
            ) {

              <span class="badge">
                {{ language }}
              </span>

            }

          </div>

        </div>

      }


      @if (
        data.analysis?.strengths?.length
      ) {

        <div class="panel">

          <h2>
            Strengths
          </h2>

          <ul>

            @for (
              strength
              of data.analysis?.strengths ?? [];
              track strength
            ) {

              <li>
                {{ strength }}
              </li>

            }

          </ul>

        </div>

      }


      @if (
        data.analysis?.findings?.length
      ) {

        <div class="panel">

          <h2>
            Findings
          </h2>

          @for (
            finding
            of data.analysis?.findings ?? [];
            track $index
          ) {

            <div class="finding">

              <div>

                <span class="badge">
                  {{
                    finding.severity ??
                    'info'
                  }}
                </span>

                <span class="badge">
                  {{
                    finding.category ??
                    'General'
                  }}
                </span>

              </div>

              <h4>
                {{
                  finding.title ??
                  finding.message ??
                  finding.description
                }}
              </h4>

              @if (
                finding.evidencePaths?.length
              ) {

                <small>
                  Evidence:
                  {{
                    finding
                      .evidencePaths
                      ?.join(', ')
                  }}
                </small>

              }

            </div>

          }

        </div>

      }


      @if (
        data.analysis
          ?.recommendations
          ?.length
      ) {

        <div class="panel">

          <h2>
            Recommendations
          </h2>

          <ol>

            @for (
              recommendation
              of data.analysis?.recommendations ?? [];
              track recommendation
            ) {

              <li>
                {{ recommendation }}
              </li>

            }

          </ol>

        </div>

      }


      <details class="panel">

        <summary>
          Raw analysis response
        </summary>

        <pre>
{{ data | json }}
        </pre>

      </details>

    }
  `,

  styles: [`
    .specialist {
      margin:
        0 6px 6px 0;
    }

    .stack-row {
      display: flex;

      flex-wrap: wrap;

      gap: 8px;
    }

    li {
      margin-bottom: 8px;

      line-height: 1.55;
    }
  `],
})
export class RepositoryIntelligenceComponent {

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected readonly report =
    signal<
      RepositoryIntelligenceResponse |
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
            ?.analysis
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


  protected analyze():
    void {

    const sessionId =
      this.session.sessionId();

    if (!sessionId) {
      return;
    }


    this.loading.set(true);

    this.error.set(null);


    this.api
      .analyzeRepository(
        sessionId,
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