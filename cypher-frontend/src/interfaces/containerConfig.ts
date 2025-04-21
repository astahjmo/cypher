export interface VolumeMapping {
  host_path: string;
  container_path: string;
}

export interface EnvironmentVariable {
  name: string;
  value: string;
}

export interface LabelPair {
  key: string;
  value: string;
}

export interface PortMapping {
  container_port: number | string;
  host_port?: number | string | null;
  protocol: 'tcp' | 'udp';
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
}

export interface ContainerRuntimeConfig {
  id?: string;
  user_id?: string;
  repo_full_name: string;
  scaling: number;
  volumes: VolumeMapping[];
  environment_variables: EnvironmentVariable[];
  labels: LabelPair[];
  network_mode?: string | null;
  port_mappings: PortMapping[];
  created_at?: string;
  updated_at?: string;
}
