import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  UserCheck,
  ClipboardList,
  Heart
} from 'lucide-react';

const AppSidebar = () => {
  const { state } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavItems = () => {
    const commonItems = [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ];

    switch (profile?.role) {
      case 'STUDENT':
        return [
          ...commonItems,
          { title: 'Timetable', url: '/timetable', icon: Calendar },
          { title: 'My Attendance', url: '/attendance', icon: ClipboardList },
        ];
      
      case 'TEACHER':
        return [
          ...commonItems,
          { title: 'Timetable', url: '/timetable', icon: Calendar },
          { title: 'Mark Attendance', url: '/mark-attendance', icon: UserCheck },
          { title: 'Parent Notifications', url: '/notifications', icon: ClipboardList },
          { title: 'My Classes', url: '/classes', icon: Users },
          { title: 'Reports', url: '/reports', icon: BarChart3 },
        ];
      
      case 'PARENT':
        return [
          ...commonItems,
          { title: 'Children', url: '/children', icon: Heart },
          { title: 'Attendance View', url: '/attendance-view', icon: Calendar },
        ];
      
      case 'ADMIN':
      case 'HOD':
      case 'PRINCIPAL':
        return [
          ...commonItems,
          { title: 'Students', url: '/students', icon: GraduationCap },
          { title: 'Teachers', url: '/teachers', icon: Users },
          { title: 'Classes', url: '/classes', icon: ClipboardList },
          { title: 'Analytics', url: '/analytics', icon: BarChart3 },
          { title: 'Parent Notifications', url: '/notifications', icon: ClipboardList },
        ];
      
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50';

  return (
    <Sidebar 
      className={state === 'collapsed' ? 'w-14' : 'w-60'} 
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">
            {state !== 'collapsed' && 'SAMS'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;