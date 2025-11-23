-- Create the 'datasets' table
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for the 'datasets' table
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to insert data
CREATE POLICY "Allow authenticated users to insert datasets"
ON public.datasets FOR INSERT TO authenticated WITH CHECK (true);

-- Create a policy to allow all authenticated users to select their own data
CREATE POLICY "Allow authenticated users to view all datasets"
ON public.datasets FOR SELECT TO authenticated USING (true);

-- Optionally, if you want to link datasets to specific users (e.g., via auth.users.id)
-- You would add a 'user_id UUID REFERENCES auth.users(id)' column to the 'datasets' table
-- And modify the policies accordingly:
-- CREATE TABLE public.datasets (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
--   name TEXT NOT NULL,
--   data JSONB NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
--
-- CREATE POLICY "Allow users to insert their own datasets"
-- ON public.datasets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Allow users to view their own datasets"
-- ON public.datasets FOR SELECT TO authenticated USING (auth.uid() = user_id);
