-- Insert random attendance records for today
INSERT INTO public.attendance (student_id, class_id, date, status, marked_by, notes)
SELECT 
  s.id as student_id,
  sc.class_id,
  CURRENT_DATE as date,
  CASE 
    WHEN random() < 0.15 THEN 'ABSENT'
    WHEN random() < 0.25 THEN 'LATE'
    ELSE 'PRESENT'
  END as status,
  (SELECT id FROM public.profiles WHERE role = 'ADMIN' LIMIT 1) as marked_by,
  CASE 
    WHEN random() < 0.15 THEN 'Student was absent today'
    WHEN random() < 0.25 THEN 'Student arrived late'
    ELSE NULL
  END as notes
FROM public.students s
INNER JOIN public.student_classes sc ON s.id = sc.student_id
WHERE s.parent_contact IS NOT NULL
LIMIT 20;

-- Insert parent notifications for absent students
INSERT INTO public.parent_notifications (student_id, parent_contact, notification_type, message, status)
SELECT 
  a.student_id,
  s.parent_contact,
  'absence' as notification_type,
  'Dear Parent, ' || s.full_name || ' (ID: ' || s.student_id || ') was absent on ' || 
  TO_CHAR(a.date, 'Month DD, YYYY') || '. Please contact the school if you have any questions.' as message,
  'sent' as status
FROM public.attendance a
INNER JOIN public.students s ON a.student_id = s.id
WHERE a.status = 'ABSENT' 
  AND a.date = CURRENT_DATE
  AND s.parent_contact IS NOT NULL;

-- Insert parent notifications for late students
INSERT INTO public.parent_notifications (student_id, parent_contact, notification_type, message, status)
SELECT 
  a.student_id,
  s.parent_contact,
  'late_arrival' as notification_type,
  'Dear Parent, ' || s.full_name || ' (ID: ' || s.student_id || ') arrived late to class on ' || 
  TO_CHAR(a.date, 'Month DD, YYYY') || '. ' || COALESCE(a.notes, 'No additional notes.') as message,
  'sent' as status
FROM public.attendance a
INNER JOIN public.students s ON a.student_id = s.id
WHERE a.status = 'LATE' 
  AND a.date = CURRENT_DATE
  AND s.parent_contact IS NOT NULL;