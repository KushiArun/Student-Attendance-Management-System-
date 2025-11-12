import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Calendar, Users, AlertCircle, Clock, CheckCircle, XCircle, Construction } from 'lucide-react';
import { format } from 'date-fns';
import CalendarView from '@/components/CalendarView';

interface Child {
  id: string;
  student_id: string;
  full_name: string;
  grade: string;
  section: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

interface Notification {
  id: string;
  message: string;
  notification_type: string;
  sent_at: string;
  students?: {
    full_name: string;
  };
}

const ParentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [children, setChildren] = useState<Child[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (profile?.email) {
      fetchChildrenAndStats();
      fetchNotifications();
    }
  }, [profile]);

  const fetchChildrenAndStats = async () => {
    try {
      // Fetch children linked to this parent through parent_students table
      const { data: parentStudents, error: parentStudentsError } = await supabase
        .from('parent_students')
        .select(`
          student_id,
          students (
            id,
            student_id,
            full_name,
            grade,
            section
          )
        `)
        .eq('parent_user_id', profile?.user_id);

      if (parentStudentsError) throw parentStudentsError;
      
      const childrenData = parentStudents?.map(ps => ps.students).filter(Boolean) || [];

      setChildren(childrenData || []);

      // Fetch attendance stats for all children
      if (childrenData && childrenData.length > 0) {
        const childIds = childrenData.map(child => child.id);
        
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .in('student_id', childIds);

        if (attendanceError) throw attendanceError;

        // Calculate stats
        const statsObj: AttendanceStats = {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: attendanceData?.length || 0,
        };

        attendanceData?.forEach(record => {
          switch (record.status) {
            case 'PRESENT':
              statsObj.present++;
              break;
            case 'ABSENT':
              statsObj.absent++;
              break;
            case 'LATE':
              statsObj.late++;
              break;
            case 'EXCUSED':
              statsObj.excused++;
              break;
          }
        });

        setStats(statsObj);
      }
    } catch (error) {
      console.error('Error fetching children and stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // First get the children IDs for this parent
      const { data: parentStudents } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_user_id', profile?.user_id);
      
      if (!parentStudents || parentStudents.length === 0) {
        setNotifications([]);
        return;
      }
      
      const studentIds = parentStudents.map(ps => ps.student_id);
      
      const { data, error } = await supabase
        .from('parent_notifications')
        .select(`
          *,
          students (
            full_name
          )
        `)
        .in('student_id', studentIds)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'absence':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your child's attendance and receive important notifications
        </p>
      </div>

      {/* Real-time Date and Time Display */}
      <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(currentTime)}</div>
            <div className="text-lg opacity-90">{formatDate(currentTime)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.present}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${((stats.present / stats.total) * 100).toFixed(1)}%` : '0%'} attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absences</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Days missed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Times late to class</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Detailed breakdown of attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.excused}</p>
                <p className="text-xs text-muted-foreground">Excused</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Latest updates about your child</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 bg-muted rounded-lg mt-0.5">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">
                        {notification.students?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.sent_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Children Management - Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Children Management
            </CardTitle>
            <CardDescription>Manage your children's profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                <Construction className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're working on adding the ability to manage multiple children's profiles, view detailed attendance history, and more.
              </p>
              <Badge variant="secondary" className="mt-2">
                <Calendar className="h-3 w-3 mr-1" />
                Available in next update
              </Badge>
            </div>

            {children.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium mb-3">Your Children:</p>
                <div className="space-y-2">
                  {children.map(child => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{child.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {child.student_id} - {child.grade} {child.section}
                        </p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <CalendarView />
    </div>
  );
};

export default ParentDashboard;