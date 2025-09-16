import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Download, 
  Share2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { countriesData } from '@/data/countries';

interface ResponsePlan {
  id: string;
  title: string;
  country: string;
  flag: string;
  type: 'emergency' | 'comprehensive' | 'preventive';
  status: 'draft' | 'active' | 'completed' | 'under_review';
  priority: 'critical' | 'high' | 'medium' | 'low';
  targetPopulation: number;
  budget: number;
  timeline: string;
  progress: number;
  createdAt: string;
  lastUpdated: string;
  objectives: string[];
  phases: {
    name: string;
    duration: string;
    status: 'completed' | 'in_progress' | 'pending';
    activities: string[];
  }[];
  resourceNeeds: {
    category: string;
    items: { name: string; quantity: number; unit: string; cost: number }[];
  }[];
}

const ResponsePlans = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [planType, setPlanType] = useState('comprehensive');
  const [targetPopulation, setTargetPopulation] = useState('');
  const [timeline, setTimeline] = useState('12');
  const [budget, setBudget] = useState('');

  // Mock response plans data
  const responsePlans: ResponsePlan[] = [
    {
      id: '1',
      title: 'Emergency Response - Earthquake Recovery',
      country: 'Turkey',
      flag: '🇹🇷',
      type: 'emergency',
      status: 'active',
      priority: 'critical',
      targetPopulation: 50000,
      budget: 25000000,
      timeline: '6 months',
      progress: 65,
      createdAt: '2 days ago',
      lastUpdated: '3 hours ago',
      objectives: [
        'Provide emergency shelter for 50,000 displaced persons',
        'Establish medical response capacity for 10,000 injured',
        'Restore basic infrastructure and utilities',
        'Coordinate international humanitarian assistance'
      ],
      phases: [
        {
          name: 'Emergency Response',
          duration: '0-72 hours',
          status: 'completed',
          activities: ['Search and rescue', 'Medical triage', 'Emergency shelter setup']
        },
        {
          name: 'Stabilization',
          duration: '1-4 weeks',
          status: 'in_progress',
          activities: ['Temporary housing', 'Basic services restoration', 'Psychological support']
        },
        {
          name: 'Recovery',
          duration: '1-6 months',
          status: 'pending',
          activities: ['Infrastructure rebuilding', 'Economic recovery', 'Community resilience']
        }
      ],
      resourceNeeds: [
        {
          category: 'Shelter & Housing',
          items: [
            { name: 'Emergency tents', quantity: 5000, unit: 'units', cost: 500000 },
            { name: 'Temporary prefab housing', quantity: 1000, unit: 'units', cost: 5000000 }
          ]
        },
        {
          category: 'Medical Supplies',
          items: [
            { name: 'Emergency medical kits', quantity: 10000, unit: 'kits', cost: 2000000 },
            { name: 'Surgical supplies', quantity: 500, unit: 'sets', cost: 1500000 }
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'Drought Response & Food Security',
      country: 'Somalia',
      flag: '🇸🇴',
      type: 'comprehensive',
      status: 'active',
      priority: 'high',
      targetPopulation: 8300000,
      budget: 180000000,
      timeline: '18 months',
      progress: 42,
      createdAt: '2 weeks ago',
      lastUpdated: '1 day ago',
      objectives: [
        'Provide food assistance to 8.3M people',
        'Support livestock and agriculture recovery',
        'Strengthen water infrastructure and access',
        'Build community resilience to future droughts'
      ],
      phases: [
        {
          name: 'Emergency Food Assistance',
          duration: '0-6 months',
          status: 'in_progress',
          activities: ['Food distributions', 'Nutrition programs', 'Water trucking']
        },
        {
          name: 'Recovery & Rehabilitation',
          duration: '6-12 months',
          status: 'pending',
          activities: ['Livestock restocking', 'Agricultural support', 'Infrastructure repair']
        },
        {
          name: 'Resilience Building',
          duration: '12-18 months',
          status: 'pending',
          activities: ['Early warning systems', 'Climate adaptation', 'Livelihood diversification']
        }
      ],
      resourceNeeds: [
        {
          category: 'Food & Nutrition',
          items: [
            { name: 'Emergency food rations', quantity: 8300000, unit: 'monthly rations', cost: 50000000 },
            { name: 'Therapeutic foods', quantity: 500000, unit: 'treatments', cost: 15000000 }
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'Conflict Prevention & Peacebuilding',
      country: 'Yemen',
      flag: '🇾🇪',
      type: 'preventive',
      status: 'under_review',
      priority: 'high',
      targetPopulation: 21600000,
      budget: 95000000,
      timeline: '24 months',
      progress: 15,
      createdAt: '1 week ago',
      lastUpdated: '2 days ago',
      objectives: [
        'Reduce humanitarian access constraints',
        'Support local peacebuilding initiatives',
        'Strengthen health system capacity',
        'Improve food security in conflict areas'
      ],
      phases: [
        {
          name: 'Assessment & Planning',
          duration: '0-3 months',
          status: 'in_progress',
          activities: ['Conflict analysis', 'Stakeholder mapping', 'Baseline surveys']
        },
        {
          name: 'Implementation',
          duration: '3-18 months',
          status: 'pending',
          activities: ['Community dialogues', 'Service delivery', 'Capacity building']
        },
        {
          name: 'Sustainability',
          duration: '18-24 months',
          status: 'pending',
          activities: ['Handover planning', 'Local ownership', 'Monitoring systems']
        }
      ],
      resourceNeeds: []
    }
  ];

  const generateNewPlan = () => {
    // Mock plan generation logic
    alert('AI-powered response plan generation initiated. This would typically integrate with GPT-OSS-20B to create a comprehensive plan based on the selected parameters.');
  };

  const getStatusColor = (status: ResponsePlan['status']) => {
    switch (status) {
      case 'active': return 'bg-crisis-low text-white';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'completed': return 'bg-primary text-white';
      case 'under_review': return 'bg-crisis-medium text-black';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: ResponsePlan['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-crisis-critical';
      case 'high': return 'bg-crisis-high';
      case 'medium': return 'bg-crisis-medium';
      case 'low': return 'bg-crisis-low';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Response Plans</h1>
          <p className="text-muted-foreground">AI-powered humanitarian response planning and management</p>
        </div>
        <Button className="humanitarian-gradient text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          <TabsTrigger value="generator">Plan Generator</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Active Plans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-crisis-low">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">$2.1B</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-crisis-high">45M</div>
                <div className="text-sm text-muted-foreground">People Targeted</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Response Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {responsePlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{plan.flag}</span>
                      <div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-muted-foreground">{plan.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(plan.priority) + ' text-white'}>
                        {plan.priority}
                      </Badge>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Target Population</div>
                      <div className="font-medium">{(plan.targetPopulation / 1000000).toFixed(1)}M people</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Budget</div>
                      <div className="font-medium">${(plan.budget / 1000000).toFixed(0)}M</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Timeline</div>
                      <div className="font-medium">{plan.timeline}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Progress</div>
                      <div className="font-medium">{plan.progress}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Implementation Progress</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                AI Response Plan Generator
                <Badge variant="secondary">Powered by GPT-OSS-20B</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country..." />
                      </SelectTrigger>
                      <SelectContent>
                        {countriesData.map(country => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Plan Type</label>
                    <Select value={planType} onValueChange={setPlanType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Response</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Plan</SelectItem>
                        <SelectItem value="preventive">Preventive Measures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target Population</label>
                    <Input 
                      value={targetPopulation}
                      onChange={(e) => setTargetPopulation(e.target.value)}
                      placeholder="Number of people to assist"
                      type="number"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeline (months)</label>
                    <Select value={timeline} onValueChange={setTimeline}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months (Emergency)</SelectItem>
                        <SelectItem value="6">6 months (Short-term)</SelectItem>
                        <SelectItem value="12">12 months (Medium-term)</SelectItem>
                        <SelectItem value="24">24 months (Long-term)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Budget (USD)</label>
                    <Input 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 50000000"
                      type="number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Special Considerations</label>
                    <Textarea 
                      placeholder="Any specific requirements, constraints, or priorities..."
                      className="h-20"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={generateNewPlan}
                className="w-full humanitarian-gradient text-white font-medium"
                size="lg"
                disabled={!selectedCountry || !targetPopulation}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Generate AI-Powered Response Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {responsePlans.filter(p => p.status === 'active').map((plan) => (
            <Card key={plan.id} className="elevated-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{plan.flag}</span>
                    {plan.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(plan.priority) + ' text-white'}>
                      {plan.priority}
                    </Badge>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-bold">{(plan.targetPopulation / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-muted-foreground">Target Population</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-crisis-low" />
                    <div className="font-bold">${(plan.budget / 1000000).toFixed(0)}M</div>
                    <div className="text-xs text-muted-foreground">Budget</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-bold">{plan.timeline}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-crisis-medium" />
                    <div className="font-bold">{plan.progress}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Key Objectives</h4>
                  <div className="space-y-2">
                    {plan.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-crisis-low mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Implementation Phases</h4>
                  <div className="space-y-2">
                    {plan.phases.map((phase, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                        <div className={`w-3 h-3 rounded-full ${
                          phase.status === 'completed' ? 'bg-crisis-low' :
                          phase.status === 'in_progress' ? 'bg-crisis-medium animate-pulse' :
                          'bg-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{phase.name}</div>
                          <div className="text-xs text-muted-foreground">{phase.duration}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {phase.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Plan Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Plan templates feature coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResponsePlans;