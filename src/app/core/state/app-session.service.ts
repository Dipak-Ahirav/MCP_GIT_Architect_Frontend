import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

import type {
  Repository,
} from '../models/repository.model';


const SESSION_KEY =
  'gitarchitect.sessionId';


@Injectable({
  providedIn: 'root',
})
export class AppSessionService {

  private readonly sessionIdState =
    signal<string | null>(
      localStorage.getItem(
        SESSION_KEY,
      ),
    );

  private readonly repositoryState =
    signal<Repository | null>(
      null,
    );


  readonly sessionId =
    this.sessionIdState.asReadonly();

  readonly repository =
    this.repositoryState.asReadonly();


  readonly hasSession =
    computed(
      () =>
        !!this.sessionIdState(),
    );


  readonly hasRepository =
    computed(
      () =>
        !!this.repositoryState(),
    );


  setSession(
    sessionId: string,
  ): void {

    this.sessionIdState.set(
      sessionId,
    );

    localStorage.setItem(
      SESSION_KEY,
      sessionId,
    );
  }


  setRepository(
    repository: Repository,
  ): void {

    this.repositoryState.set(
      repository,
    );
  }


  clearRepository(): void {

    this.repositoryState.set(
      null,
    );
  }


  clear(): void {

    this.sessionIdState.set(
      null,
    );

    this.repositoryState.set(
      null,
    );

    localStorage.removeItem(
      SESSION_KEY,
    );
  }
}