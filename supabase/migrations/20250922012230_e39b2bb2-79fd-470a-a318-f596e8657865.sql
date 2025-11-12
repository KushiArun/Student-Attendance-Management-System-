-- Fix the handle_new_user function to properly extract role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update existing profiles with correct roles from auth.users metadata
UPDATE public.profiles 
SET role = COALESCE(auth_users.raw_user_meta_data->>'role', 'STUDENT')
FROM auth.users auth_users 
WHERE profiles.user_id = auth_users.id 
AND auth_users.raw_user_meta_data ? 'role';