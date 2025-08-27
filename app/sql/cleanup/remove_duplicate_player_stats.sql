-- Remove duplicate player_stats records
-- Keep the most recent record for each profile_id

-- First, identify duplicates
WITH duplicates AS (
  SELECT 
    profile_id,
    COUNT(*) as count,
    MAX(created_at) as latest_created_at
  FROM player_stats
  GROUP BY profile_id
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT ps.id
  FROM player_stats ps
  INNER JOIN duplicates d ON ps.profile_id = d.profile_id
  WHERE ps.created_at < d.latest_created_at
)
DELETE FROM player_stats
WHERE id IN (SELECT id FROM to_delete);

-- Verify no duplicates remain
SELECT 
  profile_id,
  COUNT(*) as count
FROM player_stats
GROUP BY profile_id
HAVING COUNT(*) > 1;
