export interface Repository {
  id: number;

  owner: string;

  repo: string;

  fullName: string;

  defaultBranch: string;

  isPrivate: boolean;

  url: string;

  description?: string | null;

  language?: string | null;

  updatedAt?: string | null;
}