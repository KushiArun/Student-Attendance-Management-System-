-- Insert a real teacher record for testing
INSERT INTO public.teachers (teacher_id, full_name, email, subject, department, user_id)
VALUES ('T001', 'John Smith', 'john.smith@school.com', 'Mathematics', 'Mathematics', (SELECT user_id FROM profiles WHERE role = 'TEACHER' LIMIT 1))
ON CONFLICT (teacher_id) DO NOTHING;

-- Create real classes based on the student grades
INSERT INTO public.classes (name, grade, section, subject, teacher_id) VALUES
('Grade 1A Mathematics', '1', 'A', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 1B Mathematics', '1', 'B', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 2A Mathematics', '2', 'A', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 2B Mathematics', '2', 'B', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 3A Mathematics', '3', 'A', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 3B Mathematics', '3', 'B', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 4A Mathematics', '4', 'A', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 4B Mathematics', '4', 'B', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 5A Mathematics', '5', 'A', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001')),
('Grade 5B Mathematics', '5', 'B', 'Mathematics', (SELECT id FROM teachers WHERE teacher_id = 'T001'))
ON CONFLICT DO NOTHING;

-- Enroll actual students in appropriate classes based on their grade and section
INSERT INTO public.student_classes (student_id, class_id)
SELECT 
  s.id as student_id,
  c.id as class_id
FROM public.students s
JOIN public.classes c ON (s.grade = c.grade AND s.section = c.section)
WHERE NOT EXISTS (
  SELECT 1 FROM public.student_classes sc 
  WHERE sc.student_id = s.id AND sc.class_id = c.id
);