export interface ScoreMap {
  architecture?: number | null;
  codeOrganization?: number | null;
  maintainability?: number | null;
  scalability?: number | null;
  security?: number | null;
  performance?: number | null;
  testing?: number | null;
  dependencyHealth?: number | null;

  [key: string]:
    | number
    | null
    | undefined;
}

export interface AnalysisFinding {
  severity?: string;

  category?: string;

  title?: string;

  message?: string;

  description?: string;

  path?: string;

  line?: number | null;

  evidencePaths?: string[];

  recommendation?: string;
}

export interface RepositoryDiscovery {
  repositoryPurpose?: string;

  projectType?: string;

  languages?: string[];

  frameworks?: string[];

  runtimes?: string[];

  packageManagers?: string[];

  buildTools?: string[];

  testingTools?: string[];

  databases?: string[];

  stateManagement?: string[];

  ciPlatforms?: string[];

  sourceRoots?: string[];

  testRoots?: string[];

  importantFiles?: string[];

  importantDirs?: string[];

  architectureHints?: string[];

  evidenceFiles?: string[];

  limitations?: string[];
}

export interface RepositoryAnalysis {
  summary?: string;

  purpose?: string;

  stack?: string[];

  architectureStyle?: string;

  scores?: ScoreMap;

  strengths?: string[];

  findings?: AnalysisFinding[];

  recommendations?: string[];

  analyzedFiles?: string[];

  limitations?: string[];
}

export interface RepositoryIntelligenceResponse {
  engineVersion?: string;

  repository?: string;

  defaultBranch?: string;

  specialistsRun?: string[];

  overallScore?: number;

  discovery?: RepositoryDiscovery;

  analysis?: RepositoryAnalysis;
}

export interface PullRequestReview {
  summary?: string;

  risk?: string;

  recommendation?: string;

  scores?: ScoreMap;

  findings?: AnalysisFinding[];

  positives?: string[];

  checks?: string[];

  filesReviewed?: string[];

  limitations?: string[];
}

export interface IssueAnalysis {
  summary?: string;

  issueType?: string;

  confidence?: number | string;

  explicitRequirements?: string[];

  inferredRequirements?: string[];

  missingRequirements?: string[];

  acceptanceCriteria?: string[];

  affectedAreas?: string[];

  rootCauseHypothesis?: string;

  evidencePaths?: string[];

  relatedFiles?: string[];

  implementationPlan?: string[];

  testingPlan?: string[];

  risks?: string[];

  questions?: string[];

  relatedPRs?: string[];

  filesInspected?: string[];

  limitations?: string[];
}

export interface CiDebugAnalysis {
  summary?: string;

  failureCategory?: string;

  confidence?: number | string;

  rootCause?: string;

  failedJobs?: string[];

  relevantLogLines?: string[];

  relatedCode?: string[];

  proposedFixes?: string[];

  reproduction?: string[];

  validationPlan?: string[];

  environmentalFactors?: string[];

  filesInspected?: string[];

  logsInspected?: string[];

  limitations?: string[];
}