-- Clear existing timetable data
DELETE FROM timetable;

-- Update or insert teachers from the timetable
INSERT INTO teachers (teacher_id, full_name, email, subject, department)
VALUES 
  ('VR', 'Dr. VIDHYA K', 'vidhya@ewit.edu', 'Software Engineering & Project Management', 'AI & Data Science'),
  ('SD', 'Prof. SHILBON B', 'shilbon@ewit.edu', 'Computer Networks', 'AI & Data Science'),
  ('AB', 'Prof. ASHWINI B', 'ashwini@ewit.edu', 'Theory of Computation', 'AI & Data Science'),
  ('PCR', 'Prof. PRAKRUTHI G R', 'prakruthi@ewit.edu', 'Distributed Systems', 'AI & Data Science'),
  ('AHS', 'Prof. ANJANA H S', 'anjana@ewit.edu', 'Research Methodology and IPR', 'AI & Data Science'),
  ('PRL', 'Prof. PUNITHA S L', 'punitha@ewit.edu', 'Environmental Studies', 'AI & Data Science')
ON CONFLICT (teacher_id) 
DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  subject = EXCLUDED.subject,
  department = EXCLUDED.department;

-- Get the class ID for V_AD (or create it if it doesn't exist)
INSERT INTO classes (name, grade, section, subject, teacher_id)
SELECT 'V_AD', 'V', 'AD', 'AI & Data Science', t.id
FROM teachers t
WHERE t.teacher_id = 'AHS'
ON CONFLICT DO NOTHING;

-- Insert timetable entries for Class V_AD
WITH class_info AS (
  SELECT c.id as class_id FROM classes c WHERE c.name = 'V_AD' LIMIT 1
),
teacher_ids AS (
  SELECT teacher_id, id FROM teachers WHERE teacher_id IN ('VR', 'SD', 'AB', 'PCR', 'AHS', 'PRL')
)
INSERT INTO timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id)
SELECT * FROM (
  -- MONDAY (day_of_week = 1)
  SELECT 1, '08:45:00'::time, '09:30:00'::time, 'Research Methodology', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AHS')
  UNION ALL
  SELECT 1, '09:45:00'::time, '10:45:00'::time, 'Software Engineering & Project Management', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'VR')
  UNION ALL
  SELECT 1, '14:15:00'::time, '15:00:00'::time, 'Mini Project', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AHS')
  
  -- TUESDAY (day_of_week = 2)
  UNION ALL
  SELECT 2, '08:45:00'::time, '09:30:00'::time, 'Environmental Studies', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'PRL')
  UNION ALL
  SELECT 2, '09:45:00'::time, '10:45:00'::time, 'Distributed Systems', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'PCR')
  UNION ALL
  SELECT 2, '11:00:00'::time, '12:00:00'::time, 'Software Engineering & Project Management', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'VR')
  UNION ALL
  SELECT 2, '12:00:00'::time, '13:00:00'::time, 'Computer Networks', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'SD')
  UNION ALL
  SELECT 2, '14:15:00'::time, '15:00:00'::time, 'Theory of Computation', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AB')
  
  -- WEDNESDAY (day_of_week = 3)
  UNION ALL
  SELECT 3, '08:45:00'::time, '09:30:00'::time, 'Theory of Computation', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AB')
  UNION ALL
  SELECT 3, '09:45:00'::time, '10:45:00'::time, 'Distributed Systems', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'PCR')
  UNION ALL
  SELECT 3, '11:00:00'::time, '12:00:00'::time, 'Theory of Computation', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AB')
  UNION ALL
  SELECT 3, '12:00:00'::time, '13:00:00'::time, 'Computer Networks', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'SD')
  UNION ALL
  SELECT 3, '14:15:00'::time, '15:00:00'::time, 'Department Activities', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AHS')
  
  -- THURSDAY (day_of_week = 4)
  UNION ALL
  SELECT 4, '08:45:00'::time, '09:30:00'::time, 'Distributed Systems', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'PCR')
  UNION ALL
  SELECT 4, '09:45:00'::time, '10:45:00'::time, 'Data Visualization Lab', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AHS')
  UNION ALL
  SELECT 4, '11:00:00'::time, '12:00:00'::time, 'Software Engineering & Project Management', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'VR')
  UNION ALL
  SELECT 4, '12:00:00'::time, '13:00:00'::time, 'Computer Networks', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'SD')
  UNION ALL
  SELECT 4, '14:15:00'::time, '15:00:00'::time, 'Skill Lab', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AHS')
  
  -- FRIDAY (day_of_week = 5)
  UNION ALL
  SELECT 5, '08:45:00'::time, '09:30:00'::time, 'Software Engineering & Project Management', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'VR')
  UNION ALL
  SELECT 5, '09:45:00'::time, '10:45:00'::time, 'Computer Networks', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'SD')
  UNION ALL
  SELECT 5, '12:00:00'::time, '13:00:00'::time, 'Data Visualization Lab', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AHS')
  UNION ALL
  SELECT 5, '13:30:00'::time, '14:15:00'::time, 'Theory of Computation', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'AB')
  UNION ALL
  SELECT 5, '14:15:00'::time, '15:00:00'::time, 'Yoga & Physical Education', (SELECT class_id FROM class_info), (SELECT id FROM teacher_ids WHERE teacher_id = 'PRL')
) AS timetable_data;