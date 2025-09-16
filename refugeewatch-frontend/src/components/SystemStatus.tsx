// src/components/SystemStatus.tsx - FIXED
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Activity, Brain, Database, Globe, Server } from "lucide-react";
import { apiService } from '@/services/api';

const SystemStatus = () => {
  // Health check - FIXED: Wrapped in arrow function
  const { data: health, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(), // FIXED
    refetchInterval: 30000,
  });

  // AI Status - FIXED: Wrapped in arrow function
  const { data: aiStatus, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => apiService.getAIStatus(), // FIXED
    refetchInterval: 60000,
  });

  // Crisis Data - FIXED: Wrapped in arrow function
  const { data: crisesData, isLoading: crisesLoading } = useQuery({
    queryKey: ['crises'],
    queryFn: () => apiService.getCrises(), // FIXED
    refetchInterval: 30000,
  });

  // Data Sources - FIXED: Wrapped in arrow function
  const { data: dataSources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => Promise.resolve({ 
      success: true, 
      data: ['UNHCR', 'REST Countries', 'USGS', 'Open-Meteo', 'NewsAPI', 'Guardian'] 
    }), // FIXED
    refetchInterval: 120000,
  });

  const StatusIcon = ({ status }: { status: 'healthy' | 'warning' | 'error' | 'loading' }) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'loading': return <Activity className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const getOverallStatus = () => {
    if (healthError) return 'error';
    if (healthLoading || aiLoading || crisesLoading) return 'loading';
    if (crisesData?.data?.crises?.length === 0) return 'warning';
    if (health && aiStatus?.data?.status === 'operational') return 'healthy';
    return 'warning';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card className={`border-2 ${
        overallStatus === 'healthy' ? 'border-green-200 bg-green-50' :
        overallStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        overallStatus === 'error' ? 'border-red-200 bg-red-50' :
        'border-blue-200 bg-blue-50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={overallStatus} />
            RefugeeWatch AI System Status
            <Badge variant={
              overallStatus === 'healthy' ? 'default' :
              overallStatus === 'warning' ? 'secondary' :
              overallStatus === 'error' ? 'destructive' :
              'outline'
            }>
              {overallStatus === 'healthy' ? 'Operational' :
               overallStatus === 'warning' ? 'Warning' :
               overallStatus === 'error' ? 'Error' :
               'Loading'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Backend Server Status */}
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Backend Server</p>
                <StatusIcon status={
                  healthLoading ? 'loading' :
                  health ? 'healthy' :
                  'error'
                } />
                <span className="text-xs text-muted-foreground">
                  {healthLoading ? 'Checking...' :
                   health ? 'Connected' :
                   'Disconnected'}
                </span>
              </div>
            </div>

            {/* AI Service Status */}
            <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">GPT-OSS AI</p>
                <StatusIcon status={
                  aiLoading ? 'loading' :
                  aiStatus?.data?.status === 'operational' ? 'healthy' :
                  'warning'
                } />
                <span className="text-xs text-muted-foreground">
                  {aiLoading ? 'Loading...' :
                   aiStatus?.data?.status === 'operational' ? 'Operational' :
                   'Unknown'}
                </span>
              </div>
            </div>

            {/* Crisis Data Status */}
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Crisis Data</p>
                <StatusIcon status={
                  crisesLoading ? 'loading' :
                  Array.isArray(crisesData?.data?.crises) && crisesData.data.crises.length > 0 ? 'healthy' :
                  'warning'
                } />
                <span className="text-xs text-muted-foreground">
                  {Array.isArray(crisesData?.data?.crises) ? `${crisesData.data.crises.length} countries` : '0 countries'}
                </span>
              </div>
            </div>

            {/* Data Sources Status */}
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data Sources</p>
                <StatusIcon status={
                  sourcesLoading ? 'loading' :
                  Array.isArray(dataSources?.data) && dataSources.data.length > 0 ? 'healthy' :
                  'warning'
                } />
                <span className="text-xs text-muted-foreground">
                  {Array.isArray(dataSources?.data) ? dataSources.data.length : 0} sources
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Error */}
      {healthError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Backend Connection Failed:</strong> {healthError.message}
            <br />
            <span className="text-xs mt-1 block">
              Make sure the backend server is running on http://localhost:3001
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Service Details */}
        {aiStatus?.data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Model:</span>
                <code className="text-xs">{aiStatus.data.model}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span>Provider:</span>
                <span>{aiStatus.data.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Availability:</span>
                <span>{aiStatus.data.performance?.availability}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Capabilities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {aiStatus.data.capabilities?.map((cap: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">{cap}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        {health && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Environment:</span>
                <span>{health.environment || 'development'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Version:</span>
                <span>{health.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Uptime:</span>
                <span>{Math.round(health.uptime / 60)} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Memory:</span>
                <span>{health.memory?.used}MB / {health.memory?.total}MB</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;