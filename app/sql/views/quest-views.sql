-- Quest views for Daily Quests page (Supabase)
-- Includes:
-- 1) quest_view                   → per-quest with player snapshot
-- 2) quest_daily_summary_view     → per-user per-date aggregates (hearts/brick logic)

-- Drop existing views first to avoid column name conflicts
drop view if exists public.quest_view;
drop view if exists public.quest_daily_summary_view;
drop view if exists public.player_stats_view;

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
    when ps.consecutive_days >= 30 then 4
    when ps.consecutive_days >= 5 then 3
    when ps.consecutive_days >= 2 then 2
    else 1
  end as potential_bricks_today
from public.daily_quests dq
join public.profiles p on p.profile_id = dq.profile_id
left join public.player_stats ps on ps.profile_id = dq.profile_id;

-- 2) Per-day summary view with all calculations
create or replace view public.quest_daily_summary_view as
with quest_aggregates as (
  select
    dq.profile_id,
    dq.quest_date,
    count(*)::int as total_quests,
    sum(case when dq.completed then 1 else 0 end)::int as completed_quests,
    sum(case when dq.confirmed then 1 else 0 end)::int as confirmed_quests,
    bool_and(dq.confirmed) as all_confirmed,
    sum(case when dq.completed then dq.reward_xp else 0 end)::int as total_xp_earned,
    sum(case when dq.completed then dq.reward_bricks else 0 end)::int as total_bricks_earned
  from public.daily_quests dq
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
      when ps.consecutive_days >= 30 then 4
      when ps.consecutive_days >= 5 then 3
      when ps.consecutive_days >= 2 then 2
      else 1
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
        when pc.consecutive_days >= 30 then 4
        when pc.consecutive_days >= 5 then 3
        when pc.consecutive_days >= 2 then 2
        else 1
      end
    else 0
  end as earned_bricks_if_perfect
from quest_aggregates qa
join public.profiles p on p.profile_id = qa.profile_id
left join player_calculations pc on pc.profile_id = qa.profile_id;

-- 3) Player stats view with calculated fields
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
