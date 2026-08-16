import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  firstValueFrom,
} from 'rxjs';

import {
  AgentApiService,
} from '../api/agent-api.service';

import {
  AppSessionService,
} from './app-session.service';


@Injectable({
  providedIn: 'root',
})
export class SessionInitializerService {

  private readonly api =
    inject(AgentApiService);

  private readonly state =
    inject(AppSessionService);


  async initialize():
    Promise<void> {

    const existingSessionId =
      this.state.sessionId();


    if (existingSessionId) {

      try {

        const repository =
          await firstValueFrom(
            this.api.getRepository(
              existingSessionId,
            ),
          );

        if (repository) {
          this.state
            .setRepository(
              repository,
            );
        }

        return;

      } catch (error) {

        /*
         * Existing session may simply
         * not have a selected repository yet.
         */

        if (
          error instanceof
            HttpErrorResponse &&
          (
            error.status === 400 ||
            error.status === 404
          )
        ) {
          return;
        }

        this.state.clear();
      }
    }


    const sessionId =
      await firstValueFrom(
        this.api.createSession(),
      );


    this.state.setSession(
      sessionId,
    );
  }
}