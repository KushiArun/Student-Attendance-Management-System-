-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  section VARCHAR(10),
  grade VARCHAR(20) NOT NULL,
  subject VARCHAR(100),
  teacher_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(user_id),
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
  teacher_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
  marked_by UUID REFERENCES profiles(user_id),
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

-- RLS Policies for classes
CREATE POLICY "Teachers can view their classes" ON public.classes
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all classes" ON public.classes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'HOD', 'PRINCIPAL')
  )
);

CREATE POLICY "Admins can insert classes" ON public.classes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'HOD', 'PRINCIPAL')
  )
);

CREATE POLICY "Admins can update classes" ON public.classes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'HOD', 'PRINCIPAL')
  )
);

-- RLS Policies for students
CREATE POLICY "Admins can view all students" ON public.students
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'HOD', 'PRINCIPAL', 'TEACHER')
  )
);

CREATE POLICY "Students can view their own profile" ON public.students
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can insert students" ON public.students
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'HOD', 'PRINCIPAL')
  )
);

-- RLS Policies for attendance
CREATE POLICY "Teachers can view attendance for their classes" ON public.attendance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM classes c 
    WHERE c.id = class_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own attendance" ON public.attendance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = student_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all attendance" ON public.attendance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('ADMIN', 'HOD', 'PRINCIPAL')
  )
);

CREATE POLICY "Teachers can mark attendance" ON public.attendance
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM classes c 
    WHERE c.id = class_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update attendance" ON public.attendance
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM classes c 
    WHERE c.id = class_id AND c.teacher_id = auth.uid()
  )
);

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