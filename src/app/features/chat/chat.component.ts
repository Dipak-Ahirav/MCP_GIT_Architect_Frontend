import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  AgentApiService,
} from '../../core/api/agent-api.service';

import {
  AppSessionService,
} from '../../core/state/app-session.service';

import {
  getApiError,
} from '../../core/utils/api-error';


interface ChatMessage {
  role:
    | 'user'
    | 'assistant';

  content:
    string;
}


@Component({
  selector:
    'app-chat',

  imports: [
    FormsModule,
  ],

  template: `
    <div class="page-header">

      <div>

        <h1>
          AI Chat
        </h1>

        <p>
          Ask GitArchitect questions about the selected repository.
        </p>

      </div>

      @if (
        session.repository();
        as repository
      ) {

        <span class="badge">
          {{ repository.fullName }}
        </span>

      }

    </div>


    @if (!session.hasRepository()) {

      <div class="info-box">
        Select a repository before starting repository-aware conversations.
      </div>

    }


    <div class="chat-panel">

      <div class="messages">

        @for (
          message
          of messages();
          track $index
        ) {

          <div
            class="message"
            [class.user]="
              message.role === 'user'
            "
            [class.assistant]="
              message.role === 'assistant'
            ">

            <strong>
              {{
                message.role === 'user'
                  ? 'You'
                  : 'GitArchitect'
              }}
            </strong>

            <p>
              {{ message.content }}
            </p>

          </div>

        } @empty {

          <div class="welcome">

            <h2>
              Ask GitArchitect
            </h2>

            <button
              class="suggestion"
              (click)="
                usePrompt(
                  'Analyze the architecture of this repository.'
                )
              ">

              Analyze the architecture

            </button>

            <button
              class="suggestion"
              (click)="
                usePrompt(
                  'Where is authentication implemented?'
                )
              ">

              Find authentication

            </button>

            <button
              class="suggestion"
              (click)="
                usePrompt(
                  'How is application state managed?'
                )
              ">

              Explain state management

            </button>

          </div>

        }

      </div>


      @if (error()) {

        <div class="error-box">
          {{ error() }}
        </div>

      }


      <div class="composer">

        <textarea
          class="textarea"
          [(ngModel)]="input"
          placeholder="Ask GitArchitect..."
          [disabled]="loading()"
        ></textarea>

        <button
          class="btn btn-primary"
          [disabled]="
            loading() ||
            !input.trim()
          "
          (click)="send()">

          {{
            loading()
              ? 'Thinking...'
              : 'Send'
          }}

        </button>

      </div>

    </div>
  `,

  styles: [`
    .chat-panel {
      background: white;

      border:
        1px solid #e2e8f0;

      border-radius: 14px;

      overflow: hidden;
    }

    .messages {
      min-height: 420px;

      max-height: 60vh;

      overflow: auto;

      padding: 22px;
    }

    .message {
      max-width: 80%;

      padding: 14px 16px;

      border-radius: 12px;

      margin-bottom: 15px;
    }

    .message p {
      margin:
        7px 0 0;

      line-height: 1.65;

      white-space: pre-wrap;
    }

    .message.user {
      margin-left: auto;

      background: #eef2ff;
    }

    .message.assistant {
      background: #f8fafc;
    }

    .welcome {
      display: flex;

      flex-direction: column;

      align-items: flex-start;

      gap: 10px;
    }

    .suggestion {
      padding: 10px 13px;

      background: white;

      border:
        1px solid #cbd5e1;

      border-radius: 9px;
    }

    .composer {
      display: grid;

      grid-template-columns:
        1fr auto;

      gap: 12px;

      padding: 18px;

      border-top:
        1px solid #e2e8f0;
    }

    .composer textarea {
      min-height: 74px;
    }
  `],
})
export class ChatComponent {

  private readonly api =
    inject(
      AgentApiService,
    );

  protected readonly session =
    inject(
      AppSessionService,
    );


  protected input =
    '';

  protected readonly messages =
    signal<ChatMessage[]>([]);

  protected readonly loading =
    signal(false);

  protected readonly error =
    signal<string | null>(
      null,
    );


  protected usePrompt(
    prompt: string,
  ): void {

    this.input =
      prompt;
  }


  protected send():
    void {

    const message =
      this.input.trim();

    const sessionId =
      this.session.sessionId();


    if (
      !message ||
      !sessionId
    ) {
      return;
    }


    this.messages.update(
      messages => [
        ...messages,
        {
          role:
            'user',

          content:
            message,
        },
      ],
    );


    this.input =
      '';

    this.loading.set(
      true,
    );

    this.error.set(
      null,
    );


    this.api
      .chat(
        sessionId,
        message,
      )
      .subscribe({

        next:
          response => {

            this.messages.update(
              messages => [
                ...messages,
                {
                  role:
                    'assistant',

                  content:
                    response,
                },
              ],
            );

            this.loading.set(
              false,
            );
          },

        error:
          error => {

            this.error.set(
              getApiError(
                error,
              ),
            );

            this.loading.set(
              false,
            );
          },
      });
  }
}