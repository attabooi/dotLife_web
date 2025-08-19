-- Row Level Security (RLS) policies for quest system
-- Ensures users can only access their own data

-- Enable RLS on tables
alter table public.daily_quests enable row level security;
alter table public.player_stats enable row level security;
alter table public.profiles enable row level security;

-- 1. Daily Quests policies
drop policy if exists "Users can view their own quests" on public.daily_quests;
create policy "Users can view their own quests"
  on public.daily_quests for select
  using (auth.uid() = profile_id);

drop policy if exists "Users can insert their own quests" on public.daily_quests;
create policy "Users can insert their own quests"
  on public.daily_quests for insert
  with check (auth.uid() = profile_id);

drop policy if exists "Users can update their own quests" on public.daily_quests;
create policy "Users can update their own quests"
  on public.daily_quests for update
  using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own quests" on public.daily_quests;
create policy "Users can delete their own quests"
  on public.daily_quests for delete
  using (auth.uid() = profile_id);

-- 2. Player Stats policies
drop policy if exists "Users can view their own stats" on public.player_stats;
create policy "Users can view their own stats"
  on public.player_stats for select
  using (auth.uid() = profile_id);

drop policy if exists "Users can update their own stats" on public.player_stats;
create policy "Users can update their own stats"
  on public.player_stats for update
  using (auth.uid() = profile_id);

-- 3. Profiles policies (for public read, owner write)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = profile_id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.daily_quests to authenticated;
grant select, update on public.player_stats to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.quest_view to authenticated;
grant select on public.quest_daily_summary_view to authenticated;
grant select on public.player_stats_view to authenticated; 