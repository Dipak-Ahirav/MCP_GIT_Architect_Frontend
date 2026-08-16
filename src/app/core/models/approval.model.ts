export interface ApprovalAction {
  actionIndex: number;

  tool: string;

  arguments: Record<string, unknown>;
}

export interface GitHubApprovalRequired {
  status: 'approval_required';

  approvalId: string;

  repository: string;

  actions: ApprovalAction[];
}

export interface GitHubWriteCompleted {
  status: 'completed';

  response: string;
}

export interface ApprovalResult {
  status:
    | 'approval_required'
    | 'completed'
    | 'rejected';

  approvalId?: string;

  actions?: ApprovalAction[];

  response?: string;
}

export type ApprovalDecision =
  | 'approve'
  | 'reject';