-- Create simple patch_notes table without foreign keys
CREATE TABLE IF NOT EXISTS patch_notes (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE patch_notes ENABLE ROW LEVEL SECURITY;

-- Allow all users to read published patch notes
CREATE POLICY "Allow read published patch notes" ON patch_notes
  FOR SELECT USING (is_published = true);

-- Allow only specific admin user to manage patch notes (replace 'your-admin-user-id' with actual UUID)
CREATE POLICY "Allow admin to manage patch notes" ON patch_notes
  FOR ALL USING (auth.uid() = 'your-admin-user-id'::uuid);

-- Create index for better performance
CREATE INDEX idx_patch_notes_release_date ON patch_notes(release_date DESC);
CREATE INDEX idx_patch_notes_is_published ON patch_notes(is_published);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_patch_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patch_notes_updated_at
  BEFORE UPDATE ON patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_patch_notes_updated_at();
