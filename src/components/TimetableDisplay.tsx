import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, MapPin, BookOpen, User, Calendar } from 'lucide-react';

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject: string;
  class_id: string;
  teacher_id: string;
  class_name?: string;
  teacher_name?: string;
}

const TimetableDisplay: React.FC = () => {
  const { profile } = useAuth();
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, [profile]);

  const fetchTimetable = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('timetable')
        .select(`
          *,
          classes:class_id(name, grade, section),
          teachers:teacher_id(full_name)
        `);

      // Show all timetable entries for all users (no role-based filtering)
      const { data, error } = await query.order('day_of_week').order('start_time');

      if (error) {
        console.error('Error fetching timetable:', error);
        return;
      }

      const formattedData = data?.map(item => ({
        ...item,
        class_name: item.classes?.name || 'Unknown Class',
        teacher_name: item.teachers?.full_name || 'Unknown Teacher'
      })) || [];

      setTimetableData(formattedData);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSchedule = timetableData.filter(entry => entry.day_of_week === selectedDay);

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group timetable by day for weekly view
  const weeklySchedule = dayNames.slice(1, 6).map((day, index) => ({
    day,
    dayIndex: index + 1,
    classes: timetableData.filter(entry => entry.day_of_week === index + 1).sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    )
  }));

  // Get unique teachers with their subjects
  const teacherSubjects = timetableData.reduce((acc, entry) => {
    const teacher = entry.teacher_name || 'Unknown';
    if (!acc[teacher]) {
      acc[teacher] = new Set();
    }
    acc[teacher].add(entry.subject);
    return acc;
  }, {} as Record<string, Set<string>>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Class Timetable - V AD
          </h2>
          <p className="text-muted-foreground mt-1">
            AI & Data Science Department
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            Room No: 303
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Prof. ANJANA H S
          </Badge>
        </div>
      </div>

      {/* Teacher-Subject Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Faculty & Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(teacherSubjects).map(([teacher, subjects]) => (
              <div key={teacher} className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm mb-2">{teacher}</h4>
                <div className="space-y-1">
                  {Array.from(subjects).map(subject => (
                    <Badge key={subject} variant="secondary" className="mr-2 mb-1 text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Today vs Weekly View */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="today">
            <Clock className="w-4 h-4 mr-2" />
            Today's Classes
          </TabsTrigger>
          <TabsTrigger value="weekly">
            <Calendar className="w-4 h-4 mr-2" />
            Weekly Schedule
          </TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="today" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium">Select Day:</label>
            <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(Number(value))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {dayNames.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSchedule.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No classes scheduled</h3>
                  <p>There are no scheduled classes for {dayNames[selectedDay]}.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSchedule.map(entry => (
                <Card key={entry.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-sm font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {entry.subject}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{entry.teacher_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Weekly Schedule */}
        <TabsContent value="weekly">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Time</TableHead>
                      {weeklySchedule.map(({ day }) => (
                        <TableHead key={day} className="text-center min-w-[150px]">
                          {day}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Define all time slots including breaks */}
                    {[
                      { start: '08:45:00', end: '09:45:00' },
                      { start: '09:45:00', end: '10:45:00' },
                      { start: '10:45:00', end: '11:00:00', isBreak: true, label: 'Snack Break' },
                      { start: '11:00:00', end: '12:00:00' },
                      { start: '12:00:00', end: '13:00:00' },
                      { start: '13:00:00', end: '13:30:00', isBreak: true, label: 'Lunch Break' },
                      { start: '13:30:00', end: '14:30:00' },
                      { start: '14:30:00', end: '15:30:00' },
                    ].map(({ start, end, isBreak, label }) => (
                      <TableRow key={`${start}-${end}`} className={isBreak ? 'bg-muted/50' : ''}>
                        <TableCell className="font-medium text-xs">
                          {formatTime(start)}
                          <br />
                          {formatTime(end)}
                        </TableCell>
                        {isBreak ? (
                          <TableCell colSpan={weeklySchedule.length} className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          </TableCell>
                        ) : (
                          weeklySchedule.map(({ dayIndex }) => {
                            const classEntry = timetableData.find(
                              e => e.day_of_week === dayIndex && 
                                   e.start_time === start && 
                                   e.end_time === end
                            );
                            return (
                              <TableCell key={dayIndex} className="text-center p-2">
                                {classEntry ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-sm">{classEntry.subject}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {classEntry.teacher_name || '-'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </TableCell>
                            );
                          })
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimetableDisplay;