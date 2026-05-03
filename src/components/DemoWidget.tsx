import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDemoScenario } from "@/lib/queries";
import { Loader2 } from "lucide-react";

const DemoWidget = () => {
  const [selectedDataset, setSelectedDataset] = useState<"gut" | "oral" | "skin">("gut");
  const [sampleSize, setSampleSize] = useState([50]);
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading, isError, error } = useDemoScenario(
    selectedDataset,
    sampleSize[0]
  );

  const handleRunDemo = () => {
    setShowResults(true);
  };

  const getChartData = () => {
    if (!data?.metadata?.taxa_abundance) return [];

    return data.metadata.taxa_abundance.map((taxon) => ({
      name: taxon.taxon,
      value: Math.round(taxon.abundance * 10) / 10,
    }));
  };

  const getAlphaDiversityData = () => {
    if (!data?.metadata?.alpha_diversity) return [];

    const diversity = data.metadata.alpha_diversity;
    return [
      { metric: "Shannon", value: diversity.overall?.shannon || 0 },
      { metric: "Simpson", value: diversity.overall?.simpson || 0 },
    ];
  };

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading demo data</p>
            <p className="text-sm mt-1">{error?.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Try the Live Demo</CardTitle>
        <CardDescription>
          Explore microbiome data with pre-configured scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset</label>
            <Select value={selectedDataset} onValueChange={(value: "gut" | "oral" | "skin") => {
              setSelectedDataset(value);
              setShowResults(false);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gut">Gut Microbiome</SelectItem>
                <SelectItem value="oral">Oral Microbiome</SelectItem>
                <SelectItem value="skin">Skin Microbiome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Sample Size: {sampleSize[0]}
            </label>
            <Slider
              value={sampleSize}
              onValueChange={(value) => {
                setSampleSize(value);
                setShowResults(false);
              }}
              min={10}
              max={100}
              step={10}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleRunDemo}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Demo
            </Button>
          </div>
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Samples
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.metadata?.total_samples || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Shannon Diversity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.metadata?.alpha_diversity?.overall?.shannon?.toFixed(2) || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Simpson Diversity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.metadata?.alpha_diversity?.overall?.simpson?.toFixed(2) || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Taxonomic Composition</CardTitle>
                      <CardDescription>
                        Relative abundance of bacterial phyla
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            name="Abundance (%)"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Alpha Diversity Metrics</CardTitle>
                      <CardDescription>
                        Species richness and evenness
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={getAlphaDiversityData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Diversity Index"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Explore More */}
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = "/explore";
                    }}
                  >
                    Explore Full Dataset
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DemoWidget;
