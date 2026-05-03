import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDatasets, useDataset } from "@/lib/queries";
import { Loader2 } from "lucide-react";

const Explore = () => {
  const [selectedDataset, setSelectedDataset] = useState("gut");
  const [sampleSize, setSampleSize] = useState([100]);

  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets();
  const { data: datasetData, isLoading: datasetLoading } = useDataset(
    selectedDataset,
    { max_samples: sampleSize[0] }
  );

  const isLoading = datasetsLoading || datasetLoading;

  const getTaxaChartData = () => {
    if (!datasetData?.metadata?.taxa_abundance) return [];

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280", "#ef4444", "#06b6d4"];

    return datasetData.metadata.taxa_abundance.map((taxon, index) => ({
      name: taxon.taxon,
      value: Math.round(taxon.abundance * 10) / 10,
      color: colors[index % colors.length],
    }));
  };

  const getAlphaDiversityData = () => {
    if (!datasetData?.metadata?.alpha_diversity) return [];

    const diversity = datasetData.metadata.alpha_diversity;
    const groups = Object.keys(diversity).filter(key => key !== 'overall');

    return groups.map(group => ({
      group: group.charAt(0).toUpperCase() + group.slice(1),
      shannon: diversity[group].shannon || 0,
      simpson: diversity[group].simpson || 0,
    }));
  };

  const handleRunAnalysis = () => {
    // The query will automatically re-run when sample size changes
    // due to React Query's dependency tracking
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="pt-20 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Microbiome Data</h1>
        <p className="text-lg text-gray-600 mb-8">
          Interactive exploration of FAIRDatabase microbiome datasets
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Dataset Selection</CardTitle>
                  <CardDescription>Choose a microbiome dataset to explore</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {datasetsData?.datasets.map(dataset => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.samples} samples)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample Size: {sampleSize[0]}</label>
                    <Slider
                      value={sampleSize}
                      onValueChange={setSampleSize}
                      max={200}
                      min={10}
                      step={10}
                    />
                  </div>

                  <Button className="w-full" onClick={handleRunAnalysis}>Run Analysis</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dataset Information</CardTitle>
                  <CardDescription>Metadata and statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Samples</p>
                      <p className="text-2xl font-bold">
                        {datasetData?.metadata?.total_samples || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Selected Samples</p>
                      <p className="text-2xl font-bold">{sampleSize[0]}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-sm text-gray-700">
                      {datasetData ? `This dataset contains 16S rRNA sequencing data from ${datasetData.dataset} samples.
                      Data has been processed using standard bioinformatics pipelines and stored according to FAIR principles.` :
                      'Select a dataset to view its description.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common analysis workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Alpha Diversity Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Beta Diversity (PCoA)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Differential Abundance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Taxonomic Composition
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alpha Diversity</CardTitle>
                  <CardDescription>Species richness and evenness metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getAlphaDiversityData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="group" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="shannon" fill="#3b82f6" name="Shannon Index" />
                      <Bar dataKey="simpson" fill="#10b981" name="Simpson Index" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxonomic Composition</CardTitle>
                  <CardDescription>Relative abundance at phylum level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getTaxaChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {getTaxaChartData().map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Understanding These Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Alpha Diversity</h3>
                <p className="text-sm text-gray-600">
                  Alpha diversity measures the diversity within individual samples. Higher Shannon and Simpson indices indicate greater diversity. These metrics help understand the overall microbial richness and evenness in your samples.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Taxonomic Composition</h3>
                <p className="text-sm text-gray-600">
                  This chart shows the relative abundance of different bacterial phyla in your selected dataset. Understanding the taxonomic composition is crucial for identifying characteristic microbial signatures associated with different conditions or environments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Explore;
