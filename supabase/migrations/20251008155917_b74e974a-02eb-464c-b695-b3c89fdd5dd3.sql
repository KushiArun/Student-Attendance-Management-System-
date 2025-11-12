-- Insert sample students
INSERT INTO students (student_id, full_name, email, grade, section, parent_contact) VALUES
('STU001', 'Arjun Kumar', 'arjun.kumar@student.com', '10', 'A', '+91-9876543210'),
('STU002', 'Priya Sharma', 'priya.sharma@student.com', '10', 'A', '+91-9876543211'),
('STU003', 'Rahul Verma', 'rahul.verma@student.com', '10', 'A', '+91-9876543212'),
('STU004', 'Sneha Patel', 'sneha.patel@student.com', '10', 'B', '+91-9876543213'),
('STU005', 'Vikram Singh', 'vikram.singh@student.com', '10', 'B', '+91-9876543214'),
('STU006', 'Ananya Reddy', 'ananya.reddy@student.com', '9', 'A', '+91-9876543215'),
('STU007', 'Rohan Gupta', 'rohan.gupta@student.com', '9', 'A', '+91-9876543216'),
('STU008', 'Neha Joshi', 'neha.joshi@student.com', '9', 'B', '+91-9876543217'),
('STU009', 'Karan Mehta', 'karan.mehta@student.com', '11', 'A', '+91-9876543218'),
('STU010', 'Divya Nair', 'divya.nair@student.com', '11', 'A', '+91-9876543219'),
('STU011', 'Aditya Kapoor', 'aditya.kapoor@student.com', '11', 'B', '+91-9876543220'),
('STU012', 'Pooja Desai', 'pooja.desai@student.com', '12', 'A', '+91-9876543221'),
('STU013', 'Sanjay Rao', 'sanjay.rao@student.com', '12', 'A', '+91-9876543222'),
('STU014', 'Kavya Iyer', 'kavya.iyer@student.com', '12', 'B', '+91-9876543223'),
('STU015', 'Nikhil Bhatt', 'nikhil.bhatt@student.com', '8', 'A', '+91-9876543224')
ON CONFLICT (student_id) DO NOTHING;

-- Enroll students in classes (linking students to all available classes)
INSERT INTO student_classes (student_id, class_id)
SELECT s.id, c.id
FROM students s
CROSS JOIN classes c
WHERE s.student_id IN ('STU001', 'STU002', 'STU003', 'STU004', 'STU005', 'STU006', 'STU007', 'STU008', 'STU009', 'STU010', 'STU011', 'STU012', 'STU013', 'STU014', 'STU015')
ON CONFLICT DO NOTHING;