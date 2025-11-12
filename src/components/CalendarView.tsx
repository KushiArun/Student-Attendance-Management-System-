import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  is_holiday: boolean;
}

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const eventsOnDate = events.filter(e => e.event_date === dateStr);
      setSelectedDateEvents(eventsOnDate);
    }
  }, [selectedDate, events]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (data) {
      setEvents(data);
    }
  };

  const eventDates = events.map(e => new Date(e.event_date));
  const holidayDates = events.filter(e => e.is_holiday).map(e => new Date(e.event_date));
  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= new Date())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Academic Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  event: eventDates,
                  holiday: holidayDates
                }}
                modifiersStyles={{
                  event: { fontWeight: 'bold', color: 'hsl(var(--primary))' },
                  holiday: { backgroundColor: 'hsl(var(--destructive))', color: 'white' }
                }}
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span className="text-sm">Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive" />
                  <span className="text-sm">Holidays</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedDate && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Events on {selectedDate.toLocaleDateString()}
                  </h4>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{event.title}</h5>
                            {event.is_holiday && (
                              <Badge variant="destructive">Holiday</Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Type: {event.event_type}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No events on this date</p>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Upcoming Events</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{event.title}</h5>
                        {event.is_holiday && (
                          <Badge variant="destructive">Holiday</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()} • {event.event_type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
