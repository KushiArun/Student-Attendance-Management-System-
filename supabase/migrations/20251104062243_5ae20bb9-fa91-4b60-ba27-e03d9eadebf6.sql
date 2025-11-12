-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type VARCHAR NOT NULL DEFAULT 'event',
  is_holiday BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bunked_classes table for students to mark bunked classes
CREATE TABLE public.bunked_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id),
  class_id UUID REFERENCES public.classes(id),
  bunked_date DATE NOT NULL,
  subject TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, bunked_date)
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bunked_classes ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_events
CREATE POLICY "Everyone can view calendar events"
  ON public.calendar_events
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert calendar events"
  ON public.calendar_events
  FOR INSERT
  WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update calendar events"
  ON public.calendar_events
  FOR UPDATE
  USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete calendar events"
  ON public.calendar_events
  FOR DELETE
  USING (is_admin_user(auth.uid()));

-- RLS policies for bunked_classes
CREATE POLICY "Students can view their own bunked classes"
  ON public.bunked_classes
  FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own bunked classes"
  ON public.bunked_classes
  FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete their own bunked classes"
  ON public.bunked_classes
  FOR DELETE
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bunked classes"
  ON public.bunked_classes
  FOR SELECT
  USING (is_admin_user(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();