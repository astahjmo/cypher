import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ContainerStatusCard } from '@/components/container/ContainerStatusCard';
import { ContainerConfigModal } from '@/components/container/ContainerConfigModal';
import { ContainerInstancesManager } from '@/components/container/ContainerInstancesManager';
import { ContainerStatusInfo, ContainerDetail } from '@/interfaces/container';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { scaleContainers } from '@/services/api/containerService';
import { useContainerStatusWebSocket } from '@/hooks/useContainerStatusWebSocket';

const ContainerGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-8 w-8" />
          </CardTitle>
          <div className="text-sm text-muted-foreground pt-1">
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center items-center">
          <Skeleton className="h-9 w-32" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default function ContainersPage() {
  const { containerStatuses, isConnected, wsError } = useContainerStatusWebSocket();
  const isLoading = !isConnected && containerStatuses.length === 0 && !wsError;
  const error = wsError;

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedRepoForConfig, setSelectedRepoForConfig] = useState<string | null>(null);
  const [isInstancesManagerOpen, setIsInstancesManagerOpen] = useState(false);
  const [selectedRepoForInstances, setSelectedRepoForInstances] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfigureClick = (repoFullName: string) => {
    setSelectedRepoForConfig(repoFullName);
    setIsConfigModalOpen(true);
  };

  const handleManageInstancesClick = (repoFullName: string) => {
    setSelectedRepoForInstances(repoFullName);
    setIsInstancesManagerOpen(true);
  };

  const handleScale = async (repoFullName: string, count: number) => {
    const [repoOwner, repoName] = repoFullName.split('/');
    if (!repoOwner || !repoName) {
      toast({
        title: 'Error',
        description: 'Invalid repository name format.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const result = await scaleContainers(repoOwner, repoName, count);
      toast({
        title: 'Scaling Initiated',
        description: result.message || `Scaling request for ${repoFullName} sent.`,
      });
    } catch (error) {
      toast({
        title: 'Scaling Failed',
        description: error instanceof Error ? error.message : 'Could not initiate scaling.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Container Status</h1>
        <p className="text-muted-foreground">Monitor containers across your repositories</p>
        {!isConnected && !isLoading && (
          <p className="text-sm text-yellow-600 mt-1">
            WebSocket disconnected. Status updates may be delayed.
          </p>
        )}
        {wsError && !isLoading && (
          <p className="text-sm text-destructive mt-1">WebSocket Error: {wsError}</p>
        )}
      </div>

      {isLoading ? (
        <ContainerGridSkeleton />
      ) : error && containerStatuses.length === 0 ? (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Container Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : containerStatuses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containerStatuses.map((statusInfo) => (
            <ContainerStatusCard
              key={statusInfo.repo_full_name}
              statusInfo={statusInfo}
              onConfigureClick={() => handleConfigureClick(statusInfo.repo_full_name)}
              onManageInstancesClick={() => handleManageInstancesClick(statusInfo.repo_full_name)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No container information available. Check if any repositories have running or stopped
            containers managed by Cypher.
          </CardContent>
        </Card>
      )}

      {selectedRepoForConfig && (
        <ContainerConfigModal
          repoFullName={selectedRepoForConfig}
          open={isConfigModalOpen}
          onOpenChange={setIsConfigModalOpen}
        />
      )}

      {selectedRepoForInstances && (
        <ContainerInstancesManager
          repoFullName={selectedRepoForInstances}
          containers={
            containerStatuses.find((s) => s.repo_full_name === selectedRepoForInstances)
              ?.containers || []
          }
          open={isInstancesManagerOpen}
          onOpenChange={setIsInstancesManagerOpen}
          onScale={handleScale}
        />
      )}
    </div>
  );
}
