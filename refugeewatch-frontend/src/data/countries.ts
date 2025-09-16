export interface CountryData {
  id: string;
  name: string;
  flag: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  population: number;
  capital: string;
  region: string;
  crisis: {
    level: 'critical' | 'high' | 'medium' | 'low' | 'stable';
    type: string;
    description: string;
    affectedPopulation: number;
    timeline: string;
    urgentNeeds: string[];
    lastUpdated: string;
  };
  emergencyContacts: {
    un: string;
    redCross: string;
    government: string;
  };
  resources: {
    hospitals: number;
    shelters: number;
    foodCenters: number;
    safeZones: number;
  };
  economics: {
    gdpPerCapita: number;
    unemploymentRate: number;
    povertyRate: number;
  };
  infrastructure: {
    roadsCondition: 'good' | 'fair' | 'poor';
    communicationAccess: number; // percentage
    waterAccess: number; // percentage
    electricityAccess: number; // percentage
  };
}

export const countriesData: CountryData[] = [
  {
    id: 'ukraine',
    name: 'Ukraine',
    flag: '🇺🇦',
    coordinates: { lat: 49.0, lon: 32.0 },
    population: 44000000,
    capital: 'Kyiv',
    region: 'Eastern Europe',
    crisis: {
      level: 'critical',
      type: 'Armed Conflict',
      description: 'Ongoing military conflict causing massive displacement and infrastructure destruction. Civilian casualties rising daily with critical humanitarian corridors under threat.',
      affectedPopulation: 12000000,
      timeline: 'Ongoing - 2+ years',
      urgentNeeds: [
        'Emergency medical supplies and equipment',
        'Winter shelter materials and heating systems',
        'Food aid for 8M internally displaced persons',
        'Safe evacuation corridors for civilians',
        'Psychological support for trauma victims',
        'Educational resources for displaced children'
      ],
      lastUpdated: '2 minutes ago'
    },
    emergencyContacts: {
      un: '+380-44-253-9363',
      redCross: '+380-44-238-1474',
      government: '+380-44-279-7478'
    },
    resources: {
      hospitals: 287,
      shelters: 1450,
      foodCenters: 892,
      safeZones: 156
    },
    economics: {
      gdpPerCapita: 3500,
      unemploymentRate: 35,
      povertyRate: 45
    },
    infrastructure: {
      roadsCondition: 'poor',
      communicationAccess: 65,
      waterAccess: 78,
      electricityAccess: 60
    }
  },
  {
    id: 'syria',
    name: 'Syria',
    flag: '🇸🇾',
    coordinates: { lat: 35.0, lon: 38.0 },
    population: 18275000,
    capital: 'Damascus',
    region: 'Middle East',
    crisis: {
      level: 'critical',
      type: 'Armed Conflict & Economic Collapse',
      description: 'Protracted conflict with severe economic crisis. Infrastructure heavily damaged, healthcare system collapsed, and millions in need of humanitarian assistance.',
      affectedPopulation: 13100000,
      timeline: 'Ongoing - 12+ years',
      urgentNeeds: [
        'Medical supplies and healthcare infrastructure',
        'Clean water and sanitation systems',
        'Emergency food assistance for 12M people',
        'Shelter materials for damaged housing',
        'Educational support for 2.4M out-of-school children',
        'Livelihood support and economic recovery'
      ],
      lastUpdated: '18 minutes ago'
    },
    emergencyContacts: {
      un: '+963-11-213-8877',
      redCross: '+963-11-333-3001',
      government: '+963-11-222-4358'
    },
    resources: {
      hospitals: 89,
      shelters: 2100,
      foodCenters: 456,
      safeZones: 67
    },
    economics: {
      gdpPerCapita: 870,
      unemploymentRate: 78,
      povertyRate: 83
    },
    infrastructure: {
      roadsCondition: 'poor',
      communicationAccess: 45,
      waterAccess: 52,
      electricityAccess: 38
    }
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    flag: '🇦🇫',
    coordinates: { lat: 34.0, lon: 66.0 },
    population: 38928000,
    capital: 'Kabul',
    region: 'South Asia',
    crisis: {
      level: 'high',
      type: 'Political Instability & Economic Crisis',
      description: 'Severe economic crisis following political changes. Banking system collapsed, humanitarian access restricted, and millions facing food insecurity.',
      affectedPopulation: 24400000,
      timeline: 'Ongoing - 3+ years',
      urgentNeeds: [
        'Emergency cash assistance for 18M people',
        'Nutrition support for malnourished children',
        'Healthcare access especially for women',
        'Educational materials and facilities',
        'Agricultural support for farmers',
        'Protection services for vulnerable groups'
      ],
      lastUpdated: '45 minutes ago'
    },
    emergencyContacts: {
      un: '+93-79-999-1001',
      redCross: '+93-70-208-2580',
      government: '+93-20-210-0491'
    },
    resources: {
      hospitals: 156,
      shelters: 890,
      foodCenters: 1200,
      safeZones: 234
    },
    economics: {
      gdpPerCapita: 520,
      unemploymentRate: 85,
      povertyRate: 92
    },
    infrastructure: {
      roadsCondition: 'fair',
      communicationAccess: 38,
      waterAccess: 61,
      electricityAccess: 32
    }
  },
  {
    id: 'somalia',
    name: 'Somalia',
    flag: '🇸🇴',
    coordinates: { lat: 2.0, lon: 45.0 },
    population: 15893000,
    capital: 'Mogadishu',
    region: 'East Africa',
    crisis: {
      level: 'high',
      type: 'Drought & Armed Conflict',
      description: 'Severe drought combined with ongoing conflict creating famine-like conditions. Climate change exacerbating traditional pastoralist conflicts.',
      affectedPopulation: 8300000,
      timeline: 'Escalating - 18 months',
      urgentNeeds: [
        'Emergency water trucking and storage',
        'Livestock feed and veterinary support',
        'Malnutrition treatment for 1.8M children',
        'Seeds and tools for agricultural recovery',
        'Mobile health teams for remote areas',
        'Conflict-sensitive programming'
      ],
      lastUpdated: '1 hour ago'
    },
    emergencyContacts: {
      un: '+252-1-234-567',
      redCross: '+252-61-555-0123',
      government: '+252-1-987-654'
    },
    resources: {
      hospitals: 34,
      shelters: 567,
      foodCenters: 890,
      safeZones: 45
    },
    economics: {
      gdpPerCapita: 450,
      unemploymentRate: 67,
      povertyRate: 73
    },
    infrastructure: {
      roadsCondition: 'poor',
      communicationAccess: 25,
      waterAccess: 45,
      electricityAccess: 18
    }
  },
  {
    id: 'yemen',
    name: 'Yemen',
    flag: '🇾🇪',
    coordinates: { lat: 15.0, lon: 44.0 },
    population: 29825000,
    capital: 'Sana\'a',
    region: 'Middle East',
    crisis: {
      level: 'critical',
      type: 'Armed Conflict & Humanitarian Crisis',
      description: 'Ongoing conflict has created world\'s worst humanitarian crisis. Healthcare system collapsed, famine threatening millions, cholera outbreaks recurring.',
      affectedPopulation: 21600000,
      timeline: 'Ongoing - 8+ years',
      urgentNeeds: [
        'Fuel for hospitals and water pumping',
        'Cholera treatment and prevention supplies',
        'Food assistance for 17M food insecure',
        'Safe delivery services for pregnant women',
        'Cash assistance for basic needs',
        'Educational support in conflict areas'
      ],
      lastUpdated: '25 minutes ago'
    },
    emergencyContacts: {
      un: '+967-1-469-771',
      redCross: '+967-1-202-191',
      government: '+967-1-274-008'
    },
    resources: {
      hospitals: 78,
      shelters: 1890,
      foodCenters: 1234,
      safeZones: 89
    },
    economics: {
      gdpPerCapita: 720,
      unemploymentRate: 76,
      povertyRate: 80
    },
    infrastructure: {
      roadsCondition: 'poor',
      communicationAccess: 35,
      waterAccess: 48,
      electricityAccess: 25
    }
  },
  {
    id: 'ethiopia',
    name: 'Ethiopia',
    flag: '🇪🇹',
    coordinates: { lat: 8.0, lon: 38.0 },
    population: 114964000,
    capital: 'Addis Ababa',
    region: 'East Africa',
    crisis: {
      level: 'medium',
      type: 'Drought & Internal Displacement',
      description: 'Seasonal droughts affecting pastoralist communities. Internal conflicts causing displacement, but government response capacity relatively strong.',
      affectedPopulation: 4500000,
      timeline: 'Seasonal - 6 months',
      urgentNeeds: [
        'Drought-resistant seeds and farming tools',
        'Water infrastructure rehabilitation',
        'Livestock vaccination and feed',
        'Nutrition support for children under 5',
        'Temporary shelter for displaced families',
        'Livelihood diversification programs'
      ],
      lastUpdated: '2 hours ago'
    },
    emergencyContacts: {
      un: '+251-11-544-3200',
      redCross: '+251-11-155-5188',
      government: '+251-11-551-7700'
    },
    resources: {
      hospitals: 267,
      shelters: 456,
      foodCenters: 789,
      safeZones: 123
    },
    economics: {
      gdpPerCapita: 890,
      unemploymentRate: 19,
      povertyRate: 24
    },
    infrastructure: {
      roadsCondition: 'fair',
      communicationAccess: 44,
      waterAccess: 69,
      electricityAccess: 44
    }
  },
  {
    id: 'bangladesh',
    name: 'Bangladesh',
    flag: '🇧🇩',
    coordinates: { lat: 24.0, lon: 90.0 },
    population: 164689000,
    capital: 'Dhaka',
    region: 'South Asia',
    crisis: {
      level: 'medium',
      type: 'Climate Change & Rohingya Crisis',
      description: 'Hosting 1M Rohingya refugees while facing increasing climate disasters. Frequent cyclones and flooding affecting vulnerable populations.',
      affectedPopulation: 1200000,
      timeline: 'Chronic - Multi-year',
      urgentNeeds: [
        'Cyclone-resistant shelter construction',
        'Early warning systems for disasters',
        'Healthcare for Rohingya refugees',
        'Education facilities in refugee camps',
        'Flood-resistant infrastructure',
        'Skills training for refugees and hosts'
      ],
      lastUpdated: '3 hours ago'
    },
    emergencyContacts: {
      un: '+880-2-5506-5001',
      redCross: '+880-2-933-7314',
      government: '+880-2-7169-006'
    },
    resources: {
      hospitals: 234,
      shelters: 1100,
      foodCenters: 567,
      safeZones: 89
    },
    economics: {
      gdpPerCapita: 2520,
      unemploymentRate: 4.2,
      povertyRate: 20.5
    },
    infrastructure: {
      roadsCondition: 'fair',
      communicationAccess: 65,
      waterAccess: 89,
      electricityAccess: 92
    }
  },
  {
    id: 'venezuela',
    name: 'Venezuela',
    flag: '🇻🇪',
    coordinates: { lat: 8.0, lon: -66.0 },
    population: 28435000,
    capital: 'Caracas',
    region: 'South America',
    crisis: {
      level: 'high',
      type: 'Economic Crisis & Mass Migration',
      description: 'Severe economic crisis causing hyperinflation and mass migration. Healthcare system collapsed, basic services severely limited.',
      affectedPopulation: 7700000,
      timeline: 'Ongoing - 6+ years',
      urgentNeeds: [
        'Medical supplies and equipment',
        'Nutrition support for malnourished children',
        'Cash assistance for basic needs',
        'Water and sanitation infrastructure',
        'Educational materials and teacher training',
        'Support for internally displaced families'
      ],
      lastUpdated: '4 hours ago'
    },
    emergencyContacts: {
      un: '+58-212-905-4000',
      redCross: '+58-212-571-8127',
      government: '+58-212-806-4111'
    },
    resources: {
      hospitals: 145,
      shelters: 234,
      foodCenters: 456,
      safeZones: 67
    },
    economics: {
      gdpPerCapita: 1830,
      unemploymentRate: 65,
      povertyRate: 87
    },
    infrastructure: {
      roadsCondition: 'poor',
      communicationAccess: 72,
      waterAccess: 84,
      electricityAccess: 67
    }
  }
];