-- First, let's clear the existing timetable entries for V_AD class
DELETE FROM timetable 
WHERE class_id IN (SELECT id FROM classes WHERE name = 'V_AD');

-- Get the class_id for V_AD
DO $$
DECLARE
  v_ad_class_id uuid;
  anjana_id uuid;
  sharon_id uuid;
  pundareka_id uuid;
  abhipraya_id uuid;
  poornima_id uuid;
  anandhi_id uuid;
BEGIN
  -- Get class and teacher IDs
  SELECT id INTO v_ad_class_id FROM classes WHERE name = 'V_AD';
  SELECT id INTO anjana_id FROM teachers WHERE full_name = 'Prof. ANJANA N KORLAHALLI';
  SELECT id INTO sharon_id FROM teachers WHERE full_name = 'Prof. SHARON D';
  SELECT id INTO pundareka_id FROM teachers WHERE full_name = 'Prof. PUNDAREKA B L';
  SELECT id INTO abhipraya_id FROM teachers WHERE full_name = 'Prof. ABHIPRAYA H S';
  SELECT id INTO poornima_id FROM teachers WHERE full_name = 'Prof. POORNIMA R LAKSHMI';
  SELECT id INTO anandhi_id FROM teachers WHERE full_name = 'Prof. ANANDHI S';

  -- MONDAY (day_of_week = 1)
  INSERT INTO timetable (class_id, day_of_week, start_time, end_time, subject, teacher_id) VALUES
  (v_ad_class_id, 1, '08:45:00', '09:45:00', 'DS', anjana_id),
  (v_ad_class_id, 1, '09:45:00', '10:45:00', 'SEPM', pundareka_id),
  (v_ad_class_id, 1, '11:00:00', '12:00:00', 'RM', sharon_id),
  (v_ad_class_id, 1, '12:00:00', '13:00:00', 'Library', NULL),
  (v_ad_class_id, 1, '13:30:00', '14:30:00', 'Mini Project', anandhi_id),
  (v_ad_class_id, 1, '14:30:00', '15:30:00', 'Mini Project', anandhi_id);

  -- TUESDAY (day_of_week = 2)
  INSERT INTO timetable (class_id, day_of_week, start_time, end_time, subject, teacher_id) VALUES
  (v_ad_class_id, 2, '08:45:00', '09:45:00', 'ENV', poornima_id),
  (v_ad_class_id, 2, '09:45:00', '10:45:00', 'DS', anjana_id),
  (v_ad_class_id, 2, '11:00:00', '12:00:00', 'SEPM', pundareka_id),
  (v_ad_class_id, 2, '12:00:00', '13:00:00', 'CN', abhipraya_id),
  (v_ad_class_id, 2, '13:30:00', '14:30:00', 'TOC', poornima_id),
  (v_ad_class_id, 2, '14:30:00', '15:30:00', 'RM', sharon_id);

  -- WEDNESDAY (day_of_week = 3)
  INSERT INTO timetable (class_id, day_of_week, start_time, end_time, subject, teacher_id) VALUES
  (v_ad_class_id, 3, '08:45:00', '09:45:00', 'TOC', poornima_id),
  (v_ad_class_id, 3, '09:45:00', '10:45:00', 'DS', anjana_id),
  (v_ad_class_id, 3, '11:00:00', '12:00:00', 'TOC', poornima_id),
  (v_ad_class_id, 3, '12:00:00', '13:00:00', 'RM', sharon_id),
  (v_ad_class_id, 3, '13:30:00', '14:30:00', 'Department Activities', NULL),
  (v_ad_class_id, 3, '14:30:00', '15:30:00', 'Department Activities', NULL);
  
END $$;