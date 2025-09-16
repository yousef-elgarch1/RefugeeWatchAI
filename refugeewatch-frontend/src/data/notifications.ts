export interface NotificationData {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info' | 'system';
  title: string;
  message: string;
  country?: string;
  flag?: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  category: 'crisis' | 'ai' | 'system' | 'response';
  priority: number; // 1-5, 5 being highest
}

export const notifications: NotificationData[] = [
  {
    id: '1',
    type: 'critical',
    title: 'URGENT: Earthquake in Turkey-Syria Border',
    message: 'Major 7.2 magnitude earthquake detected. Immediate response required. Estimated 50,000+ affected.',
    country: 'Turkey/Syria',
    flag: '🇹🇷🇸🇾',
    timestamp: '2 minutes ago',
    read: false,
    actionRequired: true,
    category: 'crisis',
    priority: 5
  },
  {
    id: '2',
    type: 'critical',
    title: 'Ukraine: New Displacement Wave',
    message: 'Conflict escalation in eastern regions causing massive civilian displacement. 200,000+ people moving westward.',
    country: 'Ukraine',
    flag: '🇺🇦',
    timestamp: '15 minutes ago',
    read: false,
    actionRequired: true,
    category: 'crisis',
    priority: 5
  },
  {
    id: '3',
    type: 'high',
    title: 'AI Analysis Complete: Somalia Drought',
    message: 'GPT-OSS-20B analysis predicts 89% probability of famine conditions within 3 months. Immediate intervention recommended.',
    country: 'Somalia',
    flag: '🇸🇴',
    timestamp: '1 hour ago',
    read: true,
    actionRequired: true,
    category: 'ai',
    priority: 4
  },
  {
    id: '4',
    type: 'medium',
    title: 'Response Plan Generated: Yemen',
    message: 'Comprehensive humanitarian response plan for cholera outbreak has been generated and is ready for review.',
    country: 'Yemen',
    flag: '🇾🇪',
    timestamp: '2 hours ago',
    read: false,
    actionRequired: false,
    category: 'response',
    priority: 3
  },
  {
    id: '5',
    type: 'info',
    title: 'Weekly Report: Global Crisis Overview',
    message: 'Your weekly crisis monitoring report is ready. 12 countries monitored, 5 new alerts generated.',
    timestamp: '3 hours ago',
    read: true,
    actionRequired: false,
    category: 'system',
    priority: 2
  },
  {
    id: '6',
    type: 'high',
    title: 'Bangladesh: Cyclone Warning',
    message: 'Cyclone Mocha approaching with 150km/h winds. 2M people in evacuation zones. Shelters activating.',
    country: 'Bangladesh',
    flag: '🇧🇩',
    timestamp: '4 hours ago',
    read: false,
    actionRequired: true,
    category: 'crisis',
    priority: 4
  },
  {
    id: '7',
    type: 'system',
    title: 'System Maintenance Scheduled',
    message: 'AI analysis system will undergo maintenance tonight 2:00-4:00 UTC. Emergency monitoring remains active.',
    timestamp: '6 hours ago',
    read: true,
    actionRequired: false,
    category: 'system',
    priority: 2
  },
  {
    id: '8',
    type: 'medium',
    title: 'Afghanistan: Economic Data Updated',
    message: 'New economic indicators show 15% increase in food prices. Crisis level assessment may be updated.',
    country: 'Afghanistan',
    flag: '🇦🇫',
    timestamp: '8 hours ago',
    read: false,
    actionRequired: false,
    category: 'ai',
    priority: 3
  }
];