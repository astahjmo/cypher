import { API_URL } from '@/config';
import { BuildStatus, TriggerBuildPayload } from '@/interfaces/dashboard';
import { BuildListItem, BuildStatusData, HistoricalLog } from '@/interfaces/build';

/**
 * Fetches the list of build statuses for the dashboard.
 * @returns {Promise<BuildStatus[]>} A promise that resolves with an array of build statuses.
 * @throws {Error} If the fetch fails or returns a non-OK status.
 */
export const fetchBuildStatuses = async (): Promise<BuildStatus[]> => {
  const response = await fetch(`${API_URL}/build/statuses`, { credentials: 'include' });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized: Failed to fetch build statuses.');
    throw new Error('Failed to fetch build statuses');
  }
  const data = await response.json();
  return data;
};

/**
 * Triggers a new build with optional tag version.
 * @param {TriggerBuildPayload} payload - The details for the build trigger.
 * @returns {Promise<{ build_id: string; message: string }>} A promise resolving with the build ID and a message.
 * @throws {Error} If the request fails, including validation errors from the backend.
 */
export const triggerBuild = async (
  payload: TriggerBuildPayload,
): Promise<{ build_id: string; message: string }> => {
  const { owner, repo, branch, tag_version } = payload;
  const response = await fetch(`${API_URL}/build/docker/${owner}/${repo}/${branch}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag_version: tag_version }),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: `HTTP ${response.status} Error` }));
    if (response.status === 422 && Array.isArray(errorData.detail)) {
      const firstError = errorData.detail[0];
      const loc = firstError?.loc;
      const field = Array.isArray(loc) && loc.length > 1 ? loc[1] : 'unknown field';
      const msg = firstError?.msg || 'Validation error';
      throw new Error(`Validation Error: ${field} - ${msg}`);
    }
    const detailMessage =
      typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
    throw new Error(detailMessage || `Failed to trigger build: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetches the list of all builds (for the Builds page).
 * @returns {Promise<BuildListItem[]>} A promise resolving with an array of all build list items.
 * @throws {Error} If the fetch fails or returns a non-OK status.
 */
export const fetchBuildsList = async (): Promise<BuildListItem[]> => {
  const response = await fetch(`${API_URL}/build`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {
      /* Ignore JSON parsing error */
    }
    throw new Error(errorMsg);
  }
  const data: BuildListItem[] = await response.json();
  data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return data;
};

/**
 * Fetches the detailed status of a specific build.
 * @param {string} buildId - The ID of the build to fetch status for.
 * @returns {Promise<BuildStatusData>} A promise resolving with the detailed build status data.
 * @throws {Error} If the build ID is invalid, the fetch fails, or the build is not found (404).
 */
export const fetchBuildStatus = async (buildId: string): Promise<BuildStatusData> => {
  if (!buildId || buildId === 'undefined') {
    throw new Error('Invalid Build ID provided for fetching status');
  }
  const response = await fetch(`${API_URL}/build/${buildId}`, { credentials: 'include' });
  if (!response.ok) {
    if (response.status === 404) throw new Error('Build not found');
    throw new Error(`Failed to fetch build status (${response.status})`);
  }
  return response.json();
};

/**
 * Fetches the historical logs for a specific build.
 * @param {string} buildId - The ID of the build to fetch logs for.
 * @returns {Promise<HistoricalLog[]>} A promise resolving with an array of historical log entries. Returns empty array on 404.
 * @throws {Error} If the build ID is invalid or the fetch fails (excluding 404).
 */
export const fetchHistoricalLogs = async (buildId: string): Promise<HistoricalLog[]> => {
  if (!buildId || buildId === 'undefined') {
    throw new Error('Invalid Build ID provided for fetching logs');
  }
  const response = await fetch(`${API_URL}/build/${buildId}/logs`, { credentials: 'include' });
  if (!response.ok) {
    if (response.status === 404) return []; // Not found is not an error here, just no logs
    throw new Error(`Failed to fetch historical logs (${response.status})`);
  }
  return response.json();
};

/**
 * Triggers a build for a specific branch without specifying a tag version (defaults handled by backend).
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string} branch - The branch name to build.
 * @returns {Promise<{ build_id: string; message: string }>} A promise resolving with the build ID and a message.
 * @throws {Error} If the request fails.
 */
export const triggerSimpleBuild = async (
  owner: string,
  repo: string,
  branch: string,
): Promise<{ build_id: string; message: string }> => {
  const response = await fetch(`${API_URL}/build/docker/${owner}/${repo}/${branch}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `Failed to trigger build: ${response.status}`);
  }
  return response.json();
};
