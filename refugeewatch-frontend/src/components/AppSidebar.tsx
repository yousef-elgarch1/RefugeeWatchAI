// src/components/AppSidebar.tsx - FIXED SIMPLIFIED SIDEBAR
import React from 'react';
import { 
  Home, 
  Globe, 
  Brain, 
  ClipboardList, 
  BarChart3, 
  Link, 
  FileText,
  Settings,
  HelpCircle,
  Activity
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigationItems = [
  { 
    title: 'Dashboard', 
    url: '/', 
    icon: Home,
    badge: null
  },
  { 
    title: 'Crisis Map', 
    url: '/crisis-map', 
    icon: Globe,
    badge: 'Live'
  },
  { 
    title: 'AI Analysis', 
    url: '/ai-analysis', 
    icon: Brain,
    badge: 'GPT'
  },
  { 
    title: 'Response Plans', 
    url: '/response-plans', 
    icon: ClipboardList,
    badge: null
  },
  { 
    title: 'Global Metrics', 
    url: '/metrics', 
    icon: BarChart3,
    badge: null
  },
  { 
    title: 'Data Sources', 
    url: '/data-sources', 
    icon: Link,
    badge: '6 APIs'
  },
  { 
    title: 'Reports', 
    url: '/reports', 
    icon: FileText,
    badge: null
  },
];

const bottomNavigationItems = [
  { 
    title: 'Settings', 
    url: '/settings', 
    icon: Settings
  },
  { 
    title: 'Help', 
    url: '/help', 
    icon: HelpCircle
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === 'collapsed';

  return (
    <TooltipProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="outline" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.title}</p>
                        {item.badge && <p className="text-xs opacity-70">({item.badge})</p>}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Bottom Navigation */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                          <NavLink to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">RefugeeWatch AI</span>
                  <span className="truncate text-xs">System Online</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}