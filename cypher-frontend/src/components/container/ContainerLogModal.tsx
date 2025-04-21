import React, { useEffect, useState, useRef } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/Spinner';
import { API_URL } from '@/config';

interface ContainerLogModalProps {
  containerId: string | null;
  containerName: string | null;
  repoFullName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerLogModal({
  containerId,
  containerName,
  repoFullName,
  open,
  onOpenChange,
}: ContainerLogModalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!open || !containerId) {
      if (websocketRef.current) {
        websocketRef.current.close(1000, 'Modal closed or container changed');
        websocketRef.current = null;
      }
      setLogs([]);
      setError(null);
      setIsLoading(false);
      setIsConnected(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLogs([]);
    setIsConnected(false);
    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const baseUrl = API_URL.replace(/^http(s?):\/\//, '');
    const wsUrl = `${wsProtocol}://${baseUrl}/api/v1/ws/containers/${containerId}/logs?tail=200`;

    if (websocketRef.current) {
      websocketRef.current.close(1000, 'Starting new connection');
      websocketRef.current = null;
    }

    const ws = new WebSocket(wsUrl);
    websocketRef.current = ws;

    ws.onopen = () => {
      if (websocketRef.current === ws) {
        setIsLoading(false);
        setIsConnected(true);
        setError(null);
      } else {
        ws.close(1000);
      }
    };
    ws.onmessage = (event) => {
      if (websocketRef.current === ws) {
        const d = event.data;
        if (typeof d === 'string' && (d.startsWith('[ERROR]') || d.startsWith('[STREAM ERROR]'))) {
          setError(d);
          setIsConnected(false);
          ws.close(1011);
          websocketRef.current = null;
        } else {
          setLogs((p) => [...p, d]);
        }
      }
    };
    ws.onerror = (event) => {
      if (websocketRef.current === ws) {
        setError('WebSocket connection error.');
        setIsLoading(false);
        setIsConnected(false);
        websocketRef.current = null;
      }
    };
    ws.onclose = (event) => {
      if (websocketRef.current === ws) {
        setIsConnected(false);
        setIsLoading(false);
        if (!error && event.code !== 1000 && !event.wasClean) {
          setError(`WebSocket closed unexpectedly (Code: ${event.code})`);
        }
        websocketRef.current = null;
      }
    };

    return () => {
      if (websocketRef.current === ws) {
        ws.close(1000);
        websocketRef.current = null;
      } else if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000);
      }
    };
  }, [open, containerId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        'div[data-radix-scroll-area-viewport]',
      );
      if (scrollElement) {
        const isScrolledNearBottom =
          scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 50;
        if (isScrolledNearBottom) {
          requestAnimationFrame(() => {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          });
        }
      }
    }
  }, [logs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[90vw] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Container Logs</DialogTitle>
          <DialogDescription>
            Streaming logs via WebSocket for{' '}
            <span className="font-mono font-semibold">{containerName || containerId}</span> from{' '}
            <span className="font-semibold">{repoFullName || 'N/A'}</span>.
            {isLoading && <span className="ml-2 text-muted-foreground italic">Connecting...</span>}
            {isConnected && <span className="ml-2 text-green-600 italic">Connected</span>}
            {error && !isConnected && (
              <span className="ml-2 text-destructive italic">Error: {error}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[60vh] w-full rounded-md border bg-muted/30 p-4 font-mono text-sm my-4"
        >
          {isLoading && logs.length === 0 ? (
            <div className="flex items-center text-muted-foreground/80">
              <Spinner size="sm" className="mr-2" /> Connecting...
            </div>
          ) : error && logs.length === 0 ? (
            <div className="text-destructive">Error loading logs: {error}</div>
          ) : (
            <pre className="whitespace-pre-wrap break-words">
              {logs.length === 0 && isConnected && !error ? (
                <span className="text-muted-foreground italic">Waiting for logs...</span>
              ) : logs.length === 0 && !isConnected && !error && !isLoading ? (
                <span className="text-muted-foreground italic">
                  Log stream closed or not started.
                </span>
              ) : (
                logs.map((line, index) => <div key={index}>{line}</div>)
              )}
              {error && logs.length > 0 && (
                <div className="text-destructive mt-2">Log stream ended with error: {error}</div>
              )}
            </pre>
          )}
        </ScrollArea>
        <DialogFooter className="flex-shrink-0">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
