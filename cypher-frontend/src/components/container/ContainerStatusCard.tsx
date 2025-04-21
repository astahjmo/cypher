import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Box, Settings, ListTree, Database, Cpu } from 'lucide-react';
import { ContainerDetail, ContainerStatusInfo } from '@/interfaces/container';

interface ContainerStatusCardProps {
  statusInfo: ContainerStatusInfo;
  onConfigureClick: () => void;
  onManageInstancesClick: () => void;
}

export function ContainerStatusCard({
  statusInfo,
  onConfigureClick,
  onManageInstancesClick,
}: ContainerStatusCardProps) {
  const [owner, repoName] = statusInfo.repo_full_name.split('/');
  const totalContainers = statusInfo.running + statusInfo.stopped + statusInfo.paused;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <Box className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{repoName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onConfigureClick}
            title="Configure Runtime"
            className="flex-shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>{owner}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row flex-wrap justify-between items-start gap-x-4 gap-y-2 pb-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Containers</h4>
          <div className="flex flex-col text-sm">
            {statusInfo.running > 0 && (
              <span className="text-success">{statusInfo.running} Running</span>
            )}
            {statusInfo.stopped > 0 && (
              <span className="text-destructive">{statusInfo.stopped} Stopped</span>
            )}
            {statusInfo.paused > 0 && (
              <span className="text-yellow-600 dark:text-yellow-500">
                {statusInfo.paused} Paused
              </span>
            )}
            {totalContainers === 0 && <span className="text-muted-foreground">0 Containers</span>}
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Resources</h4>
          <div className="flex flex-col text-sm">
            {statusInfo.memory_usage_mb !== undefined && statusInfo.memory_usage_mb !== null ? (
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                Mem: {statusInfo.memory_usage_mb}MB
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <Database className="h-3.5 w-3.5" />
                Mem: N/A
              </span>
            )}
            {statusInfo.cpu_usage_percent !== undefined && statusInfo.cpu_usage_percent !== null ? (
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                CPU: {statusInfo.cpu_usage_percent.toFixed(1)}%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <Cpu className="h-3.5 w-3.5" />
                CPU: N/A
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-row flex-wrap justify-center items-center gap-2 pt-4 min-h-[52px]">
        <Button variant="ghost" size="sm" onClick={onManageInstancesClick}>
          <ListTree className="mr-2 h-4 w-4" />
          <span>Manage Instances</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
