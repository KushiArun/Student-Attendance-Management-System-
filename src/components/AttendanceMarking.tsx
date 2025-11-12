import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  grade: string;
  section: string;
  parent_contact: string;
}

interface AttendanceRecord {
  id?: string;
  student_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  marked_by: string;
  class_id?: string;
}

const AttendanceMarking: React.FC = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all classes (V-AD as standard for all teachers)
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('grade', { ascending: true })
        .order('section', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive"
        });
      } else {
        setClasses(data || []);
        // Try to set V-AD as default, or first available class
        const vAdClass = data?.find(c => c.grade === 'V' && c.section === 'AD');
        if (vAdClass) {
          setSelectedClass(vAdClass.id);
        } else if (data && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      }
    };

    fetchClasses();
  }, []);

  // Fetch students and existing attendance
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !selectedDate) return;

      setLoading(true);
      try {
        // Fetch all students from Grade V-AD (standard for all teachers)
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('grade', 'V')
          .eq('section', 'AD')
          .order('student_id');

        if (studentsError) throw studentsError;
        
        setStudents(studentsData || []);

        // Fetch existing attendance records
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('class_id', selectedClass)
          .eq('date', selectedDate);

        if (attendanceError) throw attendanceError;

        // Create attendance map
        const attendanceMap: Record<string, AttendanceRecord> = {};
        const notesMap: Record<string, string> = {};

        attendanceData?.forEach(record => {
          attendanceMap[record.student_id] = {
            ...record,
            status: record.status as AttendanceRecord['status']
          };
          notesMap[record.student_id] = record.notes || '';
        });

        setAttendance(attendanceMap);
        setNotes(notesMap);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load student data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        date: selectedDate,
        status,
        marked_by: profile?.id || '',
        class_id: selectedClass,
        notes: notes[studentId] || ''
      }
    }));
  };

  const handleNotesChange = (studentId: string, noteText: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: noteText
    }));

    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        date: selectedDate,
        status: prev[studentId]?.status || 'PRESENT',
        marked_by: profile?.id || '',
        class_id: selectedClass,
        notes: noteText
      }
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceRecords = Object.values(attendance);
      
      // Upsert attendance records
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, { 
          onConflict: 'student_id,date,class_id' 
        });

      if (error) throw error;

      // Notify parents of absent students
      const absentStudents = students.filter(student => 
        attendance[student.id]?.status === 'ABSENT'
      );

      if (absentStudents.length > 0) {
        await notifyParents(absentStudents);
      }

      toast({
        title: "Success",
        description: `Attendance saved for ${attendanceRecords.length} students`
      });

    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const notifyParents = async (absentStudents: Student[]) => {
    try {
      const notifications = absentStudents.map(student => ({
        student_id: student.id,
        parent_contact: student.parent_contact,
        message: `Your child ${student.full_name} (${student.student_id}) was absent from class on ${format(new Date(selectedDate), 'MMMM do, yyyy')}. Please contact the college if you have any questions.`,
        notification_type: 'absence',
        status: 'sent'
      }));

      const { error } = await supabase
        .from('parent_notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: "Notifications Sent",
        description: `Parent notifications sent for ${absentStudents.length} absent students`
      });

    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Notification Error",
        description: "Failed to send some parent notifications",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ABSENT':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'LATE':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'EXCUSED':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      PRESENT: 'default',
      ABSENT: 'destructive',
      LATE: 'secondary',
      EXCUSED: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading students...</p>
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
            <Calendar className="h-5 w-5" />
            Mark Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.grade} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Students ({students.length})</h3>
                <Button 
                  onClick={saveAttendance} 
                  disabled={saving}
                  className="ml-auto"
                >
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>

              <div className="grid gap-4">
                {students.map(student => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{student.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.student_id} - {student.email}
                        </p>
                      </div>
                      {attendance[student.id]?.status && (
                        <div className="ml-4">
                          {getStatusBadge(attendance[student.id].status)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(status => (
                        <Button
                          key={status}
                          variant={attendance[student.id]?.status === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStatusChange(student.id, status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(status)}
                          {status}
                        </Button>
                      ))}
                    </div>

                    <Textarea
                      placeholder="Add notes (optional)"
                      value={notes[student.id] || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedClass && students.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No students enrolled in this class</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceMarking;