export interface CommitInfo {
  sha: string;
  message: string;
}

export interface BuildStatusData {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  message?: string | null;
  commit_sha?: string | null;
  commit_message?: string | null;
}

export interface HistoricalLog {
  timestamp: string;
  type: string;
  message: string;
}

export interface BuildListItem {
  _id: string;
  user_id: string;
  repo_full_name: string;
  branch: string;
  commit_sha?: string;
  commit_message?: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  logs?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  k8s_job_name?: string;
  image_tag?: string;
  updated_at?: string;
}

export interface DisplayLog {
  type: 'log' | 'error' | 'info';
  payload: string;
  timestamp: string;
}

export interface BuildLogViewerProps {
  logs: DisplayLog[];
  isLoadingStatus: boolean;
  isLiveStreaming: boolean;
  isLoadingLogs: boolean;
  initialBuildStatus?: BuildStatusData | null;
}
