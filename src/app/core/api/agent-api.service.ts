import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  map,
  type Observable,
} from 'rxjs';

import type {
  ApiResponse,
} from './api.models';

import type {
  Repository,
} from '../models/repository.model';

import type {
  RepositoryIntelligenceResponse,
  PullRequestReview,
  IssueAnalysis,
  CiDebugAnalysis,
} from '../models/analysis.model';

import type {
  ApprovalDecision,
  ApprovalResult,
  GitHubApprovalRequired,
  GitHubWriteCompleted,
} from '../models/approval.model';


@Injectable({
  providedIn: 'root',
})
export class AgentApiService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    '/api/v1/agent';


  createSession():
    Observable<string> {

    return this.http
      .post<
        ApiResponse<{
          sessionId: string;
        }>
      >(
        `${this.baseUrl}/sessions`,
        {},
      )
      .pipe(
        map(
          response =>
            response.data.sessionId,
        ),
      );
  }


  getRepository(
    sessionId: string,
  ): Observable<Repository> {

    return this.http
      .get<
        ApiResponse<{
          repository: Repository;
        }>
      >(
        `${this.baseUrl}/sessions/${sessionId}/repository`,
      )
      .pipe(
        map(
          response =>
            response.data.repository,
        ),
      );
  }


  selectRepository(
    sessionId: string,
    owner: string,
    repo: string,
  ): Observable<Repository> {

    return this.http
      .put<
        ApiResponse<{
          repository: Repository;
        }>
      >(
        `${this.baseUrl}/sessions/${sessionId}/repository`,
        {
          owner,
          repo,
        },
      )
      .pipe(
        map(
          response =>
            response.data.repository,
        ),
      );
  }


  chat(
    sessionId: string,
    message: string,
  ): Observable<string> {

    return this.http
      .post<
        ApiResponse<{
          sessionId: string;
          response: string;
        }>
      >(
        `${this.baseUrl}/chat`,
        {
          sessionId,
          message,
        },
      )
      .pipe(
        map(
          response =>
            response.data.response,
        ),
      );
  }


  analyzeRepository(
    sessionId: string,
  ): Observable<
    RepositoryIntelligenceResponse
  > {

    return this.http
      .post<
        ApiResponse<
          RepositoryIntelligenceResponse
        >
      >(
        `${this.baseUrl}/sessions/${sessionId}/repository-analysis`,
        {},
      )
      .pipe(
        map(
          response =>
            response.data,
        ),
      );
  }


  reviewPullRequest(
    sessionId: string,
    pullNumber: number,
  ): Observable<PullRequestReview> {

    return this.http
      .post<
        ApiResponse<PullRequestReview>
      >(
        `${this.baseUrl}/sessions/${sessionId}/pull-requests/${pullNumber}/review`,
        {},
      )
      .pipe(
        map(
          response =>
            response.data,
        ),
      );
  }


  analyzeIssue(
    sessionId: string,
    issueNumber: number,
  ): Observable<IssueAnalysis> {

    return this.http
      .post<
        ApiResponse<{
          repository: string;
          issueNumber: number;
          analysis: IssueAnalysis;
        }>
      >(
        `${this.baseUrl}/sessions/${sessionId}/issues/${issueNumber}/analyze`,
        {},
      )
      .pipe(
        map(
          response =>
            response.data.analysis,
        ),
      );
  }


  debugWorkflowRun(
    sessionId: string,
    runId: number,
  ): Observable<CiDebugAnalysis> {

    return this.http
      .post<
        ApiResponse<CiDebugAnalysis>
      >(
        `${this.baseUrl}/sessions/${sessionId}/actions/runs/${runId}/debug`,
        {},
      )
      .pipe(
        map(
          response =>
            response.data,
        ),
      );
  }


  requestGitHubWrite(
    sessionId: string,
    instruction: string,
  ): Observable<
    GitHubApprovalRequired |
    GitHubWriteCompleted
  > {

    return this.http
      .post<
        ApiResponse<
          GitHubApprovalRequired |
          GitHubWriteCompleted
        >
      >(
        `${this.baseUrl}/sessions/${sessionId}/github/write`,
        {
          instruction,
        },
      )
      .pipe(
        map(
          response =>
            response.data,
        ),
      );
  }


  decideApproval(
    approvalId: string,
    decision:
      ApprovalDecision,
    actionIndex: number,
  ): Observable<ApprovalResult> {

    return this.http
      .post<
        ApiResponse<ApprovalResult>
      >(
        `${this.baseUrl}/github/approvals/${approvalId}/decision`,
        {
          decision,
          actionIndex,
        },
      )
      .pipe(
        map(
          response =>
            response.data,
        ),
      );
  }
}
