export interface EmergencyEvent {
  id: string;
  type: 'earthquake' | 'cyclone' | 'flood' | 'war' | 'drought' | 'epidemic' | 'terrorist' | 'refugee_influx';
  severity: 1 | 2 | 3 | 4 | 5; // 1 = minimal, 5 = catastrophic
  title: string;
  description: string;
  location: {
    country: string;
    region: string;
    coordinates: { lat: number; lon: number };
  };
  impact: {
    affected: number;
    casualties: number;
    displaced: number;
    economicLoss: number; // in millions USD
  };
  timeline: {
    started: string;
    duration: string;
    peakExpected?: string;
  };
  response: {
    level: 'local' | 'national' | 'regional' | 'international';
    leadAgency: string;
    resourcesNeeded: string[];
    accessConstraints: string[];
  };
  isActive: boolean;
  lastUpdated: string;
}

export const emergencyEvents: EmergencyEvent[] = [
  {
    id: 'earthquake_turkey_2024',
    type: 'earthquake',
    severity: 5,
    title: 'Major Earthquake - Turkey-Syria Border',
    description: '7.2 magnitude earthquake struck near Gaziantep, causing widespread destruction and casualties. Aftershocks continue.',
    location: {
      country: 'Turkey/Syria',
      region: 'Southeastern Anatolia',
      coordinates: { lat: 37.0, lon: 37.4 }
    },
    impact: {
      affected: 50000,
      casualties: 1200,
      displaced: 25000,
      economicLoss: 2500
    },
    timeline: {
      started: '2 minutes ago',
      duration: 'Ongoing',
      peakExpected: 'Next 24 hours'
    },
    response: {
      level: 'international',
      leadAgency: 'Turkish Disaster Management (AFAD)',
      resourcesNeeded: [
        'Search and rescue teams',
        'Medical emergency supplies',
        'Temporary shelter materials',
        'Heavy machinery for debris removal',
        'Emergency communication equipment'
      ],
      accessConstraints: [
        'Damaged roads and bridges',
        'Continued aftershocks',
        'Winter weather conditions'
      ]
    },
    isActive: true,
    lastUpdated: '1 minute ago'
  },
  {
    id: 'cyclone_bangladesh_2024',
    type: 'cyclone',
    severity: 4,
    title: 'Cyclone Mocha - Bay of Bengal',
    description: 'Category 4 cyclone approaching Bangladesh coast with winds up to 150 km/h. Mass evacuations underway.',
    location: {
      country: 'Bangladesh',
      region: 'Chittagong Division',
      coordinates: { lat: 22.0, lon: 92.0 }
    },
    impact: {
      affected: 2000000,
      casualties: 0,
      displaced: 500000,
      economicLoss: 800
    },
    timeline: {
      started: '6 hours ago',
      duration: '48-72 hours',
      peakExpected: 'Next 12 hours'
    },
    response: {
      level: 'national',
      leadAgency: 'Bangladesh Disaster Management Bureau',
      resourcesNeeded: [
        'Cyclone shelters preparation',
        'Emergency food and water',
        'Medical teams and supplies',
        'Rescue boats and equipment',
        'Emergency communication systems'
      ],
      accessConstraints: [
        'High winds and storm surge',
        'Flooding in coastal areas',
        'Limited helicopter operations'
      ]
    },
    isActive: true,
    lastUpdated: '30 minutes ago'
  },
  {
    id: 'conflict_escalation_ukraine_2024',
    type: 'war',
    severity: 5,
    title: 'Conflict Escalation - Eastern Ukraine',
    description: 'Significant escalation in conflict zones causing new wave of civilian displacement and infrastructure damage.',
    location: {
      country: 'Ukraine',
      region: 'Donetsk Oblast',
      coordinates: { lat: 48.5, lon: 37.8 }
    },
    impact: {
      affected: 500000,
      casualties: 150,
      displaced: 200000,
      economicLoss: 1200
    },
    timeline: {
      started: '3 days ago',
      duration: 'Ongoing',
      peakExpected: 'Unknown'
    },
    response: {
      level: 'international',
      leadAgency: 'UN OCHA Ukraine',
      resourcesNeeded: [
        'Safe evacuation corridors',
        'Emergency medical supplies',
        'Shelter for displaced persons',
        'Food and clean water',
        'Psychological support services'
      ],
      accessConstraints: [
        'Active conflict zones',
        'Damaged infrastructure',
        'Security risks for aid workers'
      ]
    },
    isActive: true,
    lastUpdated: '5 minutes ago'
  },
  {
    id: 'drought_somalia_2024',
    type: 'drought',
    severity: 4,
    title: 'Severe Drought - Horn of Africa',
    description: 'Fifth consecutive failed rainy season creating famine-like conditions. Livestock deaths widespread.',
    location: {
      country: 'Somalia',
      region: 'Bay and Bakool regions',
      coordinates: { lat: 3.0, lon: 43.0 }
    },
    impact: {
      affected: 8300000,
      casualties: 500,
      displaced: 1200000,
      economicLoss: 450
    },
    timeline: {
      started: '18 months ago',
      duration: 'Ongoing - seasonal',
      peakExpected: 'Next 3 months'
    },
    response: {
      level: 'international',
      leadAgency: 'UN WFP Somalia',
      resourcesNeeded: [
        'Emergency food assistance',
        'Water trucking and storage',
        'Livestock feed and veterinary care',
        'Nutrition treatment supplies',
        'Seeds for next planting season'
      ],
      accessConstraints: [
        'Insecurity in rural areas',
        'Limited road access',
        'Funding shortfalls'
      ]
    },
    isActive: true,
    lastUpdated: '2 hours ago'
  }
];