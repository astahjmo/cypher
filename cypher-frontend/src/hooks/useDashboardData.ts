import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRepositories, fetchRepoConfigs } from '@/services/api/repositoryService';
import { fetchBuildStatuses } from '@/services/api/buildService';
import { Repository, RepositoryConfig, BuildStatus } from '@/interfaces/dashboard';

export function useDashboardData() {
  const { user } = useAuth();
  const userId = user?._id;

  const {
    data: repositories = [],
    isLoading: isLoadingRepos,
    isError: isErrorRepos,
  } = useQuery<Repository[], Error>({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: repoConfigs = [],
    isLoading: isLoadingConfigs,
    isError: isErrorConfigs,
  } = useQuery<RepositoryConfig[], Error>({
    queryKey: ['repoConfigs', userId],
    queryFn: fetchRepoConfigs,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: buildStatuses = [],
    isLoading: isLoadingBuilds,
    isError: isErrorBuilds,
  } = useQuery<BuildStatus[], Error>({
    queryKey: ['buildStatuses', userId],
    queryFn: fetchBuildStatuses,
    enabled: !!user,
    staleTime: 1 * 60 * 1000,
  });

  return {
    repositories,
    isLoadingRepos,
    isErrorRepos,
    repoConfigs,
    isLoadingConfigs,
    isErrorConfigs,
    buildStatuses,
    isLoadingBuilds,
    isErrorBuilds,
  };
}
