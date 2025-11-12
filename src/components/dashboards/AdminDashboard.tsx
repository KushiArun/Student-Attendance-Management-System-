import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, GraduationCap, BookOpen, BarChart3, Plus, UserCheck, Bell, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TeacherManagement from '@/components/TeacherManagement';
import TimetableManagement from '@/components/TimetableManagement';
import AttendanceAnalytics from '@/components/AttendanceAnalytics';
import TimetableDisplay from '@/components/TimetableDisplay';
import { Badge } from '@/components/ui/badge';
import BulkImport from '@/components/BulkImport';
import ExportAttendance from '@/components/ExportAttendance';
import CalendarManagement from '@/components/CalendarManagement';

interface Class {
  id: string;
  name: string;
  section: string;
  grade: string;
  subject: string;
  teacher_id: string;
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  grade: string;
  section: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'teachers' | 'timetable'>('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    grade: '',
    subject: '',
  });

  const [newStudent, setNewStudent] = useState({
    student_id: '',
    full_name: '',
    email: '',
    grade: '',
    section: '',
    parent_contact: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchTeachers();
    fetchNotifications();
    
    // Set up real-time subscription for parent notifications
    const channel = supabase
      .channel('parent-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'parent_notifications'
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          toast({
            title: "New Parent Notification",
            description: `Notification sent to parent`,
            variant: "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
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

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } else {
      setStudents(data || []);
    }
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*');
    
    if (error) {
      console.error('Error fetching teachers:', error);
    } else {
      setTeachers(data || []);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('parent_notifications')
        .select(`
          *,
          students:student_id(full_name, student_id)
        `)
        .order('sent_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.grade) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('classes')
      .insert([newClass]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add class",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Class added successfully",
      });
      setNewClass({ name: '', section: '', grade: '', subject: '' });
      setIsAddingClass(false);
      fetchClasses();
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.student_id || !newStudent.full_name || !newStudent.grade) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('students')
      .insert([newStudent]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setNewStudent({
        student_id: '',
        full_name: '',
        email: '',
        grade: '',
        section: '',
        parent_contact: '',
      });
      setIsAddingStudent(false);
      fetchStudents();
    }
  };

  const handleAddStudentToClass = async () => {
    navigate('/students');
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
      <Card className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(currentTime)}</div>
            <div className="text-lg opacity-90">{formatDate(currentTime)}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="view-timetable">View Timetable</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">Active classes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">Enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teachers.length}</div>
                <p className="text-xs text-muted-foreground">Teaching staff</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Class Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Class Management</CardTitle>
                  <CardDescription>Manage classes and assign students</CardDescription>
                </div>
                <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Class</DialogTitle>
                      <DialogDescription>Create a new class</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="className">Class Name *</Label>
                          <Input
                            id="className"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={newClass.section}
                            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                            placeholder="e.g., A"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="grade">Year *</Label>
                          <Select value={newClass.grade} onValueChange={(value) => setNewClass({ ...newClass, grade: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st Year">1st Year</SelectItem>
                              <SelectItem value="2nd Year">2nd Year</SelectItem>
                              <SelectItem value="3rd Year">3rd Year</SelectItem>
                              <SelectItem value="4th Year">4th Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={newClass.subject}
                            onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                            placeholder="e.g., Data Structures"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingClass(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddClass}>Add Class</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="classSelect">Select Class to Manage Students</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.grade} {cls.section ? `(${cls.section})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddStudentToClass}>
                      Manage Students
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>Add and manage student profiles</CardDescription>
                </div>
                <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>Register a new student in the system</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentId">Student ID *</Label>
                          <Input
                            id="studentId"
                            value={newStudent.student_id}
                            onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                            placeholder="e.g., 1EW23CS001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={newStudent.full_name}
                            onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                            placeholder="Student's full name"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            placeholder="student@ewit.edu"
                          />
                        </div>
                        <div>
                          <Label htmlFor="parentContact">Parent Contact</Label>
                          <Input
                            id="parentContact"
                            value={newStudent.parent_contact}
                            onChange={(e) => setNewStudent({ ...newStudent, parent_contact: e.target.value })}
                            placeholder="Parent's phone number"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentGrade">Year *</Label>
                          <Select value={newStudent.grade} onValueChange={(value) => setNewStudent({ ...newStudent, grade: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1st Year">1st Year</SelectItem>
                              <SelectItem value="2nd Year">2nd Year</SelectItem>
                              <SelectItem value="3rd Year">3rd Year</SelectItem>
                              <SelectItem value="4th Year">4th Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="studentSection">Department</Label>
                          <Select value={newStudent.section} onValueChange={(value) => setNewStudent({ ...newStudent, section: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CS">Computer Science</SelectItem>
                              <SelectItem value="IS">Information Science</SelectItem>
                              <SelectItem value="EC">Electronics & Communication</SelectItem>
                              <SelectItem value="ME">Mechanical Engineering</SelectItem>
                              <SelectItem value="CE">Civil Engineering</SelectItem>
                              <SelectItem value="EE">Electrical Engineering</SelectItem>
                              <SelectItem value="AI">Artificial Intelligence</SelectItem>
                              <SelectItem value="AD">Aerospace Engineering</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingStudent(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStudent}>Add Student</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total registered students: {students.length}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Parent Notifications
              </CardTitle>
              <CardDescription>
                Real-time updates of notifications sent to parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                            {notification.status === 'sent' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : null}
                            {notification.status}
                          </Badge>
                          <Badge variant="outline">
                            {notification.notification_type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.sent_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>
                            {notification.students?.full_name || 'Unknown Student'}
                            {notification.students?.student_id && (
                              <span className="ml-1">({notification.students.student_id})</span>
                            )}
                          </span>
                        </div>
                        <div>
                          Contact: {notification.parent_contact}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications sent yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <TeacherManagement />
        </TabsContent>

        <TabsContent value="timetable" className="space-y-4">
          <TimetableManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AttendanceAnalytics />
        </TabsContent>

        <TabsContent value="bulk-import" className="space-y-4">
          <BulkImport />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportAttendance />
        </TabsContent>

        <TabsContent value="view-timetable" className="space-y-4">
          <TimetableDisplay />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;