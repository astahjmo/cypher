import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Terminal, GitCommitHorizontal } from 'lucide-react';
import { cn, getBuildDisplayStatus } from '@/lib/utils';
import { BuildStatusData, DisplayLog } from '@/interfaces/build';
import { BuildLogViewer } from '@/components/build/BuildLogViewer';
import { useBuildLogs } from '@/hooks/useBuildLogs';
import { formatDateTimeLocal } from '@/lib/dateUtils';

export default function BuildDetail() {
  const params = useParams<{ buildId: string }>();
  const buildId = params.buildId;
  const navigate = useNavigate();

  const {
    logs,
    isLiveStreaming,
    finalStatus,
    streamError,
    isLoadingLogs,
    initialBuildStatus,
    isLoadingStatus,
    isStatusError,
    statusError,
  } = useBuildLogs(buildId);

  const displayStatus = getBuildDisplayStatus(
    isLoadingStatus,
    isStatusError,
    finalStatus,
    isLiveStreaming,
    streamError,
  );

  const pageError = isStatusError
    ? statusError?.message || 'Failed to load build status.'
    : streamError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Build Details</h1>
          <p className="text-muted-foreground mt-1">Build ID: {buildId || 'N/A'}</p>
          {initialBuildStatus?.commit_sha && (
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <GitCommitHorizontal size={14} />
              <span className="font-medium">{initialBuildStatus.commit_sha.substring(0, 7)}:</span>
              <span className="italic">
                {initialBuildStatus.commit_message || 'No commit message'}
              </span>
            </div>
          )}
        </div>
        <div className={cn('text-sm font-medium px-2 py-1 rounded-full', displayStatus.className)}>
          {displayStatus.text}
        </div>
      </div>

      {isStatusError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Build</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{pageError}</p>
          </CardContent>
        </Card>
      )}

      {!isStatusError && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" /> Build Logs
            </CardTitle>
            {streamError && (
              <CardDescription className="text-destructive">{streamError}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <BuildLogViewer
              logs={logs}
              isLoadingStatus={isLoadingStatus}
              isLiveStreaming={isLiveStreaming}
              isLoadingLogs={isLoadingLogs}
              initialBuildStatus={initialBuildStatus}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
