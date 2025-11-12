import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Calendar as CalendarIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BunkedClass {
  id: string;
  bunked_date: string;
  subject: string | null;
  notes: string | null;
}

interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  percentage: number;
}

export const AttendanceCalculator: React.FC = () => {
  const [bunkedClasses, setBunkedClasses] = useState<BunkedClass[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [subject, setSubject] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Fetching student data for user:', user?.email, user?.id);
    if (!user) return;

    // Get student ID - first try by user_id, then by email
    let studentData = await supabase
      .from('students')
      .select('id, student_id, full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Student data by user_id:', studentData);

    // If not found by user_id, try by email
    if (!studentData.data) {
      studentData = await supabase
        .from('students')
        .select('id, student_id, full_name')
        .eq('email', user.email)
        .maybeSingle();
      console.log('Student data by email:', studentData);
    }

    if (studentData.data) {
      console.log('Setting student ID:', studentData.data.id);
      setStudentId(studentData.data.id);
      fetchBunkedClasses(studentData.data.id);
      fetchAttendanceStats(studentData.data.id);
    } else {
      console.error('No student record found for user');
    }
  };

  const fetchBunkedClasses = async (id: string) => {
    const { data, error } = await supabase
      .from('bunked_classes')
      .select('*')
      .eq('student_id', id)
      .order('bunked_date', { ascending: false });

    if (error) {
      console.error('Error fetching bunked classes:', error);
    } else {
      setBunkedClasses(data || []);
    }
  };

  const fetchAttendanceStats = async (id: string) => {
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', id);

    if (attendanceData) {
      const totalClasses = attendanceData.length;
      const presentClasses = attendanceData.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const absentClasses = attendanceData.filter(a => a.status === 'ABSENT').length;
      const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

      setAttendanceStats({
        totalClasses,
        presentClasses,
        absentClasses,
        percentage
      });
    }
  };

  const handleMarkBunked = async () => {
    console.log('handleMarkBunked called', { selectedDate, studentId, subject, notes });
    if (!selectedDate || !studentId) {
      console.error('Missing required data:', { selectedDate, studentId });
      toast({ title: 'Error', description: 'Missing date or student information', variant: 'destructive' });
      return;
    }

    try {
      const insertData = {
        student_id: studentId,
        bunked_date: selectedDate.toISOString().split('T')[0],
        subject: subject || null,
        notes: notes || null
      };
      console.log('Inserting bunked class:', insertData);

      const { data, error } = await supabase
        .from('bunked_classes')
        .insert([insertData])
        .select();

      console.log('Insert result:', { data, error });

      if (error) throw error;

      toast({ title: 'Success', description: 'Bunked class marked successfully' });
      setDialogOpen(false);
      setNotes('');
      setSubject('');
      setSelectedDate(undefined);
      fetchBunkedClasses(studentId);
      fetchAttendanceStats(studentId);
    } catch (error: any) {
      console.error('Error marking bunked class:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteBunked = async (id: string) => {
    if (!studentId) return;

    const { error } = await supabase
      .from('bunked_classes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Bunked class removed' });
      fetchBunkedClasses(studentId);
      fetchAttendanceStats(studentId);
    }
  };

  const calculateEstimatedPercentage = () => {
    if (!attendanceStats) return 0;
    const totalWithBunked = attendanceStats.totalClasses + bunkedClasses.length;
    const presentWithBunked = attendanceStats.presentClasses;
    return totalWithBunked > 0 ? (presentWithBunked / totalWithBunked) * 100 : 0;
  };

  const estimatedPercentage = calculateEstimatedPercentage();
  const bunkedDates = bunkedClasses.map(b => new Date(b.bunked_date));

  const getPercentageStatus = (percentage: number) => {
    if (percentage >= 75) return { color: 'text-green-600', icon: CheckCircle, message: 'Good Standing' };
    return { color: 'text-destructive', icon: AlertTriangle, message: 'Below Minimum (75%)' };
  };

  const currentStatus = attendanceStats ? getPercentageStatus(attendanceStats.percentage) : null;
  const estimatedStatus = getPercentageStatus(estimatedPercentage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Attendance Calculator
          </CardTitle>
          <CardDescription>Track your attendance and plan accordingly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {attendanceStats && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="text-2xl font-bold">{attendanceStats.totalClasses}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.presentClasses}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-destructive">{attendanceStats.absentClasses}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Attendance</Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${currentStatus?.color}`}>
                      {attendanceStats.percentage.toFixed(2)}%
                    </span>
                    {currentStatus && <currentStatus.icon className={`h-5 w-5 ${currentStatus.color}`} />}
                  </div>
                </div>
                <Progress value={attendanceStats.percentage} className="h-2" />
                {currentStatus && (
                  <p className={`text-sm ${currentStatus.color}`}>{currentStatus.message}</p>
                )}
              </div>

              {bunkedClasses.length > 0 && (
                <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <Label>Estimated with Planned Bunks ({bunkedClasses.length})</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${estimatedStatus.color}`}>
                        {estimatedPercentage.toFixed(2)}%
                      </span>
                      <estimatedStatus.icon className={`h-5 w-5 ${estimatedStatus.color}`} />
                    </div>
                  </div>
                  <Progress value={estimatedPercentage} className="h-2" />
                  <p className={`text-sm ${estimatedStatus.color}`}>{estimatedStatus.message}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Mark Planned Bunks
          </CardTitle>
          <CardDescription>Plan ahead and see how it affects your attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setDialogOpen(true);
                }}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                modifiers={{ bunked: bunkedDates }}
                modifiersStyles={{
                  bunked: { backgroundColor: 'hsl(var(--destructive))', color: 'white', fontWeight: 'bold' }
                }}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Planned Bunks ({bunkedClasses.length})</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {bunkedClasses.map((bunk) => (
                  <div key={bunk.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(bunk.bunked_date).toLocaleDateString()}</p>
                      {bunk.subject && <p className="text-sm text-muted-foreground">{bunk.subject}</p>}
                      {bunk.notes && <p className="text-xs text-muted-foreground">{bunk.notes}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBunked(bunk.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Planned Bunk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <p className="text-sm mt-1">{selectedDate?.toLocaleDateString()}</p>
            </div>
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <input
                id="subject"
                className="w-full px-3 py-2 border rounded-md"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why are you planning to bunk?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkBunked}>Mark as Bunked</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceCalculator;
