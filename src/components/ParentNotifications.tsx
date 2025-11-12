import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, MessageSquare, Phone, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  student_id: string;
  parent_contact: string;
  message: string;
  notification_type: string;
  status: string;
  sent_at: string;
  students?: {
    full_name: string;
    student_id: string;
    grade: string;
    section: string;
  };
}

const ParentNotifications: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  useEffect(() => {
    fetchNotifications();
  }, [filter, dateFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('parent_notifications')
        .select(`
          *,
          students (
            full_name,
            student_id,
            grade,
            section
          )
        `)
        .order('sent_at', { ascending: false });

      // Apply filters
      if (filter !== 'all') {
        query = query.eq('notification_type', filter);
      }

      // Apply date filter
      const today = new Date();
      if (dateFilter === 'today') {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        query = query.gte('sent_at', startOfDay.toISOString());
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('sent_at', weekAgo.toISOString());
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('sent_at', monthAgo.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'absence':
        return <Calendar className="h-4 w-4" />;
      case 'late':
        return <Bell className="h-4 w-4" />;
      case 'general':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'absence':
        return 'Absence Alert';
      case 'late':
        return 'Late Arrival';
      case 'general':
        return 'General Notice';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Parent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="absence">Absence</SelectItem>
                  <SelectItem value="late">Late Arrival</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchNotifications}
              variant="outline"
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            ) : (
              notifications.map(notification => (
                <Card key={notification.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.students?.full_name || 'Unknown Student'}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {notification.students?.student_id}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {notification.students?.grade} {notification.students?.section}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getTypeLabel(notification.notification_type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(notification.status)}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.sent_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-sm">{notification.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{notification.parent_contact}</span>
                    </div>
                    <span>ID: {notification.id.slice(-8)}</span>
                  </div>
                </Card>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentNotifications;