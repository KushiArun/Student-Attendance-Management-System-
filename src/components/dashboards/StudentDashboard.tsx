import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import TimetableDisplay from '@/components/TimetableDisplay';
import AttendanceChart from '@/components/AttendanceChart';
import AttendanceCalculator from '@/components/AttendanceCalculator';
import CalendarView from '@/components/CalendarView';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  class_name: string;
  subject: string;
}

const StudentDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const { profile } = useAuth();

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (profile?.email) {
      fetchAttendanceData();
    }
  }, [profile]);

  const fetchAttendanceData = async () => {
    try {
      // First get the student record by email
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('email', profile?.email)
        .maybeSingle();

      if (studentError || !studentData) {
        console.error('Error fetching student data:', studentError);
        return;
      }

      // Then get attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          id,
          date,
          status,
          classes (
            name,
            subject
          )
        `)
        .eq('student_id', studentData.id)
        .order('date', { ascending: false })
        .limit(30);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        return;
      }

      const formattedRecords = attendanceData?.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status as 'PRESENT' | 'ABSENT' | 'LATE',
        class_name: record.classes?.name || 'Unknown',
        subject: record.classes?.subject || 'Unknown',
      })) || [];

      setAttendanceRecords(formattedRecords);

      // Calculate statistics
      const total = formattedRecords.length;
      const present = formattedRecords.filter(r => r.status === 'PRESENT').length;
      const absent = formattedRecords.filter(r => r.status === 'ABSENT').length;
      const late = formattedRecords.filter(r => r.status === 'LATE').length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setAttendanceStats({
        total,
        present,
        absent,
        late,
        percentage,
      });

      // Prepare chart data (last 7 days)
      const last7Days = formattedRecords.slice(0, 7).reverse();
      const chartDataFormatted = last7Days.reduce((acc: any[], record) => {
        const date = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing[record.status.toLowerCase()]++;
        } else {
          acc.push({
            date,
            present: record.status === 'PRESENT' ? 1 : 0,
            absent: record.status === 'ABSENT' ? 1 : 0,
            late: record.status === 'LATE' ? 1 : 0
          });
        }
        
        return acc;
      }, []);

      setChartData(chartDataFormatted);
    } catch (error) {
      console.error('Error in fetchAttendanceData:', error);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-500';
      case 'LATE':
        return 'bg-yellow-500';
      case 'ABSENT':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAbsentDaysThisMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear && 
             record.status === 'ABSENT';
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Date and Time Display */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(currentTime)}</div>
            <div className="text-lg opacity-90">{formatDate(currentTime)}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Calculator</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.present + attendanceStats.late} of {attendanceStats.total} classes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              3 completed, 3 upcoming
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAbsentDaysThisMonth()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Attendance Portal */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Portal</CardTitle>
          <CardDescription>
            Real-time attendance tracking - Updated: {formatTime(currentTime)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
                <div className="text-sm text-muted-foreground">Present</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
                <div className="text-sm text-muted-foreground">Late</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
                <div className="text-sm text-muted-foreground">Absent</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Chart */}
      {chartData.length > 0 && <AttendanceChart data={chartData} type="line" />}

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your attendance history for the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceRecords.length > 0 ? (
              attendanceRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{record.class_name}</span>
                      <span className="text-sm text-muted-foreground">{record.subject}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attendance records found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceCalculator />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>

        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Timetable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimetableDisplay />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;