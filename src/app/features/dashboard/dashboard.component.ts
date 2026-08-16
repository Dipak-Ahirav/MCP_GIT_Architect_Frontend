import {
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  RouterLink,
} from '@angular/router';

import {
  AppSessionService,
} from '../../core/state/app-session.service';

import {
  GithubApiService,
  type GitHubAuthStatus,
} from '../../core/api/github-api.service';


@Component({
  selector:
    'app-dashboard',

  imports: [
    RouterLink,
  ],

  template: `
    <div class="page-header">

      <div>
        <h1>
          GitArchitect
        </h1>

        <p>
          Your AI engineering workspace for GitHub repositories.
        </p>
      </div>

      @if (auth(); as github) {

        <span
          class="badge"
          [class.badge-success]="github.connected">

          GitHub
          {{ github.connected ? 'Connected' : 'Disconnected' }}

        </span>

      }

    </div>


    <div class="grid">

      <div class="stat-card">

        <span class="stat-label">
          Session
        </span>

        <span class="stat-value">
          {{ session.hasSession() ? 'Active' : 'Not active' }}
        </span>

      </div>


      <div class="stat-card">

        <span class="stat-label">
          Repository
        </span>

        <span class="stat-value">
          {{
            session.repository()?.fullName ??
            'Not selected'
          }}
        </span>

      </div>


      <div class="stat-card">

        <span class="stat-label">
          GitHub Writes
        </span>

        <span class="stat-value">
          Human Approved
        </span>

      </div>

    </div>


    <div class="panel">

      <h2>
        Engineering workflows
      </h2>

      <div class="grid">

        <a
          class="workflow"
          routerLink="/repositories">

          <strong>
            Repository
          </strong>

          <span>
            Select the repository GitArchitect should understand.
          </span>

        </a>


        <a
          class="workflow"
          routerLink="/chat">

          <strong>
            AI Chat
          </strong>

          <span>
            Ask questions about the active repository.
          </span>

        </a>


        <a
          class="workflow"
          routerLink="/repository-intelligence">

          <strong>
            Repository Intelligence
          </strong>

          <span>
            Run architecture, security, testing and stack analysis.
          </span>

        </a>


        <a
          class="workflow"
          routerLink="/pull-request-review">

          <strong>
            PR Review
          </strong>

          <span>
            Review a pull request using repository context.
          </span>

        </a>


        <a
          class="workflow"
          routerLink="/issue-analysis">

          <strong>
            Issue Analyzer
          </strong>

          <span>
            Understand requirements, impact and implementation.
          </span>

        </a>


        <a
          class="workflow"
          routerLink="/ci-debugger">

          <strong>
            CI Debugger
          </strong>

          <span>
            Diagnose failed GitHub Actions runs.
          </span>

        </a>


        <a
          class="workflow"
          routerLink="/github-writes">

          <strong>
            GitHub Actions
          </strong>

          <span>
            Perform human-approved GitHub mutations.
          </span>

        </a>

      </div>

    </div>
  `,

  styles: [`
    .grid {
      margin-bottom: 20px;
    }

    .workflow {
      display: flex;
      flex-direction: column;
      gap: 7px;

      padding: 18px;

      border:
        1px solid #e2e8f0;

      border-radius: 12px;

      text-decoration: none;

      color: #0f172a;

      transition: .15s ease;
    }

    .workflow:hover {
      border-color: #818cf8;

      transform:
        translateY(-1px);
    }

    .workflow span {
      color: #64748b;

      line-height: 1.5;
    }
  `],
})
export class DashboardComponent
  implements OnInit {

  protected readonly session =
    inject(
      AppSessionService,
    );

  private readonly github =
    inject(
      GithubApiService,
    );

  protected readonly auth =
    signal<
      GitHubAuthStatus |
      null
    >(null);


  ngOnInit(): void {

    this.github
      .authStatus()
      .subscribe({
        next:
          status =>
            this.auth.set(
              status,
            ),

        error:
          () =>
            this.auth.set({
              connected:
                false,
            }),
      });
  }
}