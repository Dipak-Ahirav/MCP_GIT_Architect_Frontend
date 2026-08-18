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


export interface GitHubAuthStatus {
  connected: boolean;

  login?: string;

  name?: string;

  avatarUrl?: string;
}


@Injectable({
  providedIn: 'root',
})
export class GithubApiService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    '/api/v1/github';


  authStatus():
    Observable<GitHubAuthStatus> {

    return this.http
      .get<
        ApiResponse<any>
      >(
        `${this.baseUrl}/auth/status`,
      )
      .pipe(
        map(
          response => {

            const data =
              response.data ?? {};

            return {
              connected:
                data.connected ??
                data.authenticated ??
                true,

              login:
                data.login ??
                data.username ??
                data.user?.login,

              name:
                data.name ??
                data.user?.name,

              avatarUrl:
                data.avatarUrl ??
                data.avatar_url ??
                data.user?.avatar_url,
            };
          },
        ),
      );
  }


  repositories():
    Observable<Repository[]> {

    return this.http
      .get<
        ApiResponse<any>
      >(
        `${this.baseUrl}/repos`,
      )
      .pipe(
        map(
          response => {

            const data =
              response.data;

            const repositories =
              Array.isArray(data)
                ? data
                : (
                    data?.repositories ??
                    data?.repos ??
                    []
                  );

            return repositories.map(
              (repository: any) =>
                this.normalizeRepository(
                  repository,
                ),
            );
          },
        ),
      );
  }


  private normalizeRepository(
    repository: any,
  ): Repository {

    return {
      id:
        Number(
          repository.id,
        ),

      owner:
        repository.owner?.login ??
        repository.owner ??
        repository.fullName
          ?.split('/')[0] ??
        repository.full_name
          ?.split('/')[0] ??
        '',

      repo:
        repository.repo ??
        repository.name ??
        repository.fullName
          ?.split('/')[1] ??
        repository.full_name
          ?.split('/')[1] ??
        '',

      fullName:
        repository.fullName ??
        repository.full_name ??
        `${repository.owner}/${repository.repo}`,

      defaultBranch:
        repository.defaultBranch ??
        repository.default_branch ??
        'main',

      isPrivate:
        repository.isPrivate ??
        repository.private ??
        false,

      url:
        repository.url ??
        repository.html_url ??
        '',

      description:
        repository.description ??
        null,

      language:
        repository.language ??
        null,

      updatedAt:
        repository.updatedAt ??
        repository.updated_at ??
        null,
    };
  }
}