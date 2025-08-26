-- Add last_bricks_awarded_date column to player_stats table
ALTER TABLE public.player_stats 
ADD COLUMN last_bricks_awarded_date DATE;
