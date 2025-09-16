import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, MapPin, Clock, Users, TrendingUp, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { emergencyEvents, EmergencyEvent } from '@/data/emergencyEvents';

const EmergencyAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyEvent[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Filter active emergency events
    const active = emergencyEvents.filter(event => 
      event.isActive && 
      event.severity >= 4 && 
      !dismissedAlerts.has(event.id)
    );
    setActiveAlerts(active);
  }, [dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'bg-crisis-critical';
      case 4: return 'bg-crisis-high';
      case 3: return 'bg-crisis-medium';
      case 2: return 'bg-crisis-low';
      default: return 'bg-muted';
    }
  };

  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 5: return 'CATASTROPHIC';
      case 4: return 'MAJOR';
      case 3: return 'MODERATE';
      case 2: return 'MINOR';
      default: return 'MINIMAL';
    }
  };

  const getEventIcon = (type: EmergencyEvent['type']) => {
    switch (type) {
      case 'earthquake': return '🌋';
      case 'cyclone': return '🌀';
      case 'flood': return '🌊';
      case 'war': return '⚔️';
      case 'drought': return '🏜️';
      case 'epidemic': return '🦠';
      case 'terrorist': return '💥';
      case 'refugee_influx': return '👥';
      default: return '⚠️';
    }
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-40 space-y-3 max-w-md">
      {activeAlerts.map((alert) => (
        <Card 
          key={alert.id}
          className="border-l-4 border-l-crisis-critical shadow-2xl animate-in slide-in-from-right duration-500"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl flex-shrink-0">
                  {getEventIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getSeverityColor(alert.severity)} text-white font-bold animate-pulse`}>
                      {getSeverityText(alert.severity)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      URGENT
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-sm text-foreground mb-1">
                    {alert.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {alert.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{alert.location.country} - {alert.location.region}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Started: {alert.timeline.started}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-crisis-critical" />
                        <span>{(alert.impact.affected / 1000).toFixed(0)}K affected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-crisis-high" />
                        <span>{alert.impact.casualties} casualties</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="h-7 text-xs bg-crisis-critical hover:bg-crisis-critical/90">
                      <Phone className="w-3 h-3 mr-1" />
                      Emergency Response
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmergencyAlerts;