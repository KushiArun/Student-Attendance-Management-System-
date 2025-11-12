import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AttendanceStats {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

interface ClassAttendance {
  class_name: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

const AttendanceAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [attendanceData, setAttendanceData] = useState<AttendanceStats[]>([]);
  const [classData, setClassData] = useState<ClassAttendance[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchAttendanceData();
  }, [timeRange, selectedClass, profile]);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, grade, section');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } else {
      setClasses(data || []);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Fetch attendance data for the date range
      let query = supabase
        .from('attendance')
        .select(`
          date,
          status,
          student_id,
          class_id,
          classes(name, grade, section)
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      const { data: attendanceRecords, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch attendance data",
          variant: "destructive",
        });
        return;
      }

      // Process data for daily attendance chart
      const dailyStats: { [key: string]: AttendanceStats } = {};
      const classStats: { [key: string]: ClassAttendance } = {};

      attendanceRecords?.forEach((record: any) => {
        const date = record.date;
        const className = `${record.classes?.name} - Grade ${record.classes?.grade}`;
        
        // Daily stats
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
            percentage: 0
          };
        }

        // Class stats
        if (!classStats[className]) {
          classStats[className] = {
            class_name: className,
            present: 0,
            absent: 0,
            total: 0,
            percentage: 0
          };
        }

        dailyStats[date].total++;
        classStats[className].total++;

        if (record.status === 'PRESENT') {
          dailyStats[date].present++;
          classStats[className].present++;
        } else if (record.status === 'ABSENT') {
          dailyStats[date].absent++;
          classStats[className].absent++;
        } else if (record.status === 'LATE') {
          dailyStats[date].late++;
          classStats[className].present++; // Count late as present for percentage
        }
      });

      // Calculate percentages
      Object.values(dailyStats).forEach(stat => {
        stat.percentage = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
      });

      Object.values(classStats).forEach(stat => {
        stat.percentage = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
      });

      setAttendanceData(Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)));
      setClassData(Object.values(classStats));

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to process attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = attendanceData.reduce((sum, day) => sum + day.total, 0);
  const totalPresent = attendanceData.reduce((sum, day) => sum + day.present, 0);
  const overallPercentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

  const pieData = [
    { name: 'Present', value: totalPresent, color: '#10b981' },
    { name: 'Absent', value: attendanceData.reduce((sum, day) => sum + day.absent, 0), color: '#ef4444' },
    { name: 'Late', value: attendanceData.reduce((sum, day) => sum + day.late, 0), color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 flex-wrap">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} - Grade {cls.grade} {cls.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {totalPresent} of {totalStudents} total records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.length}</div>
            <p className="text-xs text-muted-foreground">Active classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Class</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData.length > 0 ? `${Math.max(...classData.map(c => Number(c.percentage) || 0))}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Highest attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Tracked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.length}</div>
            <p className="text-xs text-muted-foreground">In selected range</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Trend</CardTitle>
            <CardDescription>Attendance percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Overall breakdown of attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ value, name }: any) => `${name} ${((value / totalStudents) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class-wise Attendance */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Class-wise Attendance</CardTitle>
            <CardDescription>Attendance comparison across classes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="class_name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                <Bar dataKey="percentage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;