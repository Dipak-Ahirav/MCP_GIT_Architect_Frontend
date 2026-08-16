import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';

import {
  provideRouter,
} from '@angular/router';

import {
  provideHttpClient,
} from '@angular/common/http';

import {
  routes,
} from './app.routes';

import {
  SessionInitializerService,
} from './core/state/session-initializer.service';


export const appConfig:
  ApplicationConfig = {

  providers: [

    provideRouter(
      routes,
    ),

    provideHttpClient(),

    provideAppInitializer(
      () => {

        const initializer =
          inject(
            SessionInitializerService,
          );

        return initializer
          .initialize();
      },
    ),
  ],
};