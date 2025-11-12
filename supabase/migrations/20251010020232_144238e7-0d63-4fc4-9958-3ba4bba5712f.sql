-- Create teacher record for deeksha
INSERT INTO public.teachers (teacher_id, full_name, email, subject, department, user_id)
VALUES 
  ('TCH001', 'deeksha', '23bcr00010@jainuniversity.ac.in', 'Information Science', 'IS', 'd38fbaec-18da-410d-94a6-c403a848ed24')
ON CONFLICT (teacher_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    user_id = EXCLUDED.user_id;

-- Create a class for 1st Year IS
INSERT INTO public.classes (name, grade, section, subject, teacher_id)
VALUES 
  ('1st Year IS', '1st Year', 'IS', 'Core Subjects', (SELECT id FROM public.teachers WHERE teacher_id = 'TCH001'))
ON CONFLICT DO NOTHING;

-- Enroll student kuhh in the 1st Year IS class
INSERT INTO public.student_classes (student_id, class_id)
SELECT 
  s.id,
  c.id
FROM public.students s
CROSS JOIN public.classes c
WHERE s.student_id = 'STU001' 
  AND c.name = '1st Year IS'
ON CONFLICT DO NOTHING;