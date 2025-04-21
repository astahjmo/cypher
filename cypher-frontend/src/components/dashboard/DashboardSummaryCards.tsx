import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Play, RefreshCw } from 'lucide-react';

const SummaryCardSkeleton = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-7 w-12 mb-1" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

interface DashboardSummaryCardsProps {
  isLoadingRepos: boolean;
  repositoriesCount: number;
  isLoadingConfigs: boolean;
  repoConfigsCount: number;
  isLoadingBuilds: boolean;
  buildStatusesCount: number;
}

export function DashboardSummaryCards({
  isLoadingRepos,
  repositoriesCount,
  isLoadingConfigs,
  repoConfigsCount,
  isLoadingBuilds,
  buildStatusesCount,
}: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Repositories</CardTitle>
          <Github className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingRepos ? (
            <>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{repositoriesCount}</div>
              <p className="text-xs text-muted-foreground">
                {repositoriesCount === 1 ? 'Repository' : 'Repositories'} connected
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {isLoadingConfigs ? (
        <SummaryCardSkeleton title="Active Pipelines" icon={Play} />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repoConfigsCount}</div>
            <p className="text-xs text-muted-foreground">Configured pipelines</p>
          </CardContent>
        </Card>
      )}

      {isLoadingBuilds ? (
        <SummaryCardSkeleton title="Recent Builds" icon={RefreshCw} />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Builds</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildStatusesCount}</div>
            <p className="text-xs text-muted-foreground">Builds in the last 24 hours</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
