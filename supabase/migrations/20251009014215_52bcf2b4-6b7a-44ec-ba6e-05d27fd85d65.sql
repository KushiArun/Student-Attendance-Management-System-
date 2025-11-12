-- Update existing classes to use subject-based names instead of grade-based
UPDATE classes 
SET 
  name = CASE 
    WHEN name LIKE '%10%A%' OR grade = '10' AND section = 'A' THEN 'ADA - Algorithm Design & Analysis'
    WHEN name LIKE '%10%B%' OR grade = '10' AND section = 'B' THEN 'TOC - Theory of Computation'
    WHEN name LIKE '%11%A%' OR grade = '11' AND section = 'A' THEN 'DS - Data Structures'
    WHEN name LIKE '%11%B%' OR grade = '11' AND section = 'B' THEN 'RM - Research Methodology'
    WHEN name LIKE '%12%A%' OR grade = '12' AND section = 'A' THEN 'DSA - Data Structures & Algorithms'
    WHEN name LIKE '%12%B%' OR grade = '12' AND section = 'B' THEN 'CN - Computer Networks'
    WHEN name LIKE '%9%A%' OR grade = '9' AND section = 'A' THEN 'SEPM - Software Engineering & Project Management'
    WHEN name LIKE '%9%B%' OR grade = '9' AND section = 'B' THEN 'DBMS - Database Management Systems'
    WHEN name LIKE '%8%A%' OR grade = '8' AND section = 'A' THEN 'OS - Operating Systems'
    ELSE 'CC - Cloud Computing'
  END,
  grade = CASE 
    WHEN name LIKE '%10%A%' OR grade = '10' AND section = 'A' THEN 'ADA'
    WHEN name LIKE '%10%B%' OR grade = '10' AND section = 'B' THEN 'TOC'
    WHEN name LIKE '%11%A%' OR grade = '11' AND section = 'A' THEN 'DS'
    WHEN name LIKE '%11%B%' OR grade = '11' AND section = 'B' THEN 'RM'
    WHEN name LIKE '%12%A%' OR grade = '12' AND section = 'A' THEN 'DSA'
    WHEN name LIKE '%12%B%' OR grade = '12' AND section = 'B' THEN 'CN'
    WHEN name LIKE '%9%A%' OR grade = '9' AND section = 'A' THEN 'SEPM'
    WHEN name LIKE '%9%B%' OR grade = '9' AND section = 'B' THEN 'DBMS'
    WHEN name LIKE '%8%A%' OR grade = '8' AND section = 'A' THEN 'OS'
    ELSE grade
  END,
  section = NULL,
  subject = CASE 
    WHEN name LIKE '%10%A%' OR grade = '10' AND section = 'A' THEN 'Algorithm Design & Analysis'
    WHEN name LIKE '%10%B%' OR grade = '10' AND section = 'B' THEN 'Theory of Computation'
    WHEN name LIKE '%11%A%' OR grade = '11' AND section = 'A' THEN 'Data Structures'
    WHEN name LIKE '%11%B%' OR grade = '11' AND section = 'B' THEN 'Research Methodology'
    WHEN name LIKE '%12%A%' OR grade = '12' AND section = 'A' THEN 'Data Structures & Algorithms'
    WHEN name LIKE '%12%B%' OR grade = '12' AND section = 'B' THEN 'Computer Networks'
    WHEN name LIKE '%9%A%' OR grade = '9' AND section = 'A' THEN 'Software Engineering & Project Management'
    WHEN name LIKE '%9%B%' OR grade = '9' AND section = 'B' THEN 'Database Management Systems'
    WHEN name LIKE '%8%A%' OR grade = '8' AND section = 'A' THEN 'Operating Systems'
    ELSE subject
  END
WHERE grade IN ('8', '9', '10', '11', '12');

-- Update students table to use course codes instead of grade/section
UPDATE students
SET 
  grade = CASE 
    WHEN grade = '10' AND section = 'A' THEN 'ADA'
    WHEN grade = '10' AND section = 'B' THEN 'TOC'
    WHEN grade = '11' AND section = 'A' THEN 'DS'
    WHEN grade = '11' AND section = 'B' THEN 'RM'
    WHEN grade = '12' AND section = 'A' THEN 'DSA'
    WHEN grade = '12' AND section = 'B' THEN 'CN'
    WHEN grade = '9' AND section = 'A' THEN 'SEPM'
    WHEN grade = '9' AND section = 'B' THEN 'DBMS'
    WHEN grade = '8' AND section = 'A' THEN 'OS'
    ELSE grade
  END,
  section = NULL
WHERE grade IN ('8', '9', '10', '11', '12');