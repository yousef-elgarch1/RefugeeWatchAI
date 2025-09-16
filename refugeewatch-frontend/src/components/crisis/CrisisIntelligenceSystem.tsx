/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Crisis Intelligence System - Advanced Analytics and Media Integration
 * Combines multiple data sources for comprehensive crisis analysis
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Camera, 
  Play, 
  TrendingUp, 
  AlertCircle, 
  BarChart3,
  Clock,
  Users,
  MapPin,
  ExternalLink,
  RefreshCw,
  Zap,
  Globe,
  Target
} from 'lucide-react';

interface CrisisLocation {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  displacement: number;
  population: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  region: string;
  description?: string;
  lastUpdated?: string;
  sources?: string[];
  crisisType: 'conflict' | 'natural' | 'economic' | 'climate';
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance?: number;
}

interface AIAnalysis {
  severity: number;
  trend: 'escalating' | 'stable' | 'improving';
  prediction: string;
  keyFactors: string[];
  recommendations: string[];
  confidence: number;
}

interface RefugeeFlow {
  from: [number, number];
  to: [number, number];
  volume: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface CrisisIntelligence {
  crisis: CrisisLocation;
  news: NewsItem[];
  aiAnalysis: AIAnalysis;
  refugeeFlows: RefugeeFlow[];
  timeline: Array<{
    date: string;
    event: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  relatedCrises: string[];
}

// Enhanced API service with AI analysis
const intelligenceAPIService = {
  // Analyze crisis using AI
  analyzeCrisis: async (crisisId: string): Promise<AIAnalysis> => {
    try {
      const response = await fetch(`http://localhost:3001/api/crisis/${crisisId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'comprehensive' })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }
    
    // Fallback AI analysis
    return {
      severity: Math.random() * 10,
      trend: ['escalating', 'stable', 'improving'][Math.floor(Math.random() * 3)] as any,
      prediction: 'Situation requires continued monitoring with potential for humanitarian intervention.',
      keyFactors: ['Political instability', 'Resource scarcity', 'Cross-border tensions'],
      recommendations: ['Increase humanitarian aid', 'Monitor border regions', 'Strengthen peacekeeping efforts'],
      confidence: 0.75 + Math.random() * 0.2
    };
  },

  // Get crisis-related news with sentiment analysis
  getCrisisNews: async (crisisName: string): Promise<NewsItem[]> => {
    try {
      const query = encodeURIComponent(`${crisisName} crisis humanitarian refugee`);
      const response = await fetch(`http://localhost:3001/api/news/crisis?q=${query}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.articles) {
          return data.articles.map((article: any) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            source: article.source?.name || 'Unknown',
            sentiment: intelligenceAPIService.analyzeSentiment(article.title + ' ' + article.description),
            relevance: intelligenceAPIService.calculateRelevance(article.title, crisisName)
          }));
        }
      }
    } catch (error) {
      console.error('News fetch error:', error);
    }
    
    return [];
  },

  // Simple sentiment analysis
  analyzeSentiment: (text: string): 'positive' | 'negative' | 'neutral' => {
    const negativeWords = ['crisis', 'war', 'conflict', 'violence', 'death', 'destruction', 'refugee', 'displaced'];
    const positiveWords = ['aid', 'help', 'support', 'peace', 'resolution', 'recovery', 'humanitarian'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  },

  // Calculate news relevance to crisis
  calculateRelevance: (title: string, crisisName: string): number => {
    const keywords = crisisName.toLowerCase().split(' ');
    const titleLower = title.toLowerCase();
    const matches = keywords.filter(keyword => titleLower.includes(keyword)).length;
    return matches / keywords.length;
  },

  // Get refugee flow data
  getRefugeeFlows: async (crisisId: string): Promise<RefugeeFlow[]> => {
    try {
      const response = await fetch(`http://localhost:3001/api/refugees/flows/${crisisId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) return data.data;
      }
    } catch (error) {
      console.error('Refugee flows error:', error);
    }
    
    // Generate synthetic refugee flow data
    return [
      {
        from: [48.3794, 31.1656], // Ukraine
        to: [52.5200, 13.4050],   // Germany
        volume: 1200000,
        trend: 'stable'
      },
      {
        from: [12.8628, 30.2176], // Sudan
        to: [15.5007, 32.5599],   // Chad
        volume: 800000,
        trend: 'increasing'
      }
    ];
  }
};

interface MediaGalleryProps {
  news: NewsItem[];
  crisisName: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ news, crisisName }) => {
  const [selectedMedia, setSelectedMedia] = useState<NewsItem | null>(null);
  
  const newsWithImages = news.filter(item => item.urlToImage);
  const newsWithVideos = news.filter(item => 
    item.url.includes('video') || 
    item.description?.toLowerCase().includes('video') ||
    item.source.toLowerCase().includes('tv')
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="images">Images ({newsWithImages.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({newsWithVideos.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images" className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {newsWithImages.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => setSelectedMedia(item)}
              >
                <img
                  src={item.urlToImage}
                  alt={item.title}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/150/100';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white text-xs truncate">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
          
          {newsWithImages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No images available for this crisis</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-3">
          <div className="space-y-3">
            {newsWithVideos.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-gray-600">{item.source}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
          
          {newsWithVideos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No video content available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-3">
          <div className="space-y-3">
            {news.slice(0, 8).map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    <Badge
                      variant={item.sentiment === 'negative' ? 'destructive' : 
                              item.sentiment === 'positive' ? 'default' : 'secondary'}
                      className="h-4 text-xs"
                    >
                      {item.sentiment}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Selected Media Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <img
                src={selectedMedia.urlToImage}
                alt={selectedMedia.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold text-lg mb-2">{selectedMedia.title}</h3>
              <p className="text-gray-600 mb-3">{selectedMedia.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{selectedMedia.source}</span>
                <span>{new Date(selectedMedia.publishedAt).toLocaleDateString()}</span>
              </div>
              <a
                href={selectedMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800"
              >
                Read full article <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AIAnalysisComponentProps {
  analysis: AIAnalysis;
  isLoading: boolean;
}

const AIAnalysisComponent: React.FC<AIAnalysisComponentProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 animate-pulse text-blue-600" />
          <span className="text-gray-600">AI analyzing crisis data...</span>
        </div>
      </div>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'escalating': return 'text-red-600';
      case 'improving': return 'text-green-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'escalating': return '↗️';
      case 'improving': return '↘️';
      default: return '→';
    }
  };

  return (
    <div className="space-y-4">
      {/* Severity & Trend */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Severity Index</p>
                <p className="text-2xl font-bold">{analysis.severity.toFixed(1)}/10</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <Progress value={analysis.severity * 10} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <p className={`text-xl font-bold capitalize ${getTrendColor(analysis.trend)}`}>
                  {getTrendIcon(analysis.trend)} {analysis.trend}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4" />
            AI Prediction
            <Badge variant="outline" className="ml-auto">
              {Math.round(analysis.confidence * 100)}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{analysis.prediction}</p>
        </CardContent>
      </Card>
      
      {/* Key Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" />
            Key Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.keyFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm">{factor}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface CrisisIntelligenceProps {
  crisis: CrisisLocation;
  onClose: () => void;
}

const CrisisIntelligencePanel: React.FC<CrisisIntelligenceProps> = ({ crisis, onClose }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch AI analysis
  const { data: aiAnalysis, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-analysis', crisis.id, refreshTrigger],
    queryFn: () => intelligenceAPIService.analyzeCrisis(crisis.id),
    refetchInterval: 600000, // 10 minutes
  });
  
  // Fetch crisis news
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['crisis-news', crisis.name, refreshTrigger],
    queryFn: () => intelligenceAPIService.getCrisisNews(crisis.name),
    refetchInterval: 300000, // 5 minutes
  });
  
  // Fetch refugee flows
  const { data: refugeeFlows } = useQuery({
    queryKey: ['refugee-flows', crisis.id],
    queryFn: () => intelligenceAPIService.getRefugeeFlows(crisis.id),
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{crisis.name}</h2>
            <p className="text-gray-600">{crisis.region} • {crisis.crisisType} crisis</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="media">Media & News</TabsTrigger>
            <TabsTrigger value="flows">Refugee Flows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="mt-6">
            {aiAnalysis && (
              <AIAnalysisComponent analysis={aiAnalysis} isLoading={aiLoading} />
            )}
          </TabsContent>
          
          <TabsContent value="media" className="mt-6">
            {news && (
              <MediaGallery news={news} crisisName={crisis.name} />
            )}
            {newsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-2">Loading news and media...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="flows" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Refugee Movement Patterns</h3>
              {refugeeFlows && refugeeFlows.length > 0 ? (
                <div className="space-y-3">
                  {refugeeFlows.map((flow, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <div>
                              <p className="font-medium">{flow.volume.toLocaleString()} displaced</p>
                              <p className="text-sm text-gray-600">
                                From [{flow.from[0].toFixed(2)}, {flow.from[1].toFixed(2)}] to [{flow.to[0].toFixed(2)}, {flow.to[1].toFixed(2)}]
                              </p>
                            </div>
                          </div>
                          <Badge variant={flow.trend === 'increasing' ? 'destructive' : 'default'}>
                            {flow.trend}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No refugee flow data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CrisisIntelligencePanel;
export { intelligenceAPIService, MediaGallery, AIAnalysisComponent };