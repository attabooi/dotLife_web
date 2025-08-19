-- Player stats triggers for automatic updates
-- Handles: new profile creation, quest completion, heart calculation

-- 1. Create player stats when new profile is created
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.player_stats (
    profile_id,
    level,
    total_xp,
    current_xp,
    xp_to_next_level,
    consecutive_days,
    total_bricks,
    available_bricks,
    hearts,
    last_completed_date
  ) values (
    new.profile_id,
    1,  -- starting level
    0,  -- total xp
    0,  -- current xp
    100, -- xp to next level
    0,  -- consecutive days
    0,  -- total bricks
    0,  -- available bricks
    1,  -- starting hearts
    null -- last completed date
  );
  return new;
end;
$$;

-- Trigger for new profile
drop trigger if exists profile_to_player_stats_trigger on public.profiles;
create trigger profile_to_player_stats_trigger
after insert on public.profiles
for each row execute function public.handle_new_profile();

-- 2. Update player hearts based on quest completion rate
-- Drop existing function first to avoid parameter name conflict
drop function if exists public.update_player_hearts(uuid, date);

create or replace function public.update_player_hearts(p_profile_id uuid, p_quest_date date)
returns void
language plpgsql
security definer
as $$
declare
  v_total_quests int;
  v_completed_quests int;
  v_new_hearts numeric;
begin
  -- Get today's quest completion stats
  select 
    count(*)::int,
    sum(case when completed then 1 else 0 end)::int
  into v_total_quests, v_completed_quests
  from public.daily_quests
  where profile_id = p_profile_id 
    and quest_date = p_quest_date;
  
  -- Calculate hearts based on completion rate
  if v_total_quests = 0 then
    v_new_hearts := 1.0;
  elsif v_completed_quests = v_total_quests then
    v_new_hearts := 1.0;
  elsif v_completed_quests > 0 then
    v_new_hearts := 0.5;
  else
    v_new_hearts := 0.0;
  end if;
  
  -- Update player stats
  update public.player_stats
  set hearts = v_new_hearts
  where profile_id = p_profile_id;
end;
$$;

-- 3. Handle quest completion and update all stats
create or replace function public.handle_quest_completion()
returns trigger
language plpgsql
security definer
as $$
declare
  v_old_xp int;
  v_new_xp int;
  v_new_level int;
  v_xp_needed int;
  v_today date;
  v_yesterday date;
  v_bricks_earned int;
begin
  -- Only process when quest is marked as completed
  if new.completed = true and (old.completed = false or old.completed is null) then
    v_today := current_date;
    
    -- Get current player stats
    select current_xp, level into v_old_xp, v_new_level
    from public.player_stats
    where profile_id = new.profile_id;
    
    -- Calculate new XP
    v_new_xp := v_old_xp + new.reward_xp;
    v_xp_needed := v_new_level * 100;
    
    -- Check for level up
    if v_new_xp >= v_xp_needed then
      v_new_level := v_new_level + 1;
      v_new_xp := v_new_xp - v_xp_needed;
    end if;
    
    -- Calculate consecutive days and bricks
    v_yesterday := v_today - interval '1 day';
    
    -- Check if this is consecutive completion
    if exists (
      select 1 from public.player_stats 
      where profile_id = new.profile_id 
        and last_completed_date = v_yesterday
    ) then
      -- Consecutive day
      update public.player_stats
      set 
        current_xp = v_new_xp,
        level = v_new_level,
        xp_to_next_level = v_new_level * 100,
        consecutive_days = consecutive_days + 1,
        last_completed_date = v_today,
        total_bricks = total_bricks + case
          when consecutive_days + 1 >= 30 then 4
          when consecutive_days + 1 >= 5 then 3
          when consecutive_days + 1 >= 2 then 2
          else 1
        end
      where profile_id = new.profile_id;
    else
      -- Reset consecutive days
      update public.player_stats
      set 
        current_xp = v_new_xp,
        level = v_new_level,
        xp_to_next_level = v_new_level * 100,
        consecutive_days = 1,
        last_completed_date = v_today,
        total_bricks = total_bricks + 1
      where profile_id = new.profile_id;
    end if;
    
    -- Update hearts based on today's completion rate
    perform public.update_player_hearts(new.profile_id, v_today);
  end if;
  
  return new;
end;
$$;

-- Trigger for quest completion
drop trigger if exists quest_completion_trigger on public.daily_quests;
create trigger quest_completion_trigger
after update on public.daily_quests
for each row execute function public.handle_quest_completion(); 