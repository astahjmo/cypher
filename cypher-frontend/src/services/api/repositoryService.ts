import { API_URL } from '@/config';
import { Repository, RepositoryConfig, Branch } from '@/interfaces/dashboard';

/**
 * Fetches the list of repositories accessible by the authenticated user from the backend.
 * @returns {Promise<Repository[]>} A promise resolving with an array of repositories.
 * @throws {Error} If the fetch fails or returns a non-OK status.
 */
export const fetchRepositories = async (): Promise<Repository[]> => {
  const response = await fetch(`${API_URL}/repositories`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return response.json();
};

/**
 * Fetches the configurations for repositories that have been set up by the user.
 * @returns {Promise<RepositoryConfig[]>} A promise resolving with an array of repository configurations.
 * @throws {Error} If the fetch fails or returns a non-OK status (e.g., 401 Unauthorized).
 */
export const fetchRepoConfigs = async (): Promise<RepositoryConfig[]> => {
  const response = await fetch(`${API_URL}/repositories/configs`, { credentials: 'include' });
  if (!response.ok) {
    if (response.status === 401)
      throw new Error('Unauthorized: Failed to fetch repository configurations.');
    throw new Error('Failed to fetch repository configurations');
  }
  return response.json();
};

/**
 * Fetches the branches for a specific repository.
 * @param {string} owner - The repository owner's username or organization name.
 * @param {string} repo - The repository name.
 * @returns {Promise<Branch[]>} A promise resolving with an array of branches. Returns empty array if owner/repo is missing.
 * @throws {Error} If the fetch fails or returns a non-OK status.
 */
export const fetchBranches = async (owner: string, repo: string): Promise<Branch[]> => {
  if (!owner || !repo) return [];
  const response = await fetch(`${API_URL}/repositories/${owner}/${repo}/branches`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `Failed to fetch branches: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetches the specific configuration for a single repository.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @returns {Promise<RepositoryConfig | null>} A promise resolving with the repository configuration or null if not found.
 * @throws {Error} If the fetch fails for reasons other than 404.
 */
export const fetchConfig = async (
  owner: string,
  repo: string,
): Promise<RepositoryConfig | null> => {
  // This should eventually fetch from a specific endpoint like GET /repositories/{owner}/{repo}/config
  // For now, it filters the result from the general /configs endpoint
  // This is inefficient but works until the specific endpoint is implemented.
  const allConfigs = await fetchRepoConfigs(); // Re-fetch all configs
  const repoFullName = `${owner}/${repo}`;
  return allConfigs.find((c) => c.repo_full_name === repoFullName) || null;
};

/**
 * Saves the auto-build branch configuration for a repository.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @param {string[]} branches - An array of branch names to configure for auto-build.
 * @returns {Promise<RepositoryConfig>} The saved or updated repository configuration.
 * @throws {Error} If the save operation fails.
 */
export const saveConfig = async (
  owner: string,
  repo: string,
  branches: string[],
): Promise<RepositoryConfig> => {
  const response = await fetch(`${API_URL}/repositories/${owner}/${repo}/branches/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ branches }),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `Failed to save config: ${response.status}`);
  }
  return response.json();
};
