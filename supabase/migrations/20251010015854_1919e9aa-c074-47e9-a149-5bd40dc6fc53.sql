-- Insert test student "kuhh" with parent contact
INSERT INTO public.students (student_id, full_name, grade, section, email, parent_contact)
VALUES 
  ('STU001', 'kuhh', '1st Year', 'IS', 'kuhh@ewit.edu', 'kuhh@parent.com')
ON CONFLICT (student_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    parent_contact = EXCLUDED.parent_contact;