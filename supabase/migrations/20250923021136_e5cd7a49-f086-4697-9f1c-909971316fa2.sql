-- Insert timetable data for different classes and subjects
-- Monday timetable entries
INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  1 as day_of_week,
  '08:00:00' as start_time,
  '08:45:00' as end_time,
  'Mathematics' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  1 as day_of_week,
  '08:45:00' as start_time,
  '09:30:00' as end_time,
  'English' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  1 as day_of_week,
  '09:30:00' as start_time,
  '10:15:00' as end_time,
  'Science' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  1 as day_of_week,
  '10:15:00' as start_time,
  '11:00:00' as end_time,
  'Social Studies' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

-- Tuesday timetable entries
INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  2 as day_of_week,
  '08:00:00' as start_time,
  '08:45:00' as end_time,
  'English' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  2 as day_of_week,
  '08:45:00' as start_time,
  '09:30:00' as end_time,
  'Mathematics' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

-- Wednesday timetable entries
INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  3 as day_of_week,
  '08:00:00' as start_time,
  '08:45:00' as end_time,
  'Science' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

-- Thursday timetable entries
INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  4 as day_of_week,
  '08:00:00' as start_time,
  '08:45:00' as end_time,
  'Physical Education' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;

-- Friday timetable entries
INSERT INTO public.timetable (day_of_week, start_time, end_time, subject, class_id, teacher_id) 
SELECT 
  5 as day_of_week,
  '08:00:00' as start_time,
  '08:45:00' as end_time,
  'Art' as subject,
  c.id as class_id,
  t.id as teacher_id
FROM public.classes c
CROSS JOIN public.teachers t
WHERE c.grade IN ('1', '2', '3') AND c.section = 'A'
AND t.subject = 'Mathematics'
LIMIT 3;