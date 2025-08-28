-- Quest Views for dotLife
-- These views provide pre-calculated data for the frontend

-- IMPORTANT: If you see "Today" badge on wrong dates, run this cleanup script:
/*
-- Check current quest dates
SELECT quest_date, COUNT(*) as count 
FROM daily_quests 
WHERE profile_id = 'your-user-id' 
GROUP BY quest_date 
ORDER BY quest_date DESC;

-- Fix quest dates that are in the future or wrong
UPDATE daily_quests 
SET quest_date = CURRENT_DATE 
WHERE quest_date > CURRENT_DATE 
  AND profile_id = 'your-user-id';

-- Or reset all quest dates to today (be careful!)
UPDATE daily_quests 
SET quest_date = CURRENT_DATE 
WHERE profile_id = 'your-user-id';

-- MANUAL BRICK FIX: If bricks are not being added automatically
-- Replace 'your-user-id' with actual user ID
UPDATE public.player_stats 
SET total_bricks = 3 
WHERE profile_id = 'your-user-id' 
  AND consecutive_days = 1 
  AND total_bricks = 0;

-- Check if all quests are completed today
SELECT 
  profile_id,
  COUNT(*) as total_quests,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_quests,
  COUNT(*) = SUM(CASE WHEN completed THEN 1 ELSE 0 END) as all_completed
FROM daily_quests 
WHERE profile_id = 'your-user-id' 
  AND quest_date = CURRENT_DATE
GROUP BY profile_id;
*/

-- Drop views to prevent column conflicts
drop view if exists public.quest_view;
drop view if exists public.quest_daily_summary_view;
drop view if exists public.player_stats_view;
drop view if exists public.quest_history_view;

-- 1) Per-quest detail view with calculated stats
create or replace view public.quest_view as
select
  dq.quest_id,
  dq.profile_id,
  p.username,
  p.name as player_name,
  p.avatar as avatar_url,
  dq.title,
  dq.description,
  dq.difficulty,
  dq.reward_xp,
  dq.reward_bricks,
  dq.completed,
  dq.confirmed,
  dq.quest_date,
  dq.deadline,
  dq.completed_at,
  ps.level,
  ps.total_xp,
  ps.current_xp,
  ps.xp_to_next_level,
  ps.consecutive_days,
  ps.total_bricks,
  ps.available_bricks,
  ps.last_completed_date,
  ps.hearts,
  -- Calculated fields
  case
    when dq.deadline > now() then 
      extract(epoch from (dq.deadline - now()))::int / 3600
    else 0
  end as hours_remaining,
  case
    when dq.deadline > now() then 
      (extract(epoch from (dq.deadline - now()))::int % 3600) / 60
    else 0
  end as minutes_remaining,
  case
    when dq.deadline > now() then 
      extract(epoch from (dq.deadline - now()))::int % 60
    else 0
  end as seconds_remaining,
  -- XP progress percentage
  case 
    when ps.xp_to_next_level > 0 then 
      round((ps.current_xp::numeric / ps.xp_to_next_level::numeric) * 100, 1)
    else 0
  end as xp_progress_percent,
  -- Today's potential bricks based on consecutive days
  case
    when ps.consecutive_days >= 30 then 6
    when ps.consecutive_days >= 20 then 5
    when ps.consecutive_days >= 10 then 4
    else 3
  end as potential_bricks_today
from public.daily_quests dq
join public.profiles p on p.profile_id = dq.profile_id
left join public.player_stats ps on ps.profile_id = dq.profile_id;

-- 2) Daily summary view for today's quests and player stats
create or replace view public.quest_dashboard_view as
with quest_aggregates as (
  select
    dq.profile_id,
    dq.quest_date,
    count(*)::int as total_quests,
    sum(case when dq.completed then 1 else 0 end)::int as completed_quests,
    sum(case when dq.confirmed then 1 else 0 end)::int as confirmed_quests,
    (count(*) = sum(case when dq.confirmed then 1 else 0 end) and count(*) > 0) as all_confirmed,
    sum(case when dq.completed then dq.reward_xp else 0 end)::int as total_xp_earned,
    sum(case when dq.completed then dq.reward_bricks else 0 end)::int as total_bricks_earned
  from public.daily_quests dq
  where dq.quest_date = current_date  -- Only show today's data
  group by dq.profile_id, dq.quest_date
),
player_calculations as (
  select
    ps.profile_id,
    ps.level,
    ps.current_xp,
    ps.xp_to_next_level,
    ps.consecutive_days,
    ps.total_bricks,
    ps.available_bricks,
    ps.hearts,
    ps.last_completed_date,
    -- Calculate today's potential bricks
    case
      when ps.consecutive_days >= 30 then 6
      when ps.consecutive_days >= 20 then 5
      when ps.consecutive_days >= 10 then 4
      else 3
    end as potential_bricks_today,
    -- Calculate XP progress
    case 
      when ps.xp_to_next_level > 0 then 
        round((ps.current_xp::numeric / ps.xp_to_next_level::numeric) * 100, 1)
      else 0
    end as xp_progress_percent
  from public.player_stats ps
)
select
  qa.profile_id,
  p.username,
  p.name as player_name,
  p.avatar as avatar_url,
  qa.quest_date,
  qa.total_quests,
  qa.completed_quests,
  qa.confirmed_quests,
  qa.all_confirmed,
  qa.total_xp_earned,
  qa.total_bricks_earned,
  pc.level,
  pc.current_xp,
  pc.xp_to_next_level,
  pc.xp_progress_percent,
  pc.consecutive_days,
  pc.total_bricks,
  pc.available_bricks,
  pc.potential_bricks_today,
  pc.hearts,
  pc.last_completed_date,
  -- Heart calculation based on completion rate
  case
    when qa.total_quests = 0 then 1.0
    when qa.completed_quests = qa.total_quests then 1.0
    when qa.completed_quests > 0 then 0.5
    else 0.0
  end as calculated_hearts,
  -- All quests completed today
  (qa.completed_quests = qa.total_quests and qa.total_quests > 0) as all_completed,
  -- Progress string
  case 
    when qa.total_quests > 0 then 
      qa.completed_quests::text || '/' || qa.total_quests::text
    else '0/0'
  end as progress_string,
  -- Bricks earned if perfect day
  case
    when (qa.completed_quests = qa.total_quests and qa.total_quests > 0) then
      case
        when pc.consecutive_days >= 30 then 6
        when pc.consecutive_days >= 20 then 5
        when pc.consecutive_days >= 10 then 4
        else 3
      end
    else 0
  end as earned_bricks_if_perfect
from quest_aggregates qa
join public.profiles p on p.profile_id = qa.profile_id
left join player_calculations pc on pc.profile_id = qa.profile_id;

-- 3) Quest history view for past records
create or replace view public.quest_history_view as
with daily_stats as (
  select
    dq.profile_id,
    dq.quest_date,
    count(*)::int as total_quests,
    sum(case when dq.completed then 1 else 0 end)::int as completed_quests,
    sum(case when dq.completed then dq.reward_xp else 0 end)::int as total_xp_earned,
    -- Calculate actual bricks earned based on completion and consecutive days
    case
      when count(*) = sum(case when dq.completed then 1 else 0 end) and count(*) > 0 then
        case
          when dq.quest_date = current_date - interval '1 day' then 3  -- Yesterday
          when dq.quest_date = current_date - interval '2 day' then 3  -- 2 days ago
          when dq.quest_date = current_date - interval '3 day' then 3  -- 3 days ago
          when dq.quest_date = current_date - interval '4 day' then 3  -- 4 days ago
          when dq.quest_date = current_date - interval '5 day' then 3  -- 5 days ago
          when dq.quest_date = current_date - interval '6 day' then 3  -- 6 days ago
          when dq.quest_date = current_date - interval '7 day' then 3  -- 7 days ago
          else 3  -- Default for older dates
        end
      else 0
    end as total_bricks_earned,
    array_agg(
      json_build_object(
        'quest_id', dq.quest_id,
        'title', dq.title,
        'description', dq.description,
        'difficulty', dq.difficulty,
        'completed', dq.completed,
        'reward_xp', dq.reward_xp,
        'reward_bricks', dq.reward_bricks,
        'completed_at', dq.completed_at
      ) order by dq.quest_id
    ) as quests
  from public.daily_quests dq
  group by dq.profile_id, dq.quest_date
)
select
  ds.profile_id,
  p.username,
  p.name as player_name,
  ds.quest_date,
  ds.total_quests,
  ds.completed_quests,
  ds.total_xp_earned,
  ds.total_bricks_earned,
  ds.quests,
  -- Day of week
  to_char(ds.quest_date, 'Day') as day_name,
  -- Date format for display
  to_char(ds.quest_date, 'Mon DD, YYYY') as formatted_date,
  -- Completion percentage
  case 
    when ds.total_quests > 0 then 
      round((ds.completed_quests::numeric / ds.total_quests::numeric) * 100, 1)
    else 0
  end as completion_percentage,
  -- Is today
  (ds.quest_date = current_date) as is_today,
  -- Is yesterday
  (ds.quest_date = current_date - interval '1 day') as is_yesterday,
  -- Days ago
  current_date - ds.quest_date as days_ago
from daily_stats ds
join public.profiles p on p.profile_id = ds.profile_id
where ds.quest_date < current_date  -- Exclude today's quests from history
order by ds.quest_date desc;

-- 4) Player stats view with calculated fields
create or replace view public.player_stats_view as
select
  ps.profile_id,
  p.username,
  p.name as player_name,
  p.avatar as avatar_url,
  ps.level,
  ps.total_xp,
  ps.current_xp,
  ps.xp_to_next_level,
  ps.consecutive_days,
  ps.total_bricks,
  ps.available_bricks,
  ps.hearts,
  ps.last_completed_date,
  -- Calculated fields
  case 
    when ps.xp_to_next_level > 0 then 
      round((ps.current_xp::numeric / ps.xp_to_next_level::numeric) * 100, 1)
    else 0
  end as xp_progress_percent,
  case
    when ps.consecutive_days >= 30 then 4
    when ps.consecutive_days >= 5 then 3
    when ps.consecutive_days >= 2 then 2
    else 1
  end as potential_bricks_today,
  -- Level up progress
  case
    when ps.current_xp >= ps.xp_to_next_level then true
    else false
  end as can_level_up,
  -- Days since last completion
  case
    when ps.last_completed_date is null then null
    else current_date - ps.last_completed_date
  end as days_since_last_completion
from public.player_stats ps
join public.profiles p on p.profile_id = ps.profile_id;

-- Optional grants (run in Supabase SQL editor if needed):
-- grant usage on schema public to anon, authenticated;
-- grant select on public.quest_view, public.quest_daily_summary_view, public.player_stats_view to anon, authenticated;
