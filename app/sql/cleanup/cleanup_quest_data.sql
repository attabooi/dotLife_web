-- Cleanup script to fix quest data issues
-- Run this in Supabase SQL Editor to clean up incorrect data

-- 1. Check current quest data
SELECT 
  quest_date,
  COUNT(*) as quest_count,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed_count
FROM public.daily_quests 
GROUP BY quest_date 
ORDER BY quest_date DESC;

-- 2. Delete quests with incorrect future dates (if any)
DELETE FROM public.daily_quests 
WHERE quest_date > CURRENT_DATE;

-- 3. Update any quests with wrong dates to today's date (if needed)
-- Uncomment the line below if you want to move all quests to today
-- UPDATE public.daily_quests SET quest_date = CURRENT_DATE WHERE quest_date != CURRENT_DATE;

-- 4. Check player stats for any issues
SELECT 
  profile_id,
  level,
  current_xp,
  consecutive_days,
  total_bricks,
  hearts,
  last_completed_date
FROM public.player_stats;

-- 5. Reset player stats if needed (uncomment if you want to reset)
-- UPDATE public.player_stats SET 
--   level = 1,
--   current_xp = 0,
--   consecutive_days = 0,
--   total_bricks = 0,
--   hearts = 1,
--   last_completed_date = NULL;

-- 6. Show final state
SELECT 
  'Current date:' as info,
  CURRENT_DATE as value
UNION ALL
SELECT 
  'Total quests today:' as info,
  COUNT(*)::text as value
FROM public.daily_quests 
WHERE quest_date = CURRENT_DATE; 