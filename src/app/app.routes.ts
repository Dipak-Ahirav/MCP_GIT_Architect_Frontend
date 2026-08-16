import type {
  Routes,
} from '@angular/router';


export const routes:
  Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo:
      'dashboard',
  },

  {
    path:
      'dashboard',

    loadComponent:
      () =>
        import(
          './features/dashboard/dashboard.component'
        ).then(
          m =>
            m.DashboardComponent,
        ),
  },

  {
    path:
      'repositories',

    loadComponent:
      () =>
        import(
          './features/repositories/repositories.component'
        ).then(
          m =>
            m.RepositoriesComponent,
        ),
  },

  {
    path:
      'chat',

    loadComponent:
      () =>
        import(
          './features/chat/chat.component'
        ).then(
          m =>
            m.ChatComponent,
        ),
  },

  {
    path:
      'repository-intelligence',

    loadComponent:
      () =>
        import(
          './features/repository-intelligence/repository-intelligence.component'
        ).then(
          m =>
            m.RepositoryIntelligenceComponent,
        ),
  },

  {
    path:
      'pull-request-review',

    loadComponent:
      () =>
        import(
          './features/pull-request-review/pull-request-review.component'
        ).then(
          m =>
            m.PullRequestReviewComponent,
        ),
  },

  {
    path:
      'issue-analysis',

    loadComponent:
      () =>
        import(
          './features/issue-analysis/issue-analysis.component'
        ).then(
          m =>
            m.IssueAnalysisComponent,
        ),
  },

  {
    path:
      'ci-debugger',

    loadComponent:
      () =>
        import(
          './features/ci-debugger/ci-debugger.component'
        ).then(
          m =>
            m.CiDebuggerComponent,
        ),
  },

  {
    path:
      'github-writes',

    loadComponent:
      () =>
        import(
          './features/github-writes/github-writes.component'
        ).then(
          m =>
            m.GithubWritesComponent,
        ),
  },

  {
    path:
      '**',

    redirectTo:
      'dashboard',
  },
];