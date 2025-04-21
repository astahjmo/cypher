import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/config';
import { BuildStatusData, HistoricalLog, DisplayLog } from '@/interfaces/build';
import { fetchBuildStatus, fetchHistoricalLogs } from '@/services/api/buildService';

export function useBuildLogs(buildId: string | undefined) {
  const [logs, setLogs] = useState<DisplayLog[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const {
    data: initialBuildStatus,
    isLoading: isLoadingStatus,
    isError: isStatusError,
    error: statusError,
  } = useQuery<BuildStatusData, Error>({
    queryKey: ['buildStatus', buildId],
    queryFn: () => fetchBuildStatus(buildId!),
    enabled: !!buildId && buildId !== 'undefined',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: historicalLogs,
    isLoading: isLoadingLogs,
    isError: isLogsError,
    error: logsError,
  } = useQuery<HistoricalLog[], Error>({
    queryKey: ['historicalLogs', buildId],
    queryFn: () => fetchHistoricalLogs(buildId!),
    enabled:
      !!buildId &&
      buildId !== 'undefined' &&
      !!initialBuildStatus &&
      !['pending', 'running'].includes(initialBuildStatus.status),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!buildId || buildId === 'undefined') {
      setStreamError('Build ID is missing or invalid.');
      return;
    }
    if (isLoadingStatus) {
      return;
    }
    if (isStatusError) {
      const errorMsg = `Failed to fetch build status: ${statusError?.message || 'Unknown error'}`;
      setStreamError(errorMsg);
      return;
    }

    if (initialBuildStatus) {
      setFinalStatus(initialBuildStatus.status);

      if (['pending', 'running'].includes(initialBuildStatus.status)) {
        setIsLiveStreaming(true);
        setStreamError(null);
        setLogs([
          {
            type: 'info',
            payload: '--- Attempting to connect to live log stream... ---',
            timestamp: new Date().toISOString(),
          },
        ]);

        const SSE_URL = `${API_URL}/build/${buildId}/logs/stream`;

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        eventSourceRef.current = new EventSource(SSE_URL, { withCredentials: true });

        eventSourceRef.current.onopen = () => {
          setLogs((prev) => [
            ...prev,
            {
              type: 'info',
              payload: '--- Connection established, waiting for logs... ---',
              timestamp: new Date().toISOString(),
            },
          ]);
        };

        eventSourceRef.current.onmessage = (event) => {
          const message = event.data;
          let logType: DisplayLog['type'] = 'log';
          if (typeof message === 'string' && message.toUpperCase().startsWith('ERROR:')) {
            logType = 'error';
          }
          setLogs((prev) => [
            ...prev,
            { type: logType, payload: message, timestamp: new Date().toISOString() },
          ]);
        };

        eventSourceRef.current.addEventListener('BUILD_COMPLETE', (event) => {
          const status = (event as MessageEvent).data;
          setFinalStatus(status || 'unknown');
          setIsLiveStreaming(false);
          setLogs((prev) => [
            ...prev,
            {
              type: 'info',
              payload: `--- Build finished (Status: ${status || 'unknown'}) ---`,
              timestamp: new Date().toISOString(),
            },
          ]);
          eventSourceRef.current?.close();
        });

        eventSourceRef.current.addEventListener('ERROR', (event) => {
          const errorMessage = (event as MessageEvent).data;
          setStreamError(`Stream Error: ${errorMessage}`);
          setLogs((prev) => [
            ...prev,
            {
              type: 'error',
              payload: `STREAM ERROR: ${errorMessage}`,
              timestamp: new Date().toISOString(),
            },
          ]);
          setIsLiveStreaming(false);
          setFinalStatus('failed');
          eventSourceRef.current?.close();
        });

        eventSourceRef.current.onerror = (event) => {
          if (eventSourceRef.current?.readyState !== EventSource.CLOSED && !finalStatus) {
            setStreamError('SSE connection error.');
            setLogs((prev) => [
              ...prev,
              {
                type: 'error',
                payload: '--- Build stream connection error ---',
                timestamp: new Date().toISOString(),
              },
            ]);
            setFinalStatus('failed');
          } else if (!finalStatus) {
            setLogs((prev) => [
              ...prev,
              {
                type: 'info',
                payload: '--- Build stream connection closed ---',
                timestamp: new Date().toISOString(),
              },
            ]);
          }
          setIsLiveStreaming(false);
          eventSourceRef.current?.close();
        };
      } else {
        setIsLiveStreaming(false);
        if (isLoadingLogs) {
          setLogs([
            {
              type: 'info',
              payload: '--- Loading historical logs... ---',
              timestamp: new Date().toISOString(),
            },
          ]);
        } else if (isLogsError) {
          const errorMsg = `Failed to load historical logs: ${logsError?.message || 'Unknown error'}`;
          setStreamError(errorMsg);
          setLogs([
            { type: 'error', payload: `--- ${errorMsg} ---`, timestamp: new Date().toISOString() },
          ]);
        } else if (historicalLogs) {
          const formattedLogs: DisplayLog[] = historicalLogs.map((log) => ({
            type: log.type === 'error' ? 'error' : 'log',
            payload: log.message,
            timestamp: log.timestamp,
          }));
          setLogs(formattedLogs);
          setLogs((prev) => [
            ...prev,
            {
              type: 'info',
              payload: `--- Build finished (Status: ${initialBuildStatus.status}) ---`,
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          setLogs([
            {
              type: 'info',
              payload: `--- Build finished (Status: ${initialBuildStatus.status}) ---`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [
    buildId,
    initialBuildStatus,
    isLoadingStatus,
    isStatusError,
    statusError,
    historicalLogs,
    isLoadingLogs,
    isLogsError,
    logsError,
  ]);

  return {
    logs,
    isLiveStreaming,
    finalStatus,
    streamError,
    isLoadingLogs,
    initialBuildStatus,
    isLoadingStatus,
    isStatusError,
    statusError,
  };
}
