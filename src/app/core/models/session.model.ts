import type {
  Repository,
} from './repository.model';

export interface AgentSession {
  sessionId: string;

  repository?: Repository;
}