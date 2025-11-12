-- Enable realtime for parent_notifications table
ALTER TABLE public.parent_notifications REPLICA IDENTITY FULL;