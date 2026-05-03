import { QueryFunction } from "@tanstack/react-query";

// GitHub repository configuration
const GITHUB_REPO = "SheratonMV/FAIRDatabase";
const GITHUB_BRANCH = "main"; // or specific tag like "v1.0.0"
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`;

// TypeScript interfaces for GitHub config files
export interface ExampleQuery {
  id: string;
  name: string;
  description: string;
  dataset: string;
  filters: Record<string, any>;
  visualization: string;
  category: string;
}

export interface ExampleWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  category: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  action: string;
  parameters?: Record<string, any>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  dataset: string;
  sample_size: number;
  filters: Record<string, any>;
  expected_results: string;
  use_case: string;
}

export interface ExampleQueriesJson {
  version: string;
  queries: ExampleQuery[];
}

export interface ExampleWorkflowsJson {
  version: string;
  workflows: ExampleWorkflow[];
}

export interface ScenariosJson {
  version: string;
  scenarios: Scenario[];
}

// GitHub API client
class GitHubConfigService {
  private baseUrl: string;

  constructor(baseUrl: string = GITHUB_RAW_URL) {
    this.baseUrl = baseUrl;
  }

  // Fetch example queries from GitHub
  async getExampleQueries(): Promise<ExampleQueriesJson> {
    try {
      const response = await fetch(
        `${this.baseUrl}/demo-config/example_queries.json`
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("example_queries.json not found in GitHub repo, using fallback");
          return this.getFallbackExampleQueries();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ExampleQueriesJson;
    } catch (error) {
      console.error("Error fetching example queries from GitHub:", error);
      // Return fallback data
      return this.getFallbackExampleQueries();
    }
  }

  // Fetch example workflows from GitHub
  async getExampleWorkflows(): Promise<ExampleWorkflowsJson> {
    try {
      const response = await fetch(
        `${this.baseUrl}/demo-config/example_workflows.json`
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("example_workflows.json not found in GitHub repo, using fallback");
          return this.getFallbackExampleWorkflows();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ExampleWorkflowsJson;
    } catch (error) {
      console.error("Error fetching example workflows from GitHub:", error);
      // Return fallback data
      return this.getFallbackExampleWorkflows();
    }
  }

  // Fetch scenarios from GitHub
  async getScenarios(): Promise<ScenariosJson> {
    try {
      const response = await fetch(
        `${this.baseUrl}/demo-config/scenarios.json`
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("scenarios.json not found in GitHub repo, using fallback");
          return this.getFallbackScenarios();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ScenariosJson;
    } catch (error) {
      console.error("Error fetching scenarios from GitHub:", error);
      // Return fallback data
      return this.getFallbackScenarios();
    }
  }

  // Fallback data for when GitHub is unavailable
  private getFallbackExampleQueries(): ExampleQueriesJson {
    return {
      version: "1.0.0",
      queries: [
        {
          id: "alpha_diversity_gut",
          name: "Gut Microbiome Alpha Diversity",
          description: "Calculate alpha diversity metrics for gut microbiome samples",
          dataset: "gut",
          filters: { max_samples: 100 },
          visualization: "bar_chart",
          category: "Diversity Analysis",
        },
        {
          id: "taxa_abundance_oral",
          name: "Oral Microbiome Taxa Abundance",
          description: "Analyze taxonomic abundance in oral microbiome samples",
          dataset: "oral",
          filters: { max_samples: 50 },
          visualization: "pie_chart",
          category: "Taxonomic Analysis",
        },
        {
          id: "beta_diversity_skin",
          name: "Skin Microbiome Beta Diversity",
          description: "Compare beta diversity between skin microbiome samples",
          dataset: "skin",
          filters: { max_samples: 75 },
          visualization: "pcoa_plot",
          category: "Diversity Analysis",
        },
      ],
    };
  }

  private getFallbackExampleWorkflows(): ExampleWorkflowsJson {
    return {
      version: "1.0.0",
      workflows: [
        {
          id: "gdpr_assessment",
          name: "GDPR Compliance Assessment",
          description: "Assess GDPR compliance of a microbiome dataset",
          category: "GDPR",
          steps: [
            {
              id: "upload",
              title: "Upload Dataset",
              description: "Upload your microbiome dataset",
              action: "upload",
              parameters: {
                accepted_formats: ["csv", "tsv", "biom"],
                max_size: "100MB",
              },
            },
            {
              id: "p29_score",
              title: "Calculate P29 Score",
              description: "Calculate GDPR compliance score",
              action: "calculate_p29",
              parameters: {},
            },
            {
              id: "transform",
              title: "Apply Transformations",
              description: "Apply privacy-preserving transformations if needed",
              action: "transform",
              parameters: {
                methods: ["differential_privacy", "k_anonymity"],
              },
            },
          ],
        },
        {
          id: "diversity_analysis",
          name: "Microbiome Diversity Analysis",
          description: "Complete alpha and beta diversity analysis workflow",
          category: "Analysis",
          steps: [
            {
              id: "select_dataset",
              title: "Select Dataset",
              description: "Choose a microbiome dataset",
              action: "select_dataset",
              parameters: {
                options: ["gut", "oral", "skin"],
              },
            },
            {
              id: "alpha_diversity",
              title: "Alpha Diversity",
              description: "Calculate within-sample diversity",
              action: "calculate_alpha",
              parameters: {
                metrics: ["shannon", "simpson", "observed_otus"],
              },
            },
            {
              id: "beta_diversity",
              title: "Beta Diversity",
              description: "Calculate between-sample diversity",
              action: "calculate_beta",
              parameters: {
                metrics: ["bray_curtis", "jaccard", "unifrac"],
              },
            },
          ],
        },
      ],
    };
  }

  private getFallbackScenarios(): ScenariosJson {
    return {
      version: "1.0.0",
      scenarios: [
        {
          id: "gut_vs_oral",
          name: "Gut vs Oral Microbiome",
          description: "Compare gut and oral microbiome diversity",
          dataset: "gut",
          sample_size: 50,
          filters: {
            comparison: "oral",
            metrics: ["alpha_diversity", "taxa_composition"],
          },
          expected_results: "Higher diversity in gut samples, different dominant taxa",
          use_case: "Comparative microbiome analysis",
        },
        {
          id: "skin_health",
          name: "Skin Microbiome Health Status",
          description: "Analyze skin microbiome by health status",
          dataset: "skin",
          sample_size: 75,
          filters: {
            group_by: "health_status",
            metrics: ["alpha_diversity", "beta_diversity"],
          },
          expected_results: "Diversity differences between healthy and diseased skin",
          use_case: "Dermatological research",
        },
      ],
    };
  }
}

// Export singleton instance
export const githubConfig = new GitHubConfigService();

// React Query query functions
export const exampleQueriesQuery: QueryFunction<ExampleQueriesJson> = async () => {
  return githubConfig.getExampleQueries();
};

export const exampleWorkflowsQuery: QueryFunction<ExampleWorkflowsJson> = async () => {
  return githubConfig.getExampleWorkflows();
};

export const scenariosQuery: QueryFunction<ScenariosJson> = async () => {
  return githubConfig.getScenarios();
};

// Version management
export const getLatestConfigVersion = async (): Promise<string> => {
  try {
    // Try to get version from the first config file
    const queries = await githubConfig.getExampleQueries();
    return queries.version;
  } catch (error) {
    console.error("Error getting config version:", error);
    return "1.0.0";
  }
};

// Update config version (call this when FAIRDatabase releases new version)
export const updateConfigVersion = (newVersion: string) => {
  // This would typically update an environment variable or config file
  console.log(`Updating GitHub config version to: ${newVersion}`);
  // In a real implementation, you might want to store this in localStorage or a config file
  localStorage.setItem("githubConfigVersion", newVersion);
};
