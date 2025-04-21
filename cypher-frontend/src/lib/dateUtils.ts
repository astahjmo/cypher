import { format } from 'date-fns';

export const formatDateTimeLocal = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date string provided');
    return format(date, 'Pp');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

export const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date string provided');

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 0) {
      if (diffSeconds < -60) {
        return `in the future? (${formatDateTimeLocal(dateString)})`;
      }
      return 'just now';
    }

    if (diffSeconds < 5) return `just now`;
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting time ago:', dateString, error);
    return 'Invalid Date';
  }
};

export const getFormattedDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};
