import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '@/config';
import { ContainerStatusInfo } from '@/interfaces/container';
import { useToast } from '@/components/ui/use-toast';

export function useContainerStatusWebSocket() {
  const [containerStatuses, setContainerStatuses] = useState<ContainerStatusInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const getWebSocketURL = useCallback(() => {
    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const baseApiUrl = API_URL.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${baseApiUrl}/api/v1/containers/ws/status`;
  }, []);

  useEffect(() => {
    let isEffectActive = true;
    let reconnectTimeoutId: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        return;
      }

      const wsUrl = getWebSocketURL();
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isEffectActive) {
          setIsConnected(true);
          setWsError(null);
          if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: ContainerStatusInfo[] = JSON.parse(event.data);
          if (isEffectActive) {
            setContainerStatuses(data);
            setIsConnected(true);
            setWsError(null);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (isEffectActive) {
          setWsError('WebSocket connection error.');
          setIsConnected(false);
        }
      };

      ws.onclose = (event) => {
        if (wsRef.current === ws) wsRef.current = null;

        if (isEffectActive) {
          setIsConnected(false);
          if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) {
            setWsError(
              `WebSocket closed unexpectedly (Code: ${event.code}). Attempting to reconnect...`,
            );
            if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
            reconnectTimeoutId = setTimeout(connectWebSocket, 5000);
          } else {
            setWsError(null);
          }
        }
      };
    };

    connectWebSocket();

    return () => {
      isEffectActive = false;
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      const wsToClose = wsRef.current;
      if (wsToClose) {
        wsToClose.onopen = null;
        wsToClose.onmessage = null;
        wsToClose.onerror = null;
        wsToClose.onclose = null;
        wsToClose.close();
        wsRef.current = null;
      }
    };
  }, [getWebSocketURL]);

  return {
    containerStatuses,
    isConnected,
    wsError,
  };
}
