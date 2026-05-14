import { useQuery, useQueries, UseQueryOptions, UseQueryResult, QueryClient } from "@tanstack/react-query";
import {
  api,
  DatasetListResponse,
  DatasetQueryResponse,
  QueryFilters,
  mockDatasets,
  mockQueryResponse,
  ApiError,
} from "./api";

// Query keys
export const queryKeys = {
  datasets: ["datasets"] as const,
  dataset: (id: string, filters?: QueryFilters) =>
    ["dataset", id, filters] as const,
  githubConfig: (path: string) => ["github-config", path] as const,
};

// Hook for fetching all datasets
export const useDatasets = (
  options?: UseQueryOptions<DatasetListResponse, ApiError>
): UseQueryResult<DatasetListResponse, ApiError> => {
  return useQuery({
    queryKey: queryKeys.datasets,
    queryFn: async () => {
      try {
        return await api.getDatasets();
      } catch (error) {
        // Fallback to mock data in development
        if (import.meta.env.DEV) {
          console.warn("Using mock datasets data in development");
          return mockDatasets;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry 3 times for network errors, but not for 4xx errors
      if (error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

// Hook for querying a specific dataset
export const useDataset = (
  datasetId: string,
  filters?: QueryFilters,
  options?: UseQueryOptions<DatasetQueryResponse, ApiError>
): UseQueryResult<DatasetQueryResponse, ApiError> => {
  return useQuery({
    queryKey: queryKeys.dataset(datasetId, filters),
    queryFn: async () => {
      try {
        return await api.queryDataset(datasetId, filters);
      } catch (error) {
        // Fallback to mock data in development
        if (import.meta.env.DEV) {
          console.warn(`Using mock data for dataset ${datasetId} in development`);
          return mockQueryResponse(datasetId, filters?.max_samples);
        }
        throw error;
      }
    },
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry 3 times for network errors, but not for 4xx errors
      if (error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

// Hook for pre-configured demo scenarios
export const useDemoScenario = (
  scenario: "gut" | "oral" | "skin" = "gut",
  sampleSize: number = 100
) => {
  const filters: QueryFilters = {
    max_samples: sampleSize,
  };

  const result = useDataset(scenario, filters, {
    staleTime: 1000 * 60 * 10, // 10 minutes for demo data
  });

  return {
    ...result,
    scenario,
    sampleSize,
  };
};

// Hook for comparing multiple datasets
export const useDatasetComparison = (
  datasetIds: string[],
  filters?: QueryFilters
) => {
  // Use useQueries for multiple parallel queries
  const queries = useQueries({
    queries: datasetIds.map((datasetId) => ({
      queryKey: queryKeys.dataset(datasetId, filters),
      queryFn: async () => {
        try {
          return await api.queryDataset(datasetId, filters);
        } catch (error) {
          // Fallback to mock data in development
          if (import.meta.env.DEV) {
            console.warn(`Using mock data for dataset ${datasetId} in development`);
            return mockQueryResponse(datasetId, filters?.max_samples);
          }
          throw error;
        }
      },
      enabled: datasetIds.length > 0,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error;

  return {
    queries,
    isLoading,
    isError,
    error,
    data: queries.map((q) => q.data),
  };
};

// Hook for searching/filtering datasets
export const useDatasetSearch = (searchTerm: string) => {
  const { data, isLoading, error } = useDatasets();

  const filteredDatasets = data?.datasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    datasets: filteredDatasets || [],
    isLoading,
    error,
  };
};

// Hook for getting dataset statistics
export const useDatasetStats = () => {
  const { data, isLoading, error } = useDatasets();

  const stats = {
    totalDatasets: data?.datasets.length || 0,
    totalSamples: data?.datasets.reduce((sum, d) => sum + d.samples, 0) || 0,
    lastUpdated: data?.datasets.reduce((latest, d) => {
      const currentDate = new Date(d.last_updated);
      const latestDate = latest ? new Date(latest) : currentDate;
      return currentDate > latestDate ? d.last_updated : latest;
    }, "" as string),
  };

  return {
    stats,
    isLoading,
    error,
  };
};

// Prefetch functions for better UX
export const prefetchDatasets = async (queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.datasets,
    queryFn: () => api.getDatasets(),
  });
};

export const prefetchDataset = async (
  queryClient: QueryClient,
  datasetId: string,
  filters?: QueryFilters
) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.dataset(datasetId, filters),
    queryFn: () => api.queryDataset(datasetId, filters),
  });
};
