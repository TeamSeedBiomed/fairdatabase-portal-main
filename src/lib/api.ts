import { QueryFunction } from "@tanstack/react-query";

// Base URL for FAIRDatabase demo API
const API_BASE_URL = "https://demo.fairdatabase.org/api/demo";

// TypeScript interfaces for API responses
export interface Dataset {
  id: string;
  name: string;
  description: string;
  samples: number;
  last_updated: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DatasetListResponse {
  datasets: Dataset[];
}

export interface QueryFilters {
  max_samples?: number;
  min_samples?: number;
  metadata_filters?: Record<string, string | number | boolean>;
}

export interface Sample {
  sample_id: string;
  metadata: Record<string, string | number | boolean>;
  abundances?: Record<string, number>;
}

export interface AlphaDiversity {
  shannon: number;
  simpson: number;
  observed_otus: number;
}

export interface TaxaAbundance {
  taxon: string;
  abundance: number;
  rank: string;
}

export interface DatasetQueryResponse {
  dataset: string;
  samples: Sample[];
  metadata: {
    total_samples: number;
    alpha_diversity: Record<string, AlphaDiversity>;
    taxa_abundance: TaxaAbundance[];
    processing_info: Record<string, string | number | boolean>;
  };
}

export interface ApiError {
  message: string;
  status: number;
  details?: Error | Record<string, unknown>;
}

// API client class
class FAIRDatabaseApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Fetch all available datasets
  async getDatasets(): Promise<DatasetListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/datasets`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as DatasetListResponse;
    } catch (error) {
      console.error("Error fetching datasets:", error);
      throw this.formatError(error);
    }
  }

  // Query a specific dataset
  async queryDataset(
    datasetId: string,
    filters?: QueryFilters
  ): Promise<DatasetQueryResponse> {
    try {
      const params = new URLSearchParams({
        dataset: datasetId,
      });

      if (filters) {
        if (filters.max_samples) {
          params.append("max_samples", filters.max_samples.toString());
        }
        if (filters.min_samples) {
          params.append("min_samples", filters.min_samples.toString());
        }
        if (filters.metadata_filters) {
          params.append("metadata_filters", JSON.stringify(filters.metadata_filters));
        }
      }

      const response = await fetch(`${this.baseUrl}/query?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as DatasetQueryResponse;
    } catch (error) {
      console.error(`Error querying dataset ${datasetId}:`, error);
      throw this.formatError(error);
    }
  }

  // Format error for consistent error handling
  private formatError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
        details: error,
      };
    }
    if (typeof error === 'object' && error !== null) {
      return {
        message: "An unknown error occurred",
        status: 500,
        details: error as Record<string, unknown>,
      };
    }
    return {
      message: "An unknown error occurred",
      status: 500,
      details: undefined,
    };
  }
}

// Export singleton instance
export const api = new FAIRDatabaseApi();

// React Query query functions
export const datasetsQuery: QueryFunction<DatasetListResponse> = async () => {
  return api.getDatasets();
};

export const datasetQuery = (
  datasetId: string,
  filters?: QueryFilters
): QueryFunction<DatasetQueryResponse> => {
  return async () => {
    return api.queryDataset(datasetId, filters);
  };
};

// Mock data fallback for development
export const mockDatasets: DatasetListResponse = {
  datasets: [
    {
      id: "gut",
      name: "Gut Microbiome",
      description: "16S rRNA sequencing data from human gut samples",
      samples: 156,
      last_updated: "2024-01-15",
      metadata: {
        sequencing_platform: "Illumina MiSeq",
        region: "V3-V4",
        primer_set: "341F-805R",
      },
    },
    {
      id: "oral",
      name: "Oral Microbiome",
      description: "16S rRNA sequencing data from oral cavity samples",
      samples: 89,
      last_updated: "2024-01-20",
      metadata: {
        sequencing_platform: "Illumina NovaSeq",
        region: "V4",
        primer_set: "515F-806R",
      },
    },
    {
      id: "skin",
      name: "Skin Microbiome",
      description: "16S rRNA sequencing data from skin samples",
      samples: 234,
      last_updated: "2024-01-10",
      metadata: {
        sequencing_platform: "Illumina MiSeq",
        region: "V1-V3",
        primer_set: "27F-519R",
      },
    },
  ],
};

export const mockQueryResponse = (
  datasetId: string,
  maxSamples: number = 100
): DatasetQueryResponse => {
  const dataset = mockDatasets.datasets.find((d) => d.id === datasetId);
  if (!dataset) {
    throw new Error(`Dataset ${datasetId} not found`);
  }

  const sampleCount = Math.min(maxSamples, dataset.samples);
  const samples: Sample[] = Array.from({ length: sampleCount }, (_, i) => ({
    sample_id: `${datasetId}_sample_${i + 1}`,
    metadata: {
      subject_id: `subject_${Math.floor(i / 2) + 1}`,
      age: Math.floor(Math.random() * 50) + 20,
      gender: Math.random() > 0.5 ? "M" : "F",
      bmi: (Math.random() * 15 + 18.5).toFixed(1),
    },
  }));

  return {
    dataset: datasetId,
    samples,
    metadata: {
      total_samples: dataset.samples,
      alpha_diversity: {
        overall: {
          shannon: parseFloat((Math.random() * 2 + 2.5).toFixed(2)),
          simpson: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
          observed_otus: Math.floor(Math.random() * 500 + 300),
        },
      },
      taxa_abundance: [
        { taxon: "Bacteroides", abundance: Math.random() * 20 + 25, rank: "phylum" },
        { taxon: "Firmicutes", abundance: Math.random() * 15 + 20, rank: "phylum" },
        { taxon: "Proteobacteria", abundance: Math.random() * 10 + 10, rank: "phylum" },
        { taxon: "Actinobacteria", abundance: Math.random() * 8 + 8, rank: "phylum" },
        { taxon: "Other", abundance: Math.random() * 10 + 10, rank: "phylum" },
      ],
      processing_info: {
        pipeline_version: "1.0.0",
        processing_date: new Date().toISOString(),
        quality_threshold: 0.95,
      },
    },
  };
};
