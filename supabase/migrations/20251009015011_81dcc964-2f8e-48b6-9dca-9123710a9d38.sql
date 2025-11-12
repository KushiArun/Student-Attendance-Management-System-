-- Update classes to use year and department system
UPDATE classes 
SET 
  name = CASE 
    WHEN grade = 'ADA' THEN 'ADA - 1st Year IS'
    WHEN grade = 'TOC' THEN 'TOC - 1st Year AD'
    WHEN grade = 'DS' THEN 'DS - 2nd Year IS'
    WHEN grade = 'RM' THEN 'RM - 2nd Year AD'
    WHEN grade = 'DSA' THEN 'DSA - 3rd Year IS'
    WHEN grade = 'CN' THEN 'CN - 3rd Year AD'
    WHEN grade = 'SEPM' THEN 'SEPM - 4th Year IS'
    WHEN grade = 'DBMS' THEN 'DBMS - 4th Year AD'
    WHEN grade = 'OS' THEN 'OS - 4th Year IS2'
    ELSE name
  END,
  grade = CASE 
    WHEN grade IN ('ADA', 'TOC') THEN '1st Year'
    WHEN grade IN ('DS', 'RM') THEN '2nd Year'
    WHEN grade IN ('DSA', 'CN') THEN '3rd Year'
    WHEN grade IN ('SEPM', 'DBMS', 'OS') THEN '4th Year'
    ELSE grade
  END,
  section = CASE 
    WHEN grade = 'ADA' THEN 'IS'
    WHEN grade = 'TOC' THEN 'AD'
    WHEN grade = 'DS' THEN 'IS'
    WHEN grade = 'RM' THEN 'AD'
    WHEN grade = 'DSA' THEN 'IS'
    WHEN grade = 'CN' THEN 'AD'
    WHEN grade = 'SEPM' THEN 'IS'
    WHEN grade = 'DBMS' THEN 'AD'
    WHEN grade = 'OS' THEN 'IS2'
    ELSE section
  END;

-- Update students to use year and department system
UPDATE students
SET 
  grade = CASE 
    WHEN grade IN ('ADA', 'TOC') THEN '1st Year'
    WHEN grade IN ('DS', 'RM') THEN '2nd Year'
    WHEN grade IN ('DSA', 'CN') THEN '3rd Year'
    WHEN grade IN ('SEPM', 'DBMS', 'OS') THEN '4th Year'
    ELSE grade
  END,
  section = CASE 
    WHEN grade = 'ADA' THEN 'IS'
    WHEN grade = 'TOC' THEN 'AD'
    WHEN grade = 'DS' THEN 'IS'
    WHEN grade = 'RM' THEN 'AD'
    WHEN grade = 'DSA' THEN 'IS'
    WHEN grade = 'CN' THEN 'AD'
    WHEN grade = 'SEPM' THEN 'IS'
    WHEN grade = 'DBMS' THEN 'AD'
    WHEN grade = 'OS' THEN 'IS2'
    ELSE section
  END
WHERE grade IN ('ADA', 'TOC', 'DS', 'RM', 'DSA', 'CN', 'SEPM', 'DBMS', 'OS');