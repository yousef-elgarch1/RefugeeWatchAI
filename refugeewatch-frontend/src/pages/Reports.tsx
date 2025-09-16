// src/pages/Reports.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  Clock,
  Filter,
  Share,
  Settings,
  Eye,
  Loader2,
  Plus,
  Archive,
  TrendingUp,
  MapPin,
  Users,
  AlertTriangle
} from "lucide-react";
import { apiService } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'crisis-summary' | 'ai-analysis' | 'metrics-overview' | 'regional-assessment' | 'custom';
  lastGenerated?: string;
  frequency: 'manual' | 'daily' | 'weekly' | 'monthly';
  format: 'pdf' | 'excel' | 'json';
  icon: any;
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  size: string;
  status: 'completed' | 'generating' | 'failed';
  downloadUrl?: string;
}

const Reports = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportFilters, setReportFilters] = useState({
    dateRange: '30d',
    regions: [] as string[],
    riskLevels: [] as string[],
    includeAI: true,
    includePredictions: true
  });
  const { toast } = useToast();

  // Fetch crisis data for report generation
  const { data: crisesData } = useQuery({
    queryKey: ['crises'],
    queryFn: () => apiService.getCrises(),
  });

  // Fetch global metrics for reports
  const { data: metricsData } = useQuery({
    queryKey: ['global-metrics'],
    queryFn: () => apiService.getGlobalMetrics(),
  });

  // Mock report generation mutation (in real implementation, this would call backend)
  const generateReportMutation = useMutation({
    mutationFn: async (template: ReportTemplate) => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
        id: Date.now().toString(),
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        type: template.type,
        generatedAt: new Date().toISOString(),
        size: '2.4 MB',
        status: 'completed' as const,
        downloadUrl: '#'
      };
    },
    onSuccess: (report) => {
      toast({
        title: "Report Generated Successfully",
        description: `${report.name} is ready for download.`,
      });
      setGeneratedReports(prev => [report, ...prev]);
    },
    onError: (error: any) => {
      toast({
        title: "Report Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'crisis-summary',
      name: 'Crisis Summary Report',
      description: 'Comprehensive overview of all active crises with displacement statistics',
      type: 'crisis-summary',
      frequency: 'weekly',
      format: 'pdf',
      icon: AlertTriangle
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis Report',
      description: 'Detailed AI predictions and risk assessments for crisis situations',
      type: 'ai-analysis',
      frequency: 'daily',
      format: 'pdf',
      icon: BarChart3
    },
    {
      id: 'metrics-overview',
      name: 'Global Metrics Dashboard',
      description: 'Key performance indicators and global humanitarian metrics',
      type: 'metrics-overview',
      frequency: 'monthly',
      format: 'excel',
      icon: TrendingUp
    },
    {
      id: 'regional-assessment',
      name: 'Regional Assessment',
      description: 'Region-specific crisis analysis and comparative assessments',
      type: 'regional-assessment',
      frequency: 'weekly',
      format: 'pdf',
      icon: MapPin
    }
  ];

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'Crisis Summary Report - December 2024',
      type: 'crisis-summary',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      size: '3.2 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'AI Analysis Report - Weekly',
      type: 'ai-analysis',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      size: '1.8 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'Global Metrics Dashboard - Q4 2024',
      type: 'metrics-overview',
      generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      size: '4.1 MB',
      status: 'completed',
      downloadUrl: '#'
    }
  ]);

  const crises = crisesData?.data?.crises || [];
  const totalCrises = crises.length;
  const criticalCrises = crises.filter((c: any) => c.riskLevel === 'CRITICAL').length;

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template.id);
    generateReportMutation.mutate(template);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Completed</Badge>;
      case 'generating':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crisis Reports</h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports and export crisis analysis data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              {generatedReports.length} Reports Available
            </Badge>
            
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Report Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reports Generated</p>
                  <p className="text-3xl font-bold text-foreground">{generatedReports.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
                  <p className="text-3xl font-bold text-foreground">6</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Integrated APIs
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                  <p className="text-3xl font-bold text-foreground">{totalCrises}</p>
                </div>
                <MapPin className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Countries monitored
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                  <p className="text-3xl font-bold text-foreground">Live</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Real-time data
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Report Templates */}
            <div className="xl:col-span-2 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Plus className="w-5 h-5" />
                    Report Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTemplates.map((template) => (
                      <Card key={template.id} className="border-border bg-muted/20 hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <template.icon className="w-5 h-5 text-primary" />
                              <h3 className="font-semibold text-foreground">{template.name}</h3>
                            </div>
                            <Badge variant="outline" className="text-xs">{template.format.toUpperCase()}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Frequency: {template.frequency}
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleGenerateReport(template)}
                              disabled={generateReportMutation.isPending && selectedTemplate === template.id}
                            >
                              {generateReportMutation.isPending && selectedTemplate === template.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3 mr-1" />
                                  Generate
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Configuration */}
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Filter className="w-5 h-5" />
                    Report Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Date Range</label>
                    <select 
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                      value={reportFilters.dateRange}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                      <option value="all">All time</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Risk Levels</label>
                    <div className="space-y-2">
                      {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
                        <label key={level} className="flex items-center space-x-2 text-sm">
                          <input 
                            type="checkbox" 
                            className="rounded border-border" 
                            defaultChecked 
                          />
                          <span className="text-foreground">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Include Analysis</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input 
                          type="checkbox" 
                          className="rounded border-border" 
                          checked={reportFilters.includeAI}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, includeAI: e.target.checked }))}
                        />
                        <span className="text-foreground">AI Analysis</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input 
                          type="checkbox" 
                          className="rounded border-border" 
                          checked={reportFilters.includePredictions}
                          onChange={(e) => setReportFilters(prev => ({ ...prev, includePredictions: e.target.checked }))}
                        />
                        <span className="text-foreground">Predictions</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Data Preview */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Eye className="w-5 h-5" />
                    Data Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Crises:</span>
                    <span className="text-sm font-medium text-foreground">{totalCrises}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Critical:</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{criticalCrises}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">High Risk:</span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {crises.filter((c: any) => c.riskLevel === 'HIGH').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Data Quality:</span>
                    <Badge variant="outline" className="text-xs">98%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Archive className="w-5 h-5" />
                Generated Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-foreground">{report.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
                          <span>•</span>
                          <span>Size: {report.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(report.status)}
                      
                      {report.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <template.icon className="w-5 h-5" />
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div className="font-medium text-foreground capitalize">{template.type.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Format:</span>
                      <div className="font-medium text-foreground">{template.format.toUpperCase()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <div className="font-medium text-foreground capitalize">{template.frequency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Generated:</span>
                      <div className="font-medium text-foreground">
                        {template.lastGenerated ? new Date(template.lastGenerated).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleGenerateReport(template)}
                      disabled={generateReportMutation.isPending}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Generate Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;