// src/components/Header.tsx - FIXED WITH SIDEBARTRIGGER
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Mock data - replace with real data
  const unreadNotifications = 3;
  const systemStatus = 'operational'; // 'operational', 'degraded', 'critical'

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      {/* Sidebar Trigger - This shows the hamburger menu when sidebar is collapsed */}
      <SidebarTrigger className="-ml-1" />
      
      {/* Header Title */}
      <div className="flex flex-1 items-center gap-2 px-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
          <span className="text-sm font-medium text-muted-foreground">
            Crisis Monitoring System
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center gap-2">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-muted">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Secure</span>
        </div>

        {/* AI Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-muted">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">AI Active</span>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(true)}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            </div>
          )}
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="transition-smooth"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Avatar */}
        <Avatar className="w-8 h-8">
          <AvatarImage src="/api/placeholder/32/32" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;