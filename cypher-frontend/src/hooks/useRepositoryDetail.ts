import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { fetchBranches, fetchConfig, saveConfig } from '@/services/api/repositoryService';
import { triggerSimpleBuild } from '@/services/api/buildService';
import { Branch, RepositoryConfig } from '@/interfaces/dashboard';

export function useRepositoryDetail() {
  const { owner = '', repo = '' } = useParams<{ owner: string; repo: string }>();
  const repoFullName = `${owner}/${repo}`;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const {
    data: branches = [],
    isLoading: isLoadingBranches,
    isError: isErrorBranches,
    error: errorBranches,
  } = useQuery<Branch[], Error>({
    queryKey: ['branches', owner, repo],
    queryFn: () => fetchBranches(owner, repo),
    enabled: !!owner && !!repo,
  });

  const {
    data: config,
    isLoading: isLoadingConfig,
    isError: isErrorConfig,
    error: errorConfig,
    isSuccess: isSuccessConfig,
  } = useQuery<RepositoryConfig | null, Error>({
    queryKey: ['config', owner, repo],
    queryFn: () => fetchConfig(owner, repo),
    enabled: !!owner && !!repo,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    if (isSuccessConfig && config) {
      setSelectedBranches(config.auto_build_branches || []);
    } else if (isSuccessConfig && config === null) {
      setSelectedBranches([]);
    }
  }, [config, isSuccessConfig]);

  useEffect(() => {
    if (isErrorBranches && errorBranches) {
      toast({
        title: 'Error Fetching Branches',
        description: errorBranches.message,
        variant: 'destructive',
      });
    }
  }, [isErrorBranches, errorBranches, toast]);

  useEffect(() => {
    if (isErrorConfig && errorConfig) {
      toast({
        title: 'Error Fetching Configuration',
        description: errorConfig.message,
        variant: 'destructive',
      });
    }
  }, [isErrorConfig, errorConfig, toast]);

  const saveMutation = useMutation<RepositoryConfig, Error, string[]>({
    mutationFn: (branchesToSave) => saveConfig(owner, repo, branchesToSave),
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'Configuration saved successfully.' });
      queryClient.setQueryData(['config', owner, repo], data);
      queryClient.invalidateQueries({ queryKey: ['repoConfigs'] });
      setSelectedBranches(data.auto_build_branches || []);
    },
    onError: (err) => {
      toast({
        title: 'Error Saving Configuration',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const triggerBuildMutation = useMutation<{ build_id: string; message: string }, Error, string>({
    mutationFn: (branchToBuild) => triggerSimpleBuild(owner, repo, branchToBuild),
    onSuccess: (data, branch) => {
      toast({
        title: 'Build Triggered',
        description: `Build for ${branch} initiated. ${data.message}`,
      });
      queryClient.invalidateQueries({ queryKey: ['buildStatuses'] });
    },
    onError: (err, branch) => {
      toast({
        title: `Error Triggering Build for ${branch}`,
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleBranchToggle = (branchName: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branchName) ? prev.filter((b) => b !== branchName) : [...prev, branchName],
    );
  };

  const handleSave = () => {
    saveMutation.mutate(selectedBranches);
  };

  const handleTrigger = (branch: string) => {
    triggerBuildMutation.mutate(branch);
  };

  const isTriggeringBuildForBranch = (branchName: string): boolean => {
    return triggerBuildMutation.isPending && triggerBuildMutation.variables === branchName;
  };

  const isLoading = isLoadingBranches || isLoadingConfig;
  const isBranchError = isErrorBranches;
  const isConfigFetchError = isErrorConfig;
  const safeBranches = Array.isArray(branches) ? branches : [];

  return {
    owner,
    repo,
    repoFullName,
    branches: safeBranches,
    selectedBranches,
    config,
    isLoading,
    isBranchError,
    errorBranches,
    isConfigFetchError,
    errorConfig,
    saveMutation,
    triggerBuildMutation,
    handleBranchToggle,
    handleSave,
    handleTrigger,
    isTriggeringBuildForBranch,
  };
}
