-- Row Level Security (RLS) policies for quest system
-- TEMPORARILY DISABLED TO FIX TRIGGER ISSUES

-- Disable RLS temporarily to fix trigger permission issues
alter table public.daily_quests disable row level security;
alter table public.player_stats disable row level security;
alter table public.profiles disable row level security;

-- Grant all necessary permissions without RLS restrictions
grant usage on schema public to anon, authenticated;
grant all on public.daily_quests to authenticated;
grant all on public.player_stats to authenticated;
grant all on public.profiles to authenticated;
grant select on public.quest_view to authenticated;
grant select on public.quest_daily_summary_view to authenticated;
grant select on public.player_stats_view to authenticated;
grant select on public.quest_history_view to authenticated;

-- Grant permissions to postgres role for trigger functions
grant usage on schema public to postgres;
grant all on public.daily_quests to postgres;
grant all on public.player_stats to postgres;
grant all on public.profiles to postgres;