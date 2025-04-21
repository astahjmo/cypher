import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Branch } from '@/interfaces/dashboard';

const BranchRowSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-md border">
    <div className="flex items-center gap-3">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-40" />
    </div>
    <Skeleton className="h-8 w-28" />
  </div>
);

interface BranchConfigListProps {
  branches: Branch[];
  selectedBranches: string[];
  isLoading: boolean;
  isSavingConfig: boolean;
  isTriggeringBuildForBranch: (branchName: string) => boolean;
  onBranchToggle: (branchName: string) => void;
  onTriggerBuild: (branchName: string) => void;
}

export function BranchConfigList({
  branches,
  selectedBranches,
  isLoading,
  isSavingConfig,
  isTriggeringBuildForBranch,
  onBranchToggle,
  onTriggerBuild,
}: BranchConfigListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <BranchRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <p className="text-center mt-2">No branches found for this repository.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {branches.map((branch) => {
        const isTriggering = isTriggeringBuildForBranch(branch.name);
        return (
          <div
            key={branch.name}
            className={cn(
              'flex items-center justify-between p-3 rounded-md border transition-colors duration-150',
              selectedBranches.includes(branch.name) && 'border-primary bg-primary/5',
            )}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={`branch-${branch.name}`}
                checked={selectedBranches.includes(branch.name)}
                onCheckedChange={() => onBranchToggle(branch.name)}
                disabled={isSavingConfig || isTriggering}
                aria-label={`Enable auto-build for ${branch.name}`}
              />
              <label
                htmlFor={`branch-${branch.name}`}
                className="text-sm font-medium cursor-pointer"
              >
                {branch.name}
              </label>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onTriggerBuild(branch.name)}
              disabled={isTriggering || isSavingConfig}
              aria-label={`Trigger build for ${branch.name}`}
            >
              {isTriggering ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Trigger Build
            </Button>
          </div>
        );
      })}
    </div>
  );
}
