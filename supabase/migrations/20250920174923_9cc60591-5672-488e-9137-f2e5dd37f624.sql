-- Create teachers table for proper teacher management
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  subject VARCHAR,
  phone VARCHAR,
  department VARCHAR,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teachers
CREATE POLICY "Enable all for authenticated users" 
ON public.teachers 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create parent_notifications table for tracking parent alerts
CREATE TABLE IF NOT EXISTS public.parent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  parent_contact VARCHAR NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR NOT NULL DEFAULT 'absence',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status VARCHAR NOT NULL DEFAULT 'sent'
);

-- Enable RLS for parent_notifications
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for parent_notifications
CREATE POLICY "Enable all for authenticated users" 
ON public.parent_notifications 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Update timetable table to have better teacher relationship
ALTER TABLE public.timetable 
ADD CONSTRAINT fk_timetable_teacher 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Update classes table to have better teacher relationship  
ALTER TABLE public.classes
ADD CONSTRAINT fk_classes_teacher
FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;