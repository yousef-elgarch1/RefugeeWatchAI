// src/components/CrisisTable.tsx
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Brain, FileText, MapPin, Users, Clock } from "lucide-react";
import { apiService, CrisisData } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

interface CrisisTableProps {
  crises: CrisisData[];
  loading?: boolean;
}

const CrisisTable: React.FC<CrisisTableProps> = ({ crises, loading }) => {
  const { toast } = useToast();

  // AI Analysis mutation
  const aiAnalysisMutation = useMutation({
    mutationFn: (crisisId: string) => apiService.getAIAnalysis(crisisId),
    onSuccess: (data, crisisId) => {
      toast({
        title: "AI Analysis Complete",
        description: `Analysis completed for ${crisisId}`,
      });
      console.log('AI Analysis Result:', data);
    },
    onError: (error, crisisId) => {
      toast({
        title: "AI Analysis Failed", 
        description: `Failed to analyze ${crisisId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Response Plan mutation
  const responsePlanMutation = useMutation({
    mutationFn: (crisisId: string) => apiService.getResponsePlan(crisisId),
    onSuccess: (data, crisisId) => {
      toast({
        title: "Response Plan Generated",
        description: `Plan ready for ${crisisId}`,
      });
      console.log('Response Plan Result:', data);
    },
    onError: (error, crisisId) => {
      toast({
        title: "Plan Generation Failed",
        description: `Failed to generate plan for ${crisisId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Crisis Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!crises || crises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            No Crisis Data Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No crisis data found. Make sure the backend server is running and connected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Country/Region
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Level
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Affected Population
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </div>
            </TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Actions
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crises.map((crisis) => (
            <TableRow key={crisis.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{crisis.country}</div>
                  <div className="text-sm text-muted-foreground">{crisis.region}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={getRiskBadgeVariant(crisis.riskLevel)}
                  className={`${getRiskColor(crisis.riskLevel)} font-medium`}
                >
                  {crisis.riskLevel}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">
                    {crisis.summary?.estimatedAffected?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-muted-foreground">people at risk</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{crisis.summary?.timeline || 'Ongoing'}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(crisis.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{crisis.confidence}%</div>
                  <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${crisis.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => aiAnalysisMutation.mutate(crisis.id)}
                    disabled={aiAnalysisMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Brain className="w-3 h-3" />
                    {aiAnalysisMutation.isPending && aiAnalysisMutation.variables === crisis.id 
                      ? "Analyzing..." 
                      : "Analyze"
                    }
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => responsePlanMutation.mutate(crisis.id)}
                    disabled={responsePlanMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    {responsePlanMutation.isPending && responsePlanMutation.variables === crisis.id
                      ? "Generating..." 
                      : "Plan"
                    }
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Summary Footer */}
      <Card className="bg-muted/20">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm">
            <span>Total Countries Monitored: <strong>{crises.length}</strong></span>
            <span>Critical: <strong className="text-red-600">{crises.filter(c => c.riskLevel === 'CRITICAL').length}</strong></span>
            <span>High Risk: <strong className="text-orange-600">{crises.filter(c => c.riskLevel === 'HIGH').length}</strong></span>
            <span>Last Update: <strong>{new Date().toLocaleTimeString()}</strong></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisTable;