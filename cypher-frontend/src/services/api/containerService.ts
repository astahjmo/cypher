import { API_URL } from '@/config';
import {
  ContainerRuntimeConfig,
  DockerNetwork,
  VolumeMapping,
  EnvironmentVariable,
  LabelPair,
  PortMapping,
} from '@/interfaces/containerConfig';
import { ContainerStatusInfo } from '@/interfaces/container';

/**
 * Fetches the runtime configuration for a specific repository's containers.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @returns {Promise<ContainerRuntimeConfig | null>} The configuration object or null if not found (404).
 * @throws {Error} If the fetch fails for reasons other than 404.
 */
export const fetchContainerConfig = async (
  owner: string,
  repo: string,
): Promise<ContainerRuntimeConfig | null> => {
  const response = await fetch(`${API_URL}/api/v1/containers/${owner}/${repo}/config`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  if (response.status === 404) {
    return null;
  }
  const errorData = await response
    .json()
    .catch(() => ({ detail: 'Failed to fetch configuration' }));
  throw new Error(`Config fetch failed: ${errorData.detail || response.statusText}`);
};

/**
 * Fetches the list of available Docker networks from the backend.
 * @returns {Promise<DockerNetwork[]>} A list of available Docker networks.
 * @throws {Error} If the fetch fails.
 */
export const fetchDockerNetworks = async (): Promise<DockerNetwork[]> => {
  const response = await fetch(`${API_URL}/api/v1/networks`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  if (response.ok) {
    return response.json();
  }
  const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch networks' }));
  throw new Error(`Networks fetch failed: ${errorData.detail || response.statusText}`);
};

/**
 * Saves (updates or creates) the runtime configuration for a specific repository's containers.
 * Performs basic validation/filtering on input arrays before sending.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {Omit<ContainerRuntimeConfig, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'repo_full_name'>} config - The configuration data to save.
 * @returns {Promise<ContainerRuntimeConfig>} The saved or updated configuration object returned by the backend.
 * @throws {Error} If the save operation fails or validation errors occur.
 */
export const saveContainerConfig = async (
  owner: string,
  repo: string,
  config: Omit<
    ContainerRuntimeConfig,
    'id' | 'user_id' | 'created_at' | 'updated_at' | 'repo_full_name'
  >,
): Promise<ContainerRuntimeConfig> => {
  const finalVolumes = config.volumes.filter(
    (v) => v.host_path.trim() !== '' && v.container_path.trim() !== '',
  );
  const finalEnvVars = config.environment_variables.filter((e) => e.name.trim() !== '');
  const finalLabels = config.labels.filter((l) => l.key.trim() !== '');
  const finalPortMappings = config.port_mappings
    .map((p) => ({
      ...p,
      container_port: parseInt(String(p.container_port), 10),
      host_port:
        p.host_port != null && String(p.host_port).trim() !== ''
          ? parseInt(String(p.host_port), 10)
          : null,
    }))
    .filter(
      (p) =>
        !isNaN(p.container_port) &&
        p.container_port > 0 &&
        (p.host_port === null || (!isNaN(p.host_port) && p.host_port > 0)),
    );

  if (
    finalPortMappings.length !==
    config.port_mappings.filter((p) => String(p.container_port).trim() !== '').length
  ) {
    throw new Error('Invalid port number(s) entered in Port Mappings.');
  }

  const payload: Omit<ContainerRuntimeConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
    repo_full_name: string;
  } = {
    repo_full_name: `${owner}/${repo}`,
    scaling: config.scaling,
    volumes: finalVolumes,
    environment_variables: finalEnvVars,
    labels: finalLabels,
    network_mode: config.network_mode,
    port_mappings: finalPortMappings,
  };

  const response = await fetch(`${API_URL}/api/v1/containers/${owner}/${repo}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    const errorData = await response
      .json()
      .catch(() => ({ detail: 'Failed to save configuration' }));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }
  return response.json();
};

/**
 * Fetches the initial status of all containers managed by Cypher.
 * @returns {Promise<ContainerStatusInfo[]>} A list of aggregated container statuses per repository.
 * @throws {Error} If the fetch fails.
 */
export const fetchInitialContainerStatuses = async (): Promise<ContainerStatusInfo[]> => {
  const response = await fetch(`${API_URL}/api/v1/containers/status`, {
    credentials: 'include',
  });
  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return response.json();
};

/**
 * Performs an action (start, stop, remove) on a specific container instance.
 * @param {'start' | 'stop' | 'remove'} action - The action to perform.
 * @param {string} containerId - The ID of the target container.
 * @returns {Promise<void>} Resolves on success.
 * @throws {Error} If the action fails.
 */
export const performContainerAction = async (
  action: 'start' | 'stop' | 'remove',
  containerId: string,
): Promise<void> => {
  let method = 'POST';
  let endpoint = `${API_URL}/api/v1/containers/${containerId}/${action}`;
  if (action === 'remove') {
    method = 'DELETE';
    endpoint = `${API_URL}/api/v1/containers/${containerId}`;
  }

  const response = await fetch(endpoint, {
    method: method,
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok && response.status !== 204) {
    let errorMessage = `Failed to ${action} container ${containerId}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Scales the number of instances for a repository's deployment.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {number} count - The desired number of instances.
 * @returns {Promise<{ message: string }>} A promise resolving with a confirmation message.
 * @throws {Error} If the scaling request fails.
 */
export const scaleContainers = async (
  owner: string,
  repo: string,
  count: number,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/v1/containers/${owner}/${repo}/scale`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ desired_instances: count }),
  });
  if (!response.ok) {
    let errorMsg = `Failed to scale ${owner}/${repo}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

/**
 * Fetches the logs for a specific container instance.
 * @param {string} containerId - The ID of the container.
 * @returns {Promise<string>} A promise resolving with the container logs as plain text.
 * @throws {Error} If the fetch fails or the container ID is invalid.
 */
export const fetchContainerLogs = async (containerId: string): Promise<string> => {
  if (!containerId) {
    throw new Error('Invalid Container ID provided for fetching logs');
  }
  const response = await fetch(`${API_URL}/api/v1/containers/${containerId}/logs`, {
    method: 'GET',
    headers: { Accept: 'text/plain' },
    credentials: 'include',
  });
  if (!response.ok) {
    let errorMsg = `Failed to fetch logs for container ${containerId}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return response.text();
};
