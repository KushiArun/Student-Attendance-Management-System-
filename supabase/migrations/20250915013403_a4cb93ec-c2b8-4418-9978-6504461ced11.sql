-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  section VARCHAR(10),
  grade VARCHAR(20) NOT NULL,
  subject VARCHAR(100),
  teacher_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  grade VARCHAR(20) NOT NULL,
  section VARCHAR(10),
  parent_contact VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_classes junction table
CREATE TABLE public.student_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Create timetable table
CREATE TABLE public.timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
  marked_by UUID,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(student_id, class_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for now
CREATE POLICY "Enable all for authenticated users" ON public.classes
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.students
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.student_classes
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.timetable
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.attendance
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_updated_at
  BEFORE UPDATE ON public.timetable
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();