import { Nav } from "@/components/Nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, ExternalLink, Github, BookOpen, Server, Lock, Database, Layers } from "lucide-react";

const Researchers = () => {
  const pythonExample = `import requests
import json

# Base URL for FAIRDatabase demo API
base_url = "http://localhost:5000/api/demo"

def get_datasets():
    response = requests.get(f"{base_url}/datasets")
    return response.json()

def query_dataset(dataset_id, filters=None):
    params = {"dataset": dataset_id}
    if filters:
        params["filter"] = json.dumps(filters)
    response = requests.get(f"{base_url}/query", params=params)
    return response.json()

# Example usage
datasets = get_datasets()
print(f"Available datasets: {datasets}")

gut_data = query_dataset("gut", {"max_samples": 100})
print(f"Gut microbiome samples: {len(gut_data['samples'])}")`;

  const rExample = `library(httr)
library(jsonlite)

base_url <- "http://localhost:5000/api/demo"

get_datasets <- function() {
  response <- GET(paste0(base_url, "/datasets"))
  return(fromJSON(content(response, "text")))
}

query_dataset <- function(dataset_id, filters = NULL) {
  url <- paste0(base_url, "/query")
  params <- list(dataset = dataset_id)
  if (!is.null(filters)) {
    params$filter <- toJSON(filters)
  }
  response <- GET(url, query = params)
  return(fromJSON(content(response, "text")))
}

datasets <- get_datasets()
oral_data <- query_dataset("oral", list(max_samples = 100))
print(paste("Oral microbiome samples:", length(oral_data$samples)))`;

  const jsExample = `const baseUrl = 'http://localhost:5000/api/demo';

async function getDatasets() {
  const response = await fetch(\`\${baseUrl}/datasets\`);
  return response.json();
}

async function queryDataset(datasetId, filters = null) {
  const params = new URLSearchParams({ dataset: datasetId });
  if (filters) params.append('filter', JSON.stringify(filters));
  const response = await fetch(\`\${baseUrl}/query?\${params}\`);
  return response.json();
}

// Using React Query
import { useQuery } from '@tanstack/react-query';

function useDataset(datasetId) {
  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => queryDataset(datasetId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}`;

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/demo/datasets",
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
}`,
    },
    {
      method: "GET",
      endpoint: "/api/demo/query",
      description: "Query a specific dataset with optional filters",
      params: ["dataset: string (required) — Dataset ID", "filter: object (optional) — Query filters", "max_samples: number (optional) — Limit sample count"],
      response: `{
  "dataset": "gut",
  "samples": [...],
  "metadata": {
    "total_samples": 156,
    "alpha_diversity": { ... },
    "taxa_abundance": { ... }
  }
}`,
    },
    {
      method: "POST",
      endpoint: "/api/demo/nl-query",
      description: "Natural language query interface",
      request: `{
  "query": "Most abundant bacteria in gut",
  "dataset": "gut"
}`,
      response: `{
  "interpretation": "...",
  "results": { ... },
  "visualization": "..."
}`,
    },
  ];

  const methodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-emerald-100 text-emerald-800",
      POST: "bg-blue-100 text-blue-800",
    };
    return <span className={`px-2 py-0.5 text-xs font-bold rounded font-mono ${colors[method] ?? "bg-slate-100 text-slate-700"}`}>{method}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">For Researchers</h1>
            <p className="text-slate-600 max-w-2xl">
              Technical documentation, API access, and resources for scientific research using FAIRDatabase.
            </p>
          </div>

          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="bg-slate-100 mb-8">
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
            </TabsList>

            {/* Resources Tab */}
            <TabsContent value="resources">
              {/* Quick links + Schema + Stack */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="border-t-2 border-t-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { href: "https://github.com/SheratonMV/FAIRDatabase", icon: Github, label: "GitHub Repository", sub: "Source code and documentation", color: "hover:bg-slate-100 border-slate-200" },
                      { href: "http://localhost:5000", icon: ExternalLink, label: "Live Demo", sub: "FAIRDatabase running locally on port 5000", color: "hover:bg-primary/5 border-primary/20" },
                      { href: "https://www.frontiersin.org/articles/10.3389/fcimb.2024.1384809", icon: BookOpen, label: "Methods Paper", sub: "Frontiers in Cellular and Infection Microbiology", color: "hover:bg-purple-50 border-purple-200" },
                    ].map(({ href, icon: Icon, label, sub, color }) => (
                      <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${color}`}>
                        <Icon className="h-4 w-4 mt-0.5 text-slate-500 shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-slate-800">{label}</p>
                          <p className="text-xs text-slate-500">{sub}</p>
                        </div>
                      </a>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-t-2 border-t-emerald-500">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-500" />
                      Database Schema
                    </CardTitle>
                    <CardDescription>Core data structure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "Datasets", fields: "id, name, description, metadata" },
                      { name: "Samples", fields: "sample_id, dataset_id, metadata" },
                      { name: "OTUs", fields: "otu_id, taxonomy, abundance" },
                      { name: "GDPR Scores", fields: "p29_scores, compliance_status" },
                    ].map(({ name, fields }) => (
                      <div key={name} className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{name}</p>
                          <p className="text-xs text-slate-500 font-mono">{fields}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-t-2 border-t-purple-500">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-purple-500" />
                      Tech Stack
                    </CardTitle>
                    <CardDescription>Underlying technologies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { icon: Database, label: "Backend", value: "Supabase (PostgreSQL)" },
                      { icon: Server, label: "API Layer", value: "PostgREST + Custom Endpoints" },
                      { icon: Lock, label: "Authentication", value: "Row Level Security (RLS)" },
                      { icon: Code, label: "GDPR Processing", value: "Differential Privacy Module" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-sm font-medium text-slate-800">{value}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-t-2 border-t-amber-500">
                  <CardHeader>
                    <CardTitle className="text-base">Citation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm">
                      <p className="font-semibold text-amber-900 mb-2">If you use FAIRDatabase in your research, please cite:</p>
                      <p className="text-amber-800 leading-relaxed italic text-xs">
                        Dorst, M., Zeevenhooven, N., Wilding, R., Mende, D., Brandt, B. W., Zaura, E., ... & Sheraton, V. M. (2024).
                        FAIR compliant database development for human microbiome data samples.{" "}
                        <span className="font-semibold not-italic">Frontiers in Cellular and Infection Microbiology</span>, 14, 1384809.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-t-2 border-t-slate-400">
                  <CardHeader>
                    <CardTitle className="text-base">Support & Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <p>For technical questions or research collaborations:</p>
                    <ul className="space-y-2">
                      {[
                        { label: "Open a GitHub Issue", href: "https://github.com/SheratonMV/FAIRDatabase/issues" },
                        { label: "Email support", href: "mailto:support@fairdatabase.org" },
                        { label: "GitHub Wiki", href: "https://github.com/SheratonMV/FAIRDatabase/wiki" },
                      ].map(({ label, href }) => (
                        <li key={href}>
                          <a href={href} className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium">
                            <ExternalLink className="h-3 w-3" />
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Code Examples Tab */}
            <TabsContent value="examples">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Code Examples</CardTitle>
                  <CardDescription>Copy-paste ready examples for common use cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="python" className="w-full">
                    <TabsList className="bg-slate-100">
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="r">R</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    </TabsList>
                    {[
                      { id: "python", code: pythonExample },
                      { id: "r", code: rExample },
                      { id: "javascript", code: jsExample },
                    ].map(({ id, code }) => (
                      <TabsContent key={id} value={id} className="mt-4">
                        <div className="code-block text-xs leading-relaxed overflow-x-auto">
                          <pre>{code}</pre>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Reference Tab */}
            <TabsContent value="api">
              <Card className="border-t-2 border-t-primary">
                <CardHeader>
                  <CardTitle className="text-base">API Documentation</CardTitle>
                  <CardDescription>Endpoints for programmatic access to FAIRDatabase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {apiEndpoints.map((api, i) => (
                      <div key={i} className={`${i < apiEndpoints.length - 1 ? "border-b border-slate-100 pb-6" : ""}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {methodBadge(api.method)}
                          <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-sm font-mono">{api.endpoint}</code>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{api.description}</p>

                        {api.params && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Parameters</p>
                            <ul className="space-y-1">
                              {api.params.map((p, j) => (
                                <li key={j} className="text-sm text-slate-600 font-mono text-xs bg-slate-50 px-3 py-1 rounded">{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {api.request && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Request Body</p>
                            <div className="code-block text-xs">{api.request}</div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Response</p>
                          <div className="code-block text-xs">{api.response}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Researchers;
