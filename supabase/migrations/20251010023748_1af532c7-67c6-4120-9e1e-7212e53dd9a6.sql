-- Create parent_students relationship table
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_user_id, student_id)
);

-- Enable RLS
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_students
CREATE POLICY "Parents can view their own children"
  ON public.parent_students
  FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Admins can view all parent-student relationships"
  ON public.parent_students
  FOR SELECT
  USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert parent-student relationships"
  ON public.parent_students
  FOR INSERT
  WITH CHECK (is_admin_user(auth.uid()));

-- Link the student user account to the student record
UPDATE public.students 
SET user_id = '94b0fc7e-dcc1-4e59-8c82-7030f2bbf8dd'
WHERE student_id = 'STU001';

-- Create parent-student relationship
INSERT INTO public.parent_students (parent_user_id, student_id)
SELECT '4ce623e5-c6f4-4fce-93ed-44a7179187d4', id
FROM public.students
WHERE student_id = 'STU001'
ON CONFLICT (parent_user_id, student_id) DO NOTHING;