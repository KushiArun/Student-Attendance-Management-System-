-- Fix the infinite recursion in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a security definer function to check admin roles
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = is_admin_user.user_id
    AND p.role IN ('ADMIN', 'HOD', 'PRINCIPAL')
  );
$$;

-- Create new policies without recursion
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- Create attendance management table for tracking daily attendance
CREATE TABLE IF NOT EXISTS public.daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id),
  date DATE NOT NULL,
  total_students INTEGER DEFAULT 0,
  present_students INTEGER DEFAULT 0,
  absent_students INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on daily_attendance
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_attendance
CREATE POLICY "Enable all for authenticated users"
ON public.daily_attendance
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updating daily_attendance
CREATE TRIGGER update_daily_attendance_updated_at
BEFORE UPDATE ON public.daily_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();