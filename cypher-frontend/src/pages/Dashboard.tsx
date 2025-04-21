import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock,
  Github,
  Play,
  Plus,
  RefreshCw,
  Loader2,
  GitCommitHorizontal,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ConfigureRepoModal } from '@/components/repository/ConfigureRepoModal';
import { ManualBuildModal } from '@/components/build/ManualBuildModal';
import { useToast } from '@/components/ui/use-toast';
import {
  Repository,
  RepositoryConfig,
  BuildStatus,
  Branch,
  TriggerBuildPayload,
} from '@/interfaces/dashboard';
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards';
import { ConfiguredReposList } from '@/components/dashboard/ConfiguredReposList';
import { RecentBuildsList } from '@/components/dashboard/RecentBuildsList';
import { fetchBranches } from '@/services/api/repositoryService';
import { triggerBuild } from '@/services/api/buildService';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { user } = useAuth();
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [repoForModal, setRepoForModal] = useState<string>('');
  const [branchesForModal, setBranchesForModal] = useState<Branch[]>([]);
  const [isLoadingBranchesForModal, setIsLoadingBranchesForModal] = useState(false);
  const [errorBranchesForModal, setErrorBranchesForModal] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    repositories,
    isLoadingRepos,
    isErrorRepos,
    repoConfigs,
    isLoadingConfigs,
    isErrorConfigs,
    buildStatuses,
    isLoadingBuilds,
    isErrorBuilds,
  } = useDashboardData();

  const triggerBuildMutation = useMutation<
    { build_id: string; message: string },
    Error,
    TriggerBuildPayload
  >({
    mutationFn: triggerBuild,
    onSuccess: (data, variables) => {
      toast({
        title: 'Build Triggered',
        description: `Build for ${variables.branch} (tag version: ${variables.tag_version}) initiated. ${data.message}`,
      });
      setIsBuildModalOpen(false);
      navigate(`/builds/${data.build_id}`);
      queryClient.invalidateQueries({ queryKey: ['buildStatuses', user?._id] });
    },
    onError: (err, variables) => {
      toast({
        title: `Error Triggering Build for ${variables.branch}`,
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleOpenBuildModal = async (repoFullName: string) => {
    setRepoForModal(repoFullName);
    setIsBuildModalOpen(true);
    setIsLoadingBranchesForModal(true);
    setErrorBranchesForModal(null);
    setBranchesForModal([]);

    try {
      const [owner, repo] = repoFullName.split('/');
      const branches = await fetchBranches(owner, repo);
      setBranchesForModal(branches);
    } catch (error) {
      console.error('Failed to fetch branches for modal:', error);
      setErrorBranchesForModal(error instanceof Error ? error.message : 'Failed to load branches.');
    } finally {
      setIsLoadingBranchesForModal(false);
    }
  };

  const handleBuildSubmit = (branch: string, tagVersion: string) => {
    if (!repoForModal) return;
    const [owner, repo] = repoForModal.split('/');
    triggerBuildMutation.mutate({ owner, repo, branch, tag_version: tagVersion });
  };

  const handleSaveSuccess = (newConfig: RepositoryConfig) => {
    queryClient.invalidateQueries({ queryKey: ['repoConfigs', user?._id] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {' '}
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>{' '}
          <p className="text-muted-foreground"> Monitor and manage your CI/CD pipelines </p>{' '}
        </div>
        <Button onClick={() => setIsConfigureModalOpen(true)}>
          {' '}
          <Plus className="mr-2 h-4 w-4" /> Configure Repository{' '}
        </Button>
      </div>

      <DashboardSummaryCards
        isLoadingRepos={isLoadingRepos}
        repositoriesCount={repositories.length}
        isLoadingConfigs={isLoadingConfigs}
        repoConfigsCount={repoConfigs.length}
        isLoadingBuilds={isLoadingBuilds}
        buildStatusesCount={buildStatuses.length}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Configured Repositories</h2>
        <ConfiguredReposList
          isLoading={isLoadingConfigs}
          isError={isErrorConfigs}
          repoConfigs={repoConfigs}
          onRunBuildClick={handleOpenBuildModal}
          isTriggeringBuild={triggerBuildMutation.isPending}
          onAddRepositoryClick={() => setIsConfigureModalOpen(true)}
          onConfigureClick={(repoFullName) => navigate(`/repositories/${repoFullName}`)}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Builds</h2>
        <RecentBuildsList
          isLoading={isLoadingBuilds}
          isError={isErrorBuilds}
          buildStatuses={buildStatuses}
          onConfigureRepoClick={() => setIsConfigureModalOpen(true)}
        />
      </div>

      <ConfigureRepoModal
        open={isConfigureModalOpen}
        onOpenChange={setIsConfigureModalOpen}
        onSaveSuccess={handleSaveSuccess}
      />

      {repoForModal && (
        <ManualBuildModal
          open={isBuildModalOpen}
          onOpenChange={setIsBuildModalOpen}
          onSubmit={handleBuildSubmit}
          branches={branchesForModal}
          isLoadingBranches={isLoadingBranchesForModal}
          isLoadingSubmit={triggerBuildMutation.isPending}
          errorBranches={errorBranchesForModal}
          repoFullName={repoForModal}
        />
      )}
    </div>
  );
}
