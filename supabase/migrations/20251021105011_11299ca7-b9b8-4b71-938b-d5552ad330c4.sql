-- Remove all classes except V_AD
DELETE FROM student_classes WHERE class_id NOT IN (SELECT id FROM classes WHERE name = 'V_AD');
DELETE FROM daily_attendance WHERE class_id NOT IN (SELECT id FROM classes WHERE name = 'V_AD');
DELETE FROM attendance WHERE class_id NOT IN (SELECT id FROM classes WHERE name = 'V_AD');
DELETE FROM timetable WHERE class_id NOT IN (SELECT id FROM classes WHERE name = 'V_AD');
DELETE FROM classes WHERE name != 'V_AD';

-- Remove all teachers except those in the timetable
DELETE FROM teachers WHERE teacher_id NOT IN ('VR', 'SD', 'AB', 'PCR', 'AHS', 'PRL');