export interface Repository {
  name: string;
  full_name: string;
  private: boolean;
  url: string;
}

export interface RepositoryConfig {
  _id: string;
  user_id: string;
  repo_full_name: string;
  auto_build_branches: string[];
  created_at: string;
  updated_at: string;
}

export interface BuildStatus {
  _id: string;
  user_id: string;
  repo_full_name: string;
  branch: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  started_at?: string;
  completed_at?: string;
  created_at: string;
  commit_sha?: string | null;
  commit_message?: string | null;
  image_tag?: string | null;
  message?: string | null;
  updated_at?: string;
}

export interface Branch {
  name: string;
}

export interface TriggerBuildPayload {
  owner: string;
  repo: string;
  branch: string;
  tag_version: string;
}

export interface ConfiguredReposListProps {
  isLoading: boolean;
  isError: boolean;
  repoConfigs: RepositoryConfig[];
  onConfigureClick: (repoFullName: string) => void;
  onRunBuildClick: (repoFullName: string) => void;
  isTriggeringBuild: boolean;
  onAddRepositoryClick: () => void;
}
