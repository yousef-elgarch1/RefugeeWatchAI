/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RefugeeWatch AI - FULLY DEBUGGED API Service
 * This version will show you exactly what's happening
 * @version 2.1.0 - DEBUG
 */

// Check environment variables
console.log('🔍 Environment check:');
console.log('- import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('- process.env.NODE_ENV:', import.meta.env.NODE_ENV);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

console.log('🔍 Final API_BASE_URL:', API_BASE_URL);

// ===================================================
// TYPE DEFINITIONS
// ===================================================

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  source?: string;
  lastUpdated?: string;
  metadata?: {
    processingTime?: string;
    dataSource?: string;
    lastUpdate?: string;
    note?: string;
    dataQuality?: string;
    warnings?: string[];
  };
}

export interface CrisisData {
  id: string;
  country: string;
  region: string;
  coordinates: [number, number];
  population: number;
  displacement: number;
  risk: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  lastUpdated: string;
  refugeeData?: RefugeeData;
  climateData?: any;
  newsData?: NewsArticle[];
  crisisTypes?: string[];
  sources?: string[];
}

export interface RefugeeData {
  country: string;
  countryCode: string;
  displacement: {
    total: number;
    refugees: number;
    internal: number;
    asylum_seekers: number;
  };
  destinations: string[];
  year: number;
  lastUpdated: string;
  sources: string[];
}

export interface GlobalMetrics {
  overview: {
    totalCountriesMonitored: number;
    totalDisplaced: number;
    totalRefugees: number;
    totalInternal: number;
    lastUpdate?: string;
    dataQuality?: string;
  };
  displacement: {
    totalAtRisk: number;
    criticalSituations: RefugeeData[];
    averageConfidence: number;
  };
  riskDistribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  trends: {
    yearOverYear: string;
    emergingCrises: RefugeeData[];
    stabilizingRegions: any[];
  };
}

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: string;
  author?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;
  crisisKeywords: string[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  uptime?: number;
  memory?: {
    used: number;
    total: number;
  };
  requestId?: string;
  environment?: string;
}

export interface CrisisLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  population: number;
  displacement: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  region: string;
  capital: string;
  confidence?: number;
}

// ===================================================
// MAIN API SERVICE CLASS - FULLY DEBUGGED
// ===================================================

class ProfessionalAPIService {
  constructor() {
    console.log('🔍 API Service initialized with base URL:', API_BASE_URL);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('=================================');
    console.log('🌐 FRONTEND API REQUEST DEBUG');
    console.log('=================================');
    console.log('📍 Base URL:', API_BASE_URL);
    console.log('📍 Endpoint:', endpoint);
    console.log('📍 Full URL:', url);
    console.log('📍 Method:', options?.method || 'GET');
    console.log('📍 Headers:', options?.headers || 'default');
    console.log('📍 Body:', options?.body || 'none');
    console.log('---------------------------------');
    
    try {
      console.log('⏳ Making fetch request...');
      
      const fetchOptions: RequestInit = {
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          ...options?.headers,
        },
        ...options,
      };
      
      console.log('📋 Final fetch options:', fetchOptions);
      
      const response = await fetch(url, fetchOptions);
      
      console.log('📨 Response received:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - OK:', response.ok);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response data received:');
      console.log('  - Success:', data.success);
      console.log('  - Data keys:', Object.keys(data.data || {}));
      console.log('  - Full response:', data);
      console.log('=================================');
      
      return data;
      
    } catch (error) {
      console.log('=================================');
      console.log('💥 FETCH ERROR DETAILS');
      console.log('=================================');
      console.log('Error type:', error?.constructor?.name);
      console.log('Error message:', error?.message);
      console.log('Error stack:', error?.stack);
      
      // Network error detection
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.log('🔍 DIAGNOSIS: Network connection error');
          console.log('🔍 POSSIBLE CAUSES:');
          console.log('  1. Backend server is not running');
          console.log('  2. Wrong port (backend should be on 3001)');
          console.log('  3. CORS issue');
          console.log('  4. Firewall blocking connection');
        }
      }
      
      // CORS error detection
      if (error?.message?.includes('CORS') || error?.message?.includes('Access-Control')) {
        console.log('🔍 DIAGNOSIS: CORS error');
        console.log('🔍 Backend CORS might not be configured correctly');
      }
      
      console.log('=================================');
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Make sure the server is running on port 3001.`);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown API error occurred');
    }
  }

  // ===================================================
  // CORE ENDPOINTS WITH DEBUGGING
  // ===================================================

  async getCrises(params?: {
    region?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    limit?: number;
  }): Promise<APIResponse<{ crises: CrisisData[]; summary: any }>> {
    console.log('🎯 getCrises called with params:', params);
    
    let endpoint = '/api/crisis';
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      if (params.region) searchParams.append('region', params.region);
      if (params.riskLevel) searchParams.append('riskLevel', params.riskLevel);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      endpoint += `?${searchParams.toString()}`;
    }
    
    return this.request(endpoint);
  }

  async healthCheck(): Promise<APIResponse<HealthStatus>> {
    console.log('🎯 healthCheck called');
    return this.request('/health');
  }

  async getGlobalMetrics(timeframe?: string): Promise<APIResponse<GlobalMetrics>> {
    console.log('🎯 getGlobalMetrics called with timeframe:', timeframe);
    let endpoint = '/api/crisis/metrics/global';
    if (timeframe) {
      endpoint += `?timeframe=${encodeURIComponent(timeframe)}`;
    }
    return this.request(endpoint);
  }


  
  // ===========================================
  // AI ANALYSIS ENDPOINTS - WITH CORRECT PATHS!
  // ===========================================
  
  async getAIStatus() {
    console.log('🎯 getAIStatus called');
    return this.request('/api/ai/status');  // FIXED: Added /api prefix
  }

  async runAIAnalysis(crisisId: string) {
    console.log('🎯 runAIAnalysis called for:', crisisId);
    return this.request(`/api/crisis/${crisisId}/analyze`, {  // FIXED: Added /api prefix
      method: 'POST',
      body: JSON.stringify({
        options: {
          priority: 'standard',
          includeRecommendations: true,
          includePredictions: true
        }
      })
    });
  }

  async generateResponsePlan(crisisId: string, analysisData?: any) {
    console.log('🎯 generateResponsePlan called for:', crisisId);
    return this.request(`/api/crisis/${crisisId}/plan`, {  // FIXED: Added /api prefix
      method: 'POST',
      body: JSON.stringify({
        analysis: analysisData,
        options: {
          phases: ['immediate', 'stabilization', 'integration'],
          includeBudget: true,
          includePersonnel: true
        }
      })
    });
  }

  async getAnalysisHistory(crisisId?: string) {
    console.log('🎯 getAnalysisHistory called');
    const endpoint = crisisId 
      ? `/api/ai/analysis/history?crisisId=${crisisId}`  // FIXED: Added /api prefix
      : '/api/ai/analysis/history';  // FIXED: Added /api prefix
    return this.request(endpoint);
  }

  async getGeographicalData(params?: {
    bounds?: string;
    riskFilter?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Promise<APIResponse<{
    locations: CrisisLocation[];
    count: number;
    totalDisplaced: number;
    riskDistribution: Record<string, number>;
  }>> {
    console.log('🎯 getGeographicalData called with params:', params);
    
    let endpoint = '/api/crisis/geographical';
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      if (params.bounds) searchParams.append('bounds', params.bounds);
      if (params.riskFilter) searchParams.append('riskFilter', params.riskFilter);
      endpoint += `?${searchParams.toString()}`;
    }
    
    return this.request(endpoint);
  }

  // ===================================================
  // CONNECTION TESTING
  // ===================================================

  async testConnection(): Promise<boolean> {
    console.log('🧪 Testing connection to backend...');
    try {
      const result = await this.healthCheck();
      console.log('🧪 Connection test result:', result.success);
      return result.success;
    } catch (error) {
      console.error('🧪 Connection test failed:', error);
      return false;
    }
  }

  // Quick connection test - simpler version
  async quickTest(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // ===================================================
  // LEGACY METHODS FOR COMPATIBILITY
  // ===================================================

  async getActiveCrises(): Promise<APIResponse<{ crises: CrisisData[]; summary: any }>> {
    return this.getCrises();
  }

  async getGeographicalCrisisData(): Promise<APIResponse<{
    locations: CrisisLocation[];
    count: number;
    totalDisplaced: number;
    riskDistribution: any;
  }>> {
    return this.getGeographicalData();
  }
}

// ===================================================
// CREATE SINGLETON INSTANCE
// ===================================================

console.log('🏗️ Creating API service instance...');
export const apiService = new ProfessionalAPIService();

// Test connection immediately when service is created
apiService.quickTest().then(result => {
  if (result.success) {
    console.log('✅ Initial connection test: SUCCESS');
  } else {
    console.log('❌ Initial connection test: FAILED');
    console.log('❌ Error:', result.error);
  }
});

export default apiService;

// ===================================================
// UTILITY FUNCTIONS
// ===================================================

export const formatDisplacement = (number: number): string => {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  return number.toLocaleString();
};

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'CRITICAL': return '#dc2626';
    case 'HIGH': return '#ea580c';
    case 'MEDIUM': return '#ca8a04';
    case 'LOW': return '#16a34a';
    default: return '#6b7280';
  }
};