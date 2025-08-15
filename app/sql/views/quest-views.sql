-- Quest views for Daily Quests page (Supabase)
-- Includes:
-- 1) quest_view                   → per-quest with player snapshot
-- 2) quest_daily_summary_view     → per-user per-date aggregates (hearts/brick logic)

-- 1) Per-quest detail view
create or replace view public.quest_view as
select
  dq.quest_id,
  dq.profile_id,
  p.username,
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
  ps.hearts
from public.daily_quests dq
join public.profiles p on p.profile_id = dq.profile_id
left join public.player_stats ps on ps.profile_id = dq.profile_id;

-- 2) Per-day summary view
create or replace view public.quest_daily_summary_view as
with agg as (
  select
    dq.profile_id,
    dq.quest_date,
    count(*)::int as total_quests,
    sum(case when dq.completed then 1 else 0 end)::int as completed_quests,
    bool_and(dq.confirmed) as all_confirmed
  from public.daily_quests dq
  group by dq.profile_id, dq.quest_date
)
select
  a.profile_id,
  p.username,
  p.avatar as avatar_url,
  a.quest_date,
  a.total_quests,
  a.completed_quests,
  (a.completed_quests = a.total_quests and a.total_quests > 0) as all_completed,
  ps.level,
  ps.consecutive_days,
  ps.total_bricks,
  ps.available_bricks,
  ps.hearts,
  case
    when ps.consecutive_days >= 30 then 4
    when ps.consecutive_days >= 5 then 3
    when ps.consecutive_days >= 2 then 2
    else 1
  end as potential_bricks,
  case
    when a.total_quests = 0 then 0.0
    when a.completed_quests = a.total_quests then 1.0
    when a.completed_quests > 0 then 0.5
    else 0.0
  end as heart_score,
  case
    when (a.completed_quests = a.total_quests and a.total_quests > 0) then
      case
        when ps.consecutive_days >= 30 then 4
        when ps.consecutive_days >= 5 then 3
        when ps.consecutive_days >= 2 then 2
        else 1
      end
    else 0
  end as earned_bricks_if_perfect
from agg a
join public.profiles p on p.profile_id = a.profile_id
left join public.player_stats ps on ps.profile_id = a.profile_id;

-- Optional grants (run in Supabase SQL editor if needed):
-- grant usage on schema public to anon, authenticated;
-- grant select on public.quest_view, public.quest_daily_summary_view to anon, authenticated;
