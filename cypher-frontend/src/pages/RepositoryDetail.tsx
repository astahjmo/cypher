import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Github, Loader2, Save, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BranchConfigList } from '@/components/repository/BranchConfigList';
import { useRepositoryDetail } from '@/hooks/useRepositoryDetail';

export default function RepositoryDetail() {
  const navigate = useNavigate();

  const {
    repoFullName,
    branches,
    selectedBranches,
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
  } = useRepositoryDetail();

  useEffect(() => {
    if (triggerBuildMutation.isSuccess && triggerBuildMutation.data?.build_id) {
      navigate(`/builds/${triggerBuildMutation.data.build_id}`);
    }
  }, [triggerBuildMutation.isSuccess, triggerBuildMutation.data, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            onClick={() => navigate('/repositories')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Repositories
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Github className="h-6 w-6" /> {repoFullName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure branches for automatic building and trigger manual builds.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={saveMutation.isPending || isLoading}
            onClick={handleSave}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Auto-Build Config
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Configuration</CardTitle>
          <CardDescription>
            Select branches for automatic builds on push, or trigger a manual build.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBranchError ? (
            <div className="flex flex-col items-center justify-center p-8 text-destructive">
              <h3 className="text-lg font-semibold">Error loading branches</h3>
              <p className="text-center mt-2 max-w-md">
                {errorBranches?.message || 'An unknown error occurred.'}
              </p>
            </div>
          ) : (
            <BranchConfigList
              branches={branches}
              selectedBranches={selectedBranches}
              isLoading={isLoading}
              isSavingConfig={saveMutation.isPending}
              isTriggeringBuildForBranch={isTriggeringBuildForBranch}
              onBranchToggle={handleBranchToggle}
              onTriggerBuild={handleTrigger}
            />
          )}
          {isLoading && !isBranchError && (
            <p className="text-sm text-muted-foreground mt-4">Loading...</p>
          )}
          {isConfigFetchError && !isBranchError && (
            <p className="text-sm text-destructive mt-4">
              Could not load existing configuration: {errorConfig?.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
