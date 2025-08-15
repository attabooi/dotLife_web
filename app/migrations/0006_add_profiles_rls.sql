-- Enable RLS on profiles table
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON "profiles"
FOR SELECT USING (auth.uid() = profile_id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON "profiles"
FOR UPDATE USING (auth.uid() = profile_id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON "profiles"
FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Policy to allow public read access to profiles (for viewing other users)
CREATE POLICY "Public can view profiles" ON "profiles"
FOR SELECT USING (true);
