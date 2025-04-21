import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Settings, Play } from 'lucide-react';
import { RepositoryConfig, ConfiguredReposListProps } from '@/interfaces/dashboard';
import { formatDateTimeLocal, formatTimeAgo } from '@/lib/dateUtils';

const ConfiguredRepoCardSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </CardTitle>
      <div className="text-sm text-muted-foreground pt-1">
        <Skeleton className="h-4 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2 mt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-28" />
    </CardFooter>
  </Card>
);

export function ConfiguredReposList({
  isLoading,
  isError,
  repoConfigs,
  onRunBuildClick,
  isTriggeringBuild,
  onAddRepositoryClick,
}: ConfiguredReposListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <ConfiguredRepoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-destructive">
          Error loading configured repositories.
        </CardContent>
      </Card>
    );
  }

  if (repoConfigs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Github className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No repositories configured</h3>
          <p className="text-muted-foreground text-center mt-2">
            Add your first repository to start building
          </p>
          <Button className="mt-4" onClick={onAddRepositoryClick}>
            Add Repository
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repoConfigs.map((config) => (
        <Card key={config._id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Github className="h-5 w-5" /> {config.repo_full_name.split('/')[1]}
            </CardTitle>
            <CardDescription>{config.repo_full_name.split('/')[0]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm font-medium">Auto-build branches:</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {config.auto_build_branches.length > 0 ? (
                    config.auto_build_branches.map((branch) => (
                      <span
                        key={branch}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      >
                        {branch}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Last updated:</div>
                <div
                  className="text-sm text-muted-foreground"
                  title={formatDateTimeLocal(config.updated_at)}
                >
                  {formatTimeAgo(config.updated_at)}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/repositories/${config.repo_full_name}`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button
              size="sm"
              onClick={() => onRunBuildClick(config.repo_full_name)}
              disabled={isTriggeringBuild}
            >
              <span className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Run Build
              </span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
