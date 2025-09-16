import React, { useState } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notifications, NotificationData } from '@/data/notifications';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notificationList, setNotificationList] = useState(notifications);

  const markAsRead = (id: string) => {
    setNotificationList(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-crisis-critical" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-crisis-high" />;
      case 'medium':
        return <Info className="w-4 h-4 text-crisis-medium" />;
      case 'info':
        return <Info className="w-4 h-4 text-primary" />;
      case 'system':
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getBorderColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'critical':
        return 'border-l-crisis-critical';
      case 'high':
        return 'border-l-crisis-high';
      case 'medium':
        return 'border-l-crisis-medium';
      case 'info':
        return 'border-l-primary';
      case 'system':
        return 'border-l-muted-foreground';
      default:
        return 'border-l-border';
    }
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="ml-auto w-full max-w-md bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full mt-2"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="divide-y divide-border">
                {notificationList
                  .sort((a, b) => b.priority - a.priority)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer border-l-4 ${getBorderColor(notification.type)} ${
                        !notification.read ? 'bg-muted/10' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm ${
                              !notification.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          {notification.country && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-lg">{notification.flag}</span>
                              <span className="text-xs text-muted-foreground">
                                {notification.country}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {notification.timestamp}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {notification.actionRequired && (
                                <Badge variant="outline" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                              
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  notification.category === 'crisis' ? 'bg-crisis-critical/10 text-crisis-critical' :
                                  notification.category === 'ai' ? 'bg-primary/10 text-primary' :
                                  notification.category === 'response' ? 'bg-crisis-low/10 text-crisis-low' :
                                  'bg-muted'
                                }`}
                              >
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                          
                          {notification.actionRequired && (
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                View Details
                              </Button>
                              <Button size="sm" className="h-7 text-xs">
                                Take Action
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPanel;