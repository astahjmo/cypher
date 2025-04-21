import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  Check,
  CircleAlert,
  Clock,
  GitCommitHorizontal,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuildStatus } from '@/interfaces/dashboard';
import { formatDateTimeLocal, formatTimeAgo } from '@/lib/dateUtils';

const BuildStatusCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="flex items-center gap-2 mt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
    </CardContent>
  </Card>
);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <Check className="text-success" />;
    case 'failed':
      return <CircleAlert className="text-destructive" />;
    case 'running':
      return <RefreshCw className="text-info animate-spin" />;
    case 'pending':
      return <Clock className="text-warning" />;
    default:
      return <Clock className="text-muted-foreground" />;
  }
};

interface RecentBuildsListProps {
  isLoading: boolean;
  isError: boolean;
  buildStatuses: BuildStatus[];
  onConfigureRepoClick: () => void;
}

export function RecentBuildsList({
  isLoading,
  isError,
  buildStatuses,
  onConfigureRepoClick,
}: RecentBuildsListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(4)].map((_, index) => (
          <BuildStatusCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-destructive">Error loading recent builds.</CardContent>
      </Card>
    );
  }

  if (buildStatuses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-4 rounded-full bg-muted p-3">
            <RefreshCw className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No builds yet</h3>
          <p className="text-muted-foreground text-center mt-2">
            Configure a repository to start your first build
          </p>
          <Button className="mt-4" onClick={onConfigureRepoClick}>
            Configure Repository
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {buildStatuses.map((build) => {
        if (!build || !build._id) {
          console.error('Build object or build._id is missing:', build);
          return (
            <Card key={`error-${Math.random()}`}>
              <CardContent className="p-6 text-destructive">
                Error rendering build card: Missing ID
              </CardContent>
            </Card>
          );
        }
        return (
          <Card
            key={build._id}
            className={cn(
              'overflow-hidden transition-all',
              build.status === 'success' && 'border-l-4 border-l-success',
              build.status === 'failed' && 'border-l-4 border-l-destructive',
              build.status === 'running' && 'border-l-4 border-l-info',
              build.status === 'pending' && 'border-l-4 border-l-warning',
            )}
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    {getStatusIcon(build.status)}
                  </div>
                  <div>
                    <div className="font-semibold">{build.repo_full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Branch: <span className="font-medium">{build.branch}</span>
                    </div>
                    {build.commit_sha && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <GitCommitHorizontal size={12} /> {build.commit_sha.substring(0, 7)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          build.status === 'success' && 'bg-success/10 text-success',
                          build.status === 'failed' && 'bg-destructive/10 text-destructive',
                          build.status === 'running' && 'bg-info/10 text-info',
                          build.status === 'pending' && 'bg-warning/10 text-warning',
                        )}
                      >
                        {build.status.charAt(0).toUpperCase() + build.status.slice(1)}
                      </span>
                      <span
                        className="text-xs text-muted-foreground"
                        title={formatDateTimeLocal(
                          build.status === 'running' || build.status === 'pending'
                            ? build.started_at || build.created_at
                            : build.completed_at,
                        )}
                      >
                        {build.status === 'running' || build.status === 'pending'
                          ? 'Started ' + formatTimeAgo(build.started_at || build.created_at)
                          : 'Completed ' + formatTimeAgo(build.completed_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/builds/${build._id}`)}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
