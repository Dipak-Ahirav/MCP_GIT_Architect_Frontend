import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  GithubApiService,
} from '../../core/api/github-api.service';

import {
  AgentApiService,
} from '../../core/api/agent-api.service';

import {
  AppSessionService,
} from '../../core/state/app-session.service';

import type {
  Repository,
} from '../../core/models/repository.model';

import {
  getApiError,
} from '../../core/utils/api-error';


@Component({
  selector:
    'app-repositories',

  template: `
    <div class="page-header">

      <div>
        <h1>
          Repositories
        </h1>

        <p>
          Select the GitHub repository GitArchitect should work with.
        </p>
      </div>

      <button
        class="btn btn-secondary"
        (click)="loadRepositories()">

        Refresh

      </button>

    </div>


    <div class="panel">

      <input
        class="input"
        placeholder="Search repositories..."
        (input)="
          search.set(
            $any($event.target).value
          )
        "
      />

    </div>


    @if (error()) {

      <div class="error-box">
        {{ error() }}
      </div>

    }


    @if (loading()) {

      <div class="loading">
        Loading GitHub repositories...
      </div>

    } @else {

      <div class="repository-grid">

        @for (
          repository
          of filteredRepositories();
          track repository.id
        ) {

          <article
            class="repository-card"
            [class.selected]="
              session.repository()?.fullName ===
              repository.fullName
            ">

            <div class="repository-heading">

              <div>

                <h3>
                  {{ repository.fullName }}
                </h3>

                <span class="badge">
                  {{
                    repository.isPrivate
                      ? 'Private'
                      : 'Public'
                  }}
                </span>

              </div>

            </div>


            <p>
              {{
                repository.description ??
                'No repository description.'
              }}
            </p>


            <div class="repo-meta">

              <span>
                Branch:
                {{ repository.defaultBranch }}
              </span>

              @if (repository.language) {

                <span>
                  {{ repository.language }}
                </span>

              }

            </div>


            <button
              class="btn"
              [class.btn-primary]="
                session.repository()?.fullName !==
                repository.fullName
              "
              [class.btn-success]="
                session.repository()?.fullName ===
                repository.fullName
              "
              [disabled]="
                selecting() ===
                repository.fullName
              "
              (click)="selectRepository(repository)">

              @if (
                session.repository()?.fullName ===
                repository.fullName
              ) {

                Selected

              } @else if (
                selecting() ===
                repository.fullName
              ) {

                Selecting...

              } @else {

                Select repository

              }

            </button>

          </article>

        } @empty {

          <div class="panel">
            No repositories found.
          </div>

        }

      </div>

    }
  `,

  styles: [`
    .repository-grid {
      display: grid;

      grid-template-columns:
        repeat(
          auto-fit,
          minmax(310px, 1fr)
        );

      gap: 16px;
    }

    .repository-card {
      padding: 20px;

      background: white;

      border:
        1px solid #e2e8f0;

      border-radius: 14px;
    }

    .repository-card.selected {
      border-color: #4f46e5;

      box-shadow:
        0 0 0 2px
        rgb(79 70 229 / 8%);
    }

    .repository-card h3 {
      margin:
        0 0 8px;

      font-size: 16px;
    }

    .repository-card p {
      min-height: 46px;

      color: #64748b;

      line-height: 1.5;
    }

    .repo-meta {
      display: flex;

      gap: 12px;

      margin:
        15px 0;

      color: #64748b;

      font-size: 13px;
    }
  `],
})
export class RepositoriesComponent
  implements OnInit {

  private readonly github =
    inject(
      GithubApiService,
    );

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected readonly repositories =
    signal<Repository[]>([]);

  protected readonly search =
    signal('');

  protected readonly loading =
    signal(false);

  protected readonly selecting =
    signal<string | null>(
      null,
    );

  protected readonly error =
    signal<string | null>(
      null,
    );


  protected readonly filteredRepositories =
    computed(
      () => {

        const term =
          this.search()
            .trim()
            .toLowerCase();

        if (!term) {
          return this.repositories();
        }

        return this.repositories()
          .filter(
            repository =>
              repository.fullName
                .toLowerCase()
                .includes(term) ||
              repository.description
                ?.toLowerCase()
                .includes(term),
          );
      },
    );


  ngOnInit(): void {
    this.loadRepositories();
  }


  protected loadRepositories():
    void {

    this.loading.set(true);

    this.error.set(null);


    this.github
      .repositories()
      .subscribe({

        next:
          repositories => {

            this.repositories.set(
              repositories,
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


  protected selectRepository(
    repository: Repository,
  ): void {

    const sessionId =
      this.session.sessionId();

    if (!sessionId) {

      this.error.set(
        'No active GitArchitect session.',
      );

      return;
    }


    this.selecting.set(
      repository.fullName,
    );

    this.error.set(null);


    this.api
      .selectRepository(
        sessionId,
        repository.owner,
        repository.repo,
      )
      .subscribe({

        next:
          selected => {

            this.session
              .setRepository(
                selected ??
                repository,
              );

            this.selecting.set(
              null,
            );
          },

        error:
          error => {

            this.error.set(
              getApiError(
                error,
              ),
            );

            this.selecting.set(
              null,
            );
          },
      });
  }
}