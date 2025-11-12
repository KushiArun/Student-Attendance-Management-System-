-- Insert Thursday and Friday timetable entries
INSERT INTO timetable (class_id, day_of_week, start_time, end_time, subject, teacher_id)
VALUES 
  -- Thursday (day 4)
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 4, '08:45:00', '09:45:00', 'DV LAB', 'de0c9c98-bb38-4188-adfb-aa2463507f3e'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 4, '09:45:00', '10:45:00', 'DV LAB', 'de0c9c98-bb38-4188-adfb-aa2463507f3e'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 4, '11:00:00', '12:00:00', 'SEPM', '9d6f3773-c2a9-4d1c-a94e-87a68131ebd6'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 4, '12:00:00', '13:00:00', 'CN', 'bb2e6fb2-e92d-4970-aa93-d5cdefb69817'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 4, '13:30:00', '14:30:00', 'DV LAB', 'de0c9c98-bb38-4188-adfb-aa2463507f3e'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 4, '14:30:00', '15:30:00', 'DV LAB', 'de0c9c98-bb38-4188-adfb-aa2463507f3e'),
  -- Friday (day 5)
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 5, '08:45:00', '09:45:00', 'TOC', 'b6e476e8-edaf-4aac-906d-8188f19b1477'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 5, '09:45:00', '10:45:00', 'DS', '9e373369-79be-49d4-ae32-64d4131f89b7'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 5, '11:00:00', '12:00:00', 'TOC', 'b6e476e8-edaf-4aac-906d-8188f19b1477'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 5, '12:00:00', '13:00:00', 'RM', 'de0c9c98-bb38-4188-adfb-aa2463507f3e'),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 5, '13:30:00', '14:30:00', 'Department Activities', NULL),
  ('e07e47d9-a8a4-4542-a76d-48d7e0242754', 5, '14:30:00', '15:30:00', 'PE', NULL);