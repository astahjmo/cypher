export interface ContainerDetail {
  id: string;
  name: string;
  status: string;
  image: string;
  ports: Record<string, string>;
}

export interface ContainerStatusInfo {
  repo_full_name: string;
  running: number;
  stopped: number;
  paused: number;
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
  containers: ContainerDetail[];
}
