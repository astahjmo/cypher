import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { performContainerAction } from '@/services/api/containerService';

export function useContainerActions() {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleAction = async (
    action: 'start' | 'stop' | 'remove',
    containerId: string,
  ): Promise<boolean> => {
    const loadingKey = `${action}-${containerId}`;
    setActionLoading((prev) => ({ ...prev, [loadingKey]: true }));
    let success = false;
    try {
      await performContainerAction(action, containerId);
      success = true;
      toast({
        title: `Container ${action === 'remove' ? 'Removed' : action === 'start' ? 'Started' : 'Stopped'}`,
        description: `Successfully ${action}ed container ${containerId}.`,
      });
    } catch (error) {
      console.error(`Failed to ${action} container:`, error);
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
        description: error instanceof Error ? error.message : `Could not ${action} container.`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
    return success;
  };

  const isLoadingAction = (action: 'start' | 'stop' | 'remove', containerId: string): boolean => {
    return !!actionLoading[`${action}-${containerId}`];
  };

  return {
    handleAction,
    isLoadingAction,
  };
}
