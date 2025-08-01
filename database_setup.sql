-- Run this SQL in your Supabase SQL Editor

-- Create saved_combats table
CREATE TABLE IF NOT EXISTS public.saved_combats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  combat_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_combats_user_id ON public.saved_combats(user_id);

-- Create an index on updated_at for ordering
CREATE INDEX IF NOT EXISTS idx_saved_combats_updated_at ON public.saved_combats(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_combats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own combats
CREATE POLICY "Users can view their own combats" ON public.saved_combats
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can insert their own combats  
CREATE POLICY "Users can insert their own combats" ON public.saved_combats
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own combats
CREATE POLICY "Users can update their own combats" ON public.saved_combats
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Users can delete their own combats
CREATE POLICY "Users can delete their own combats" ON public.saved_combats
  FOR DELETE USING (user_id = auth.uid()::text);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_combats_updated_at 
    BEFORE UPDATE ON public.saved_combats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
