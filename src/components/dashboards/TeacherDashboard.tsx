import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, BookOpen, BarChart3, CheckCircle, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AttendanceAnalytics from '@/components/AttendanceAnalytics';
import TimetableDisplay from '@/components/TimetableDisplay';
import CalendarView from '@/components/CalendarView';

interface Class {
  id: string;
  name: string;
  section: string;
  grade: string;
  subject: string;
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  grade: string;
  section: string;
}

interface AttendanceRecord {
  student_id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

const TeacherDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const { profile } = useAuth();
  const { toast } = useToast();

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setAttendanceDate(new Date().toISOString().split('T')[0]);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (profile?.user_id) {
      fetchTeacherClasses();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
  }, [selectedClass]);

  const fetchTeacherClasses = async () => {
    if (!profile?.user_id) return;

    // First get the teacher record
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    if (teacherError) {
      console.error('Error fetching teacher:', teacherError);
      toast({
        title: "Error",
        description: "Failed to fetch teacher information",
        variant: "destructive",
      });
      return;
    }

    if (!teacherData) {
      console.log('No teacher record found for user');
      toast({
        title: "No Teacher Record",
        description: "Your account is not linked to a teacher profile. Please contact admin.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherData.id);
    
    if (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } else {
      console.log('Classes fetched:', data);
      setClasses(data || []);
    }
  };

  const fetchClassStudents = async () => {
    const { data, error } = await supabase
      .from('student_classes')
      .select(`
        students (
          id,
          student_id,
          full_name,
          grade,
          section
        )
      `)
      .eq('class_id', selectedClass);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } else {
      const studentList = data?.map(item => item.students).filter(Boolean) || [];
      setStudents(studentList);
      // Initialize attendance records
      const initialAttendance = studentList.map(student => ({
        student_id: student.id,
        status: 'PRESENT' as const,
      }));
      setAttendance(initialAttendance);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, status } 
          : record
      )
    );
  };

  const submitAttendance = async () => {
    if (!selectedClass || attendance.length === 0) {
      toast({
        title: "Error",
        description: "Please select a class and mark attendance",
        variant: "destructive",
      });
      return;
    }

    const attendanceRecords = attendance.map(record => ({
      student_id: record.student_id,
      class_id: selectedClass,
      date: attendanceDate,
      status: record.status,
      marked_by: profile?.user_id,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, {
        onConflict: 'student_id,class_id,date'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      setIsMarkingAttendance(false);
    }
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
    <div className="space-y-6">
      {/* Real-time Date and Time Display */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(currentTime)}</div>
            <div className="text-lg opacity-90">{formatDate(currentTime)}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Your assigned classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">180</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">+3% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Currently teaching</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Marking */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Select a class and mark attendance for today</CardDescription>
            </div>
            <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
              <DialogTrigger asChild>
                <Button disabled={!selectedClass}>
                  Mark Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Mark Attendance - {attendanceDate}</DialogTitle>
                  <DialogDescription>
                    Mark attendance for all students in the selected class
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {students.map((student) => {
                    const currentStatus = attendance.find(a => a.student_id === student.id)?.status || 'PRESENT';
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex flex-col">
                           <span className="font-medium">{student.full_name}</span>
                           <span className="text-sm text-muted-foreground">
                             {student.student_id} - {student.grade} {student.section}
                           </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={currentStatus === 'PRESENT' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateAttendanceStatus(student.id, 'PRESENT')}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Present
                          </Button>
                          <Button
                            variant={currentStatus === 'LATE' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateAttendanceStatus(student.id, 'LATE')}
                            className="flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            Late
                          </Button>
                          <Button
                            variant={currentStatus === 'ABSENT' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateAttendanceStatus(student.id, 'ABSENT')}
                            className="flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Absent
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsMarkingAttendance(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitAttendance}>
                    Submit Attendance
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Class</label>
              {classes.length === 0 ? (
                <div className="mt-2 p-4 border rounded-md bg-muted">
                  <p className="text-sm text-muted-foreground">
                    No classes assigned yet. Please contact admin to assign classes.
                  </p>
                </div>
              ) : (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a class to mark attendance" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.grade} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {selectedClass && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Students in selected class: {students.length}
                </p>
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    No students enrolled in this class yet.
                  </p>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-green-500">Present</Badge>
                    <Badge className="bg-yellow-500">Late</Badge>
                    <Badge className="bg-red-500">Absent</Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AttendanceAnalytics />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <TimetableDisplay />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;