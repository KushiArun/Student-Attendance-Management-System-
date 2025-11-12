import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  is_holiday: boolean;
}

export const CalendarManagement: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_type: 'event',
    is_holiday: false
  });
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setEvents(data || []);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update(formData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Event updated successfully' });
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Event created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event deleted successfully' });
      fetchEvents();
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_type: event.event_type,
      is_holiday: event.is_holiday
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: new Date().toISOString().split('T')[0],
      event_type: 'event',
      is_holiday: false
    });
    setEditingEvent(null);
  };

  const openAddDialog = () => {
    resetForm();
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        event_date: selectedDate.toISOString().split('T')[0]
      }));
    }
    setDialogOpen(true);
  };

  // Get dates with events for calendar highlighting
  const eventDates = events.map(e => new Date(e.event_date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          Calendar Management
        </h2>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                event: eventDates,
                holiday: events.filter(e => e.is_holiday).map(e => new Date(e.event_date))
              }}
              modifiersStyles={{
                event: { fontWeight: 'bold', color: 'hsl(var(--primary))' },
                holiday: { backgroundColor: 'hsl(var(--destructive))', color: 'white' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.is_holiday && (
                        <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                          Holiday
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.event_date).toLocaleDateString()} • {event.event_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description"
              />
            </div>
            <div>
              <Label htmlFor="event_date">Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">General Event</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_holiday"
                checked={formData.is_holiday}
                onCheckedChange={(checked) => setFormData({ ...formData, is_holiday: checked as boolean })}
              />
              <Label htmlFor="is_holiday">Mark as Holiday</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingEvent ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarManagement;
