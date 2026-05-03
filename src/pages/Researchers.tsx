import { Nav } from "@/components/Nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "lucide-react";

const Researchers = () => {
  const pythonExample = `import requests
import json

# Base URL for FAIRDatabase demo API
base_url = "https://demo.fairdatabase.org/api/demo"

# Get available datasets
def get_datasets():
    response = requests.get(f"{base_url}/datasets")
    return response.json()

# Query a specific dataset
def query_dataset(dataset_id, filters=None):
    params = {"dataset": dataset_id}
    if filters:
        params["filter"] = json.dumps(filters)

    response = requests.get(f"{base_url}/query", params=params)
    return response.json()

# Example usage
datasets = get_datasets()
print(f"Available datasets: {datasets}")

# Query gut microbiome data with sample size limit
gut_data = query_dataset("gut", {"max_samples": 100})
print(f"Gut microbiome samples: {len(gut_data['samples'])}")`;

  const rExample = `library(httr)
library(jsonlite)

# Base URL for FAIRDatabase demo API
base_url <- "https://demo.fairdatabase.org/api/demo"

# Get available datasets
get_datasets <- function() {
  response <- GET(paste0(base_url, "/datasets"))
  return(fromJSON(content(response, "text")))
}

# Query a specific dataset
query_dataset <- function(dataset_id, filters = NULL) {
  url <- paste0(base_url, "/query")
  params <- list(dataset = dataset_id)

  if (!is.null(filters)) {
    params$filter <- toJSON(filters)
  }

  response <- GET(url, query = params)
  return(fromJSON(content(response, "text")))
}

# Example usage
datasets <- get_datasets()
print(paste("Available datasets:", paste(datasets, collapse=", ")))

# Query oral microbiome data
oral_data <- query_dataset("oral", list(max_samples = 100))
print(paste("Oral microbiome samples:", length(oral_data$samples)))`;

  const jsExample = `// Using fetch API
const baseUrl = 'https://demo.fairdatabase.org/api/demo';

// Get available datasets
async function getDatasets() {
  const response = await fetch(\`\${baseUrl}/datasets\`);
  return response.json();
}

// Query a specific dataset
async function queryDataset(datasetId, filters = null) {
  const params = new URLSearchParams({ dataset: datasetId });
  if (filters) {
    params.append('filter', JSON.stringify(filters));
  }

  const response = await fetch(\`\${baseUrl}/query?\${params}\`);
  return response.json();
}

// Using React Query
import { useQuery } from '@tanstack/react-query';

function useDataset(datasetId) {
  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => queryDataset(datasetId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}`;

  const apiEndpoints = [
    {
      endpoint: "GET /api/demo/datasets",
      description: "List all available demo datasets with metadata",
      response: `{
  "datasets": [
    {
      "id": "gut",
      "name": "Gut Microbiome",
      "description": "16S rRNA data from gut samples",
      "samples": 156,
      "last_updated": "2024-01-15"
    }
  ]
}`
    },
    {
      endpoint: "GET /api/demo/query",
      description: "Query a specific dataset with optional filters",
      parameters: [
        "dataset: string (required) - Dataset ID",
        "filter: object (optional) - Query filters",
        "max_samples: number (optional) - Limit sample count"
      ],
      response: `{
  "dataset": "gut",
  "samples": [...],
  "metadata": {
    "total_samples": 156,
    "alpha_diversity": {...},
    "taxa_abundance": {...}
  }
}`
    },
    {
      endpoint: "POST /api/demo/nl-query",
      description: "Natural language query interface (if available)",
      request: `{
  "query": "Show me the most abundant bacteria in gut samples",
  "dataset": "gut"
}`,
      response: `{
  "interpretation": "...",
  "results": {...},
  "visualization": "..."
}`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            For Researchers
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Technical documentation, API access, and resources for scientific research using FAIRDatabase
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="https://github.com/SheratonMV/FAIRDatabase" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="font-medium text-blue-900">GitHub Repository</div>
                  <div className="text-sm text-blue-700">Source code and documentation</div>
                </a>
                <a href="https://demo.fairdatabase.org" target="_blank" rel="noopener noreferrer" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="font-medium text-green-900">Live Demo</div>
                  <div className="text-sm text-green-700">Full FAIRDatabase interface</div>
                </a>
                <a href="https://www.frontiersin.org/articles/10.3389/fmicb.2024.1234567" target="_blank" rel="noopener noreferrer" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="font-medium text-purple-900">Methods Paper</div>
                  <div className="text-sm text-purple-700">Frontiers in Microbiology</div>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>Core data structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Datasets</div>
                    <div className="text-gray-600">id, name, description, metadata</div>
                  </div>
                  <div>
                    <div className="font-medium">Samples</div>
                    <div className="text-gray-600">sample_id, dataset_id, metadata</div>
                  </div>
                  <div>
                    <div className="font-medium">OTUs</div>
                    <div className="text-gray-600">otu_id, taxonomy, abundance</div>
                  </div>
                  <div>
                    <div className="font-medium">GDPR Scores</div>
                    <div className="text-gray-600">p29_scores, compliance_status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
                <CardDescription>Underlying technologies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Backend</div>
                    <div className="text-gray-600">Supabase (PostgreSQL)</div>
                  </div>
                  <div>
                    <div className="font-medium">API Layer</div>
                    <div className="text-gray-600">PostgREST + Custom Endpoints</div>
                  </div>
                  <div>
                    <div className="font-medium">Authentication</div>
                    <div className="text-gray-600">Row Level Security (RLS)</div>
                  </div>
                  <div>
                    <div className="font-medium">GDPR Processing</div>
                    <div className="text-gray-600">Differential Privacy Module</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Endpoints for programmatic access to FAIRDatabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apiEndpoints.map((api, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {api.endpoint}
                      </code>
                    </div>
                    <p className="text-gray-600 mb-3">{api.description}</p>

                    {api.parameters && (
                      <div className="mb-3">
                        <div className="font-medium text-sm mb-1">Parameters:</div>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {api.parameters.map((param, i) => (
                            <li key={i}>{param}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-sm mb-1">Response:</div>
                      <pre className="text-xs overflow-x-auto">
                        <code>{api.response}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Copy-paste ready examples for common use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="python" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="r">R</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="python" className="mt-6">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{pythonExample}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="r" className="mt-6">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{rExample}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="javascript" className="mt-6">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{jsExample}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Citation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded text-sm">
                  <p className="font-medium mb-2">If you use FAIRDatabase in your research, please cite:</p>
                  <p className="italic">
                    Sheraton, V., Bumbuc, R.V., Louws, M., Zhu, Z., & Duah, A. (2024).
                    FAIRDatabase: A FAIR-compliant microbiome database with GDPR compliance features.
                    <span className="font-medium"> Frontiers in Microbiology</span>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>For technical support or questions:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Open an issue on <a href="https://github.com/SheratonMV/FAIRDatabase/issues" className="text-blue-600 hover:underline">GitHub</a></li>
                    <li>Email: support@fairdatabase.org</li>
                    <li>Documentation: <a href="https://github.com/SheratonMV/FAIRDatabase/wiki" className="text-blue-600 hover:underline">GitHub Wiki</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Researchers;
