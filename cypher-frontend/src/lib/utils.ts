import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBuildDisplayStatus = (
  isLoadingStatus: boolean,
  isStatusError: boolean,
  finalStatus: string | null,
  isLiveStreaming: boolean,
  error: string | null,
): { text: string; className: string } => {
  if (isLoadingStatus) {
    return {
      text: 'Loading Status...',
      className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/50',
    };
  }
  if (isStatusError) {
    return { text: 'Status Error', className: 'text-red-600 bg-red-100 dark:bg-red-900/50' };
  }
  if (finalStatus) {
    switch (finalStatus) {
      case 'success':
        return { text: 'Completed', className: 'text-green-600 bg-green-100 dark:bg-green-900/50' };
      case 'failed':
        return { text: 'Failed', className: 'text-red-600 bg-red-100 dark:bg-red-900/50' };
      case 'running':
        return {
          text: 'Running...',
          className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 animate-pulse',
        };
      case 'pending':
        return {
          text: 'Pending...',
          className: 'text-orange-600 bg-orange-100 dark:bg-orange-900/50',
        };
      case 'cancelled':
        return { text: 'Cancelled', className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/50' };
      default:
        return {
          text: finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1),
          className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/50',
        };
    }
  }
  if (isLiveStreaming) {
    return {
      text: 'Running...',
      className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 animate-pulse',
    };
  }
  if (error) {
    return { text: 'Error', className: 'text-red-600 bg-red-100 dark:bg-red-900/50' };
  }
  return { text: 'Loading...', className: 'text-gray-600 bg-gray-100 dark:bg-gray-900/50' };
};
