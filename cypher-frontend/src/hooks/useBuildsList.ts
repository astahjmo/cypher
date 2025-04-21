import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BuildListItem } from '@/interfaces/build';
import { fetchBuildsList } from '@/services/api/buildService';

export function useBuildsList() {
  const {
    data: builds = [],
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery<BuildListItem[], Error>({
    queryKey: ['buildsList'],
    queryFn: fetchBuildsList,
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const error = isError
    ? queryError instanceof Error
      ? queryError.message
      : 'An unknown error occurred'
    : null;

  return {
    builds,
    loading,
    error,
  };
}
