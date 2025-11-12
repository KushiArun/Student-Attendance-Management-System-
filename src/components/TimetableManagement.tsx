import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: string;
  class_id: string | null;
  teacher_id: string | null;
  created_at: string;
  classes?: {
    name: string;
    grade: string;
    section: string;
  };
  teachers?: {
    full_name: string;
    teacher_id: string;
  };
}

interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
}

interface Teacher {
  id: string;
  full_name: string;
  teacher_id: string;
}

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const { toast } = useToast();

  const [newEntry, setNewEntry] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    subject: '',
    class_id: '',
    teacher_id: '',
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTimetable = async () => {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        classes (name, grade, section),
        teachers (full_name, teacher_id)
      `)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch timetable",
        variant: "destructive",
      });
    } else {
      setTimetable(data || []);
    }
  };

  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, grade, section');
    
    if (error) {
      console.error('Error fetching classes:', error);
    } else {
      setClasses(data || []);
    }
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, full_name, teacher_id');
    
    if (error) {
      console.error('Error fetching teachers:', error);
    } else {
      setTeachers(data || []);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.day_of_week || !newEntry.start_time || !newEntry.end_time || !newEntry.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      day_of_week: parseInt(newEntry.day_of_week),
      start_time: newEntry.start_time,
      end_time: newEntry.end_time,
      subject: newEntry.subject,
      class_id: newEntry.class_id || null,
      teacher_id: newEntry.teacher_id || null,
    };

    const { error } = await supabase
      .from('timetable')
      .insert([entryData]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add timetable entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Timetable entry added successfully",
      });
      resetForm();
      setIsAddingEntry(false);
      fetchTimetable();
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    const { error } = await supabase
      .from('timetable')
      .update({
        subject: editingEntry.subject,
        start_time: editingEntry.start_time,
        end_time: editingEntry.end_time,
        class_id: editingEntry.class_id,
        teacher_id: editingEntry.teacher_id,
      })
      .eq('id', editingEntry.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update timetable entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Timetable entry updated successfully",
      });
      setEditingEntry(null);
      fetchTimetable();
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', entryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete timetable entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Timetable entry removed successfully",
      });
      fetchTimetable();
    }
  };

  const resetForm = () => {
    setNewEntry({
      day_of_week: '',
      start_time: '',
      end_time: '',
      subject: '',
      class_id: '',
      teacher_id: '',
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timetable Management
            </CardTitle>
            <CardDescription>Manage class schedules and time slots</CardDescription>
          </div>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Timetable Entry</DialogTitle>
                <DialogDescription>Create a new class schedule</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Day *</Label>
                    <Select value={newEntry.day_of_week} onValueChange={(value) => setNewEntry({ ...newEntry, day_of_week: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        {dayNames.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                      placeholder="Subject name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newEntry.start_time}
                      onChange={(e) => setNewEntry({ ...newEntry, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time *</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newEntry.end_time}
                      onChange={(e) => setNewEntry({ ...newEntry, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={newEntry.class_id} onValueChange={(value) => setNewEntry({ ...newEntry, class_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - Grade {cls.grade} {cls.section ? `(${cls.section})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select value={newEntry.teacher_id} onValueChange={(value) => setNewEntry({ ...newEntry, teacher_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name} ({teacher.teacher_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>Add Entry</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetable.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No timetable entries found. Add your first schedule to get started.
                  </TableCell>
                </TableRow>
              ) : (
                timetable.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {dayNames[entry.day_of_week]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.subject}</TableCell>
                    <TableCell>
                      {entry.classes ? (
                        <div>
                          <div>{entry.classes.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Grade {entry.classes.grade} {entry.classes.section ? `(${entry.classes.section})` : ''}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.teachers ? (
                        <div>
                          <div>{entry.teachers.full_name}</div>
                          <div className="text-sm text-muted-foreground">{entry.teachers.teacher_id}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableManagement;