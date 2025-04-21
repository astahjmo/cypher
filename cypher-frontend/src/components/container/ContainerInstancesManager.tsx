import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContainerDetail } from '@/interfaces/container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Square, Trash2, Play, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { ContainerLogModal } from '@/components/container/ContainerLogModal';
import { Spinner } from '@/components/Spinner';
import { useContainerActions } from '@/hooks/useContainerActions';

interface ContainerInstancesManagerProps {
  repoFullName: string;
  containers: ContainerDetail[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScale: (repoFullName: string, count: number) => Promise<void>;
}

export function ContainerInstancesManager({
  repoFullName,
  containers,
  open,
  onOpenChange,
  onScale,
}: ContainerInstancesManagerProps) {
  const { toast } = useToast();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedContainerName, setSelectedContainerName] = useState<string | null>(null);
  const [desiredReplicas, setDesiredReplicas] = useState<number>(0);
  const [isScaling, setIsScaling] = useState(false);

  const { handleAction, isLoadingAction } = useContainerActions();

  useEffect(() => {
    if (open) {
      const runningCount = containers.filter((c) => c.status === 'running').length;
      setDesiredReplicas(runningCount);
    }
  }, [open, containers]);

  const handleViewLogsClick = (container: ContainerDetail) => {
    setSelectedContainerId(container.id);
    setSelectedContainerName(container.name);
    setIsLogModalOpen(true);
  };

  const handleScaleClick = async () => {
    const currentRunningCount = containers.filter((c) => c.status === 'running').length;
    if (desiredReplicas === currentRunningCount) return;

    setIsScaling(true);
    try {
      await onScale(repoFullName, desiredReplicas);
      toast({
        title: 'Scaling Initiated',
        description: `Requesting ${desiredReplicas} instances for ${repoFullName}.`,
      });
    } catch (error) {
      console.error('Failed to scale instances:', error);
      toast({
        title: 'Scaling Failed',
        description: error instanceof Error ? error.message : 'Could not initiate scaling.',
        variant: 'destructive',
      });
      setDesiredReplicas(currentRunningCount);
    } finally {
      setIsScaling(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl w-[90vw] flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Instances</DialogTitle>
            <DialogDescription>
              View, start, stop, or remove individual container instances for{' '}
              <span className="font-semibold">{repoFullName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 my-3 border-b pb-3">
            <Label htmlFor="manage-replicas" className="whitespace-nowrap text-sm font-medium">
              Desired Instances:
            </Label>
            <Input
              id="manage-replicas"
              type="number"
              min="0"
              value={desiredReplicas}
              onChange={(e) =>
                setDesiredReplicas(
                  parseInt(e.target.value, 10) >= 0 ? parseInt(e.target.value, 10) : 0,
                )
              }
              className="w-20 h-8 ml-1"
              disabled={isScaling}
            />
            <Button
              size="sm"
              onClick={handleScaleClick}
              disabled={
                isScaling ||
                desiredReplicas === containers.filter((c) => c.status === 'running').length
              }
              className="h-8 flex items-center"
            >
              {isScaling ? <Spinner size="sm" className="mr-1" /> : null}
              Scale
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-3 py-1 pr-4">
              {containers.length === 0 && !isScaling && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active or stopped instances found for this repository.
                </p>
              )}
              {containers.map((container) => {
                const isLoadingStart = isLoadingAction('start', container.id);
                const isLoadingStop = isLoadingAction('stop', container.id);
                const isLoadingRemove = isLoadingAction('remove', container.id);
                const isAnyActionLoading = isLoadingStart || isLoadingStop || isLoadingRemove;

                return (
                  <div
                    key={container.id}
                    className="flex flex-col gap-2 p-3 border rounded bg-background"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-mono truncate font-medium flex-1"
                        title={container.name}
                      >
                        {container.name}
                      </span>
                      <div className="flex flex-row gap-1 flex-shrink-0">
                        {container.status === 'running' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('stop', container.id)}
                            disabled={isAnyActionLoading}
                            className="flex items-center"
                          >
                            {isLoadingStop ? (
                              <Spinner size="sm" className="mr-1" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            <span className="sr-only sm:not-sr-only sm:ml-1">Stop</span>
                          </Button>
                        )}
                        {container.status === 'exited' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAction('start', container.id)}
                              disabled={isAnyActionLoading}
                              className="flex items-center"
                            >
                              {isLoadingStart ? (
                                <Spinner size="sm" className="mr-1" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="sr-only sm:not-sr-only sm:ml-1">Start</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction('remove', container.id)}
                              disabled={isAnyActionLoading}
                              className="flex items-center"
                            >
                              {isLoadingRemove ? (
                                <Spinner size="sm" className="mr-1" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only sm:not-sr-only sm:ml-1">Remove</span>
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewLogsClick(container)}
                          disabled={isAnyActionLoading}
                          className="flex items-center"
                        >
                          <FileText className="h-4 w-4" />{' '}
                          <span className="sr-only sm:not-sr-only sm:ml-1">Logs</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="truncate text-xs" title={`ID: ${container.id}`}>
                        ID: {container.id}
                      </span>
                      <span
                        className={cn(
                          'capitalize text-xs',
                          container.status === 'running' && 'text-success',
                          container.status === 'exited' && 'text-destructive',
                          container.status === 'paused' && 'text-yellow-600 dark:text-yellow-500',
                        )}
                      >
                        Status: {container.status}
                      </span>
                      <span className="truncate text-xs" title={container.image}>
                        Image: {container.image}
                      </span>
                    </div>
                    {container.ports && Object.keys(container.ports).length > 0 && (
                      <div className="flex flex-col text-xs text-muted-foreground border-t pt-2 mt-1">
                        <span className="font-medium mb-1">
                          Ports (Container <ArrowRight className="inline h-3 w-3" /> Host):
                        </span>
                        {Object.entries(container.ports).map(([internal, host]) => (
                          <span key={internal} className="font-mono text-xs">
                            {internal} <ArrowRight className="inline h-3 w-3" /> {host}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContainerLogModal
        repoFullName={repoFullName}
        containerId={selectedContainerId}
        containerName={selectedContainerName}
        open={isLogModalOpen}
        onOpenChange={setIsLogModalOpen}
      />
    </>
  );
}
