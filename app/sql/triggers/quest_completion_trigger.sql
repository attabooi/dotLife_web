-- Trigger to automatically update player stats when a quest is completed
create or replace function public.handle_quest_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    new_xp integer;
    new_level integer;
    remaining_xp integer;
    new_xp_to_next integer;
    today_date date;
    yesterday_date date;
    current_consecutive_days integer;
    new_consecutive_days integer;
    bricks_earned integer;
begin
    -- Only process when quest is marked as completed
    if new.completed = true and (old.completed = false or old.completed is null) then
        -- Get current player stats
        select 
            current_xp,
            level,
            xp_to_next_level,
            consecutive_days,
            last_completed_date
        into 
            new_xp,
            new_level,
            remaining_xp,
            current_consecutive_days,
            yesterday_date
        from public.player_stats 
        where profile_id = new.profile_id;
        
        -- Calculate new XP and level
        new_xp := new_xp + new.reward_xp;
        
        if new_xp >= remaining_xp then
            new_level := new_level + 1;
            remaining_xp := new_xp - remaining_xp;
            new_xp_to_next := new_level * 100;
        else
            remaining_xp := new_xp;
            new_xp_to_next := remaining_xp;
        end if;
        
        -- Calculate consecutive days
        today_date := current_date;
        
        if yesterday_date is null then
            -- First completion ever
            new_consecutive_days := 1;
        elsif yesterday_date = today_date - interval '1 day' then
            -- Consecutive day
            new_consecutive_days := current_consecutive_days + 1;
        else
            -- Streak broken
            new_consecutive_days := 1;
        end if;
        
        -- Calculate bricks earned based on consecutive days
        if new_consecutive_days >= 30 then
            bricks_earned := 4;
        elsif new_consecutive_days >= 5 then
            bricks_earned := 3;
        elsif new_consecutive_days >= 2 then
            bricks_earned := 2;
        else
            bricks_earned := 1;
        end if;
        
        -- Update player stats
        update public.player_stats set
            current_xp = remaining_xp,
            level = new_level,
            xp_to_next_level = new_xp_to_next,
            total_xp = total_xp + new.reward_xp,
            consecutive_days = new_consecutive_days,
            total_bricks = total_bricks + bricks_earned,
            available_bricks = available_bricks + bricks_earned,
            last_completed_date = today_date
        where profile_id = new.profile_id;
        
                    -- Update hearts based on today's completion rate
            -- perform update_player_hearts(new.profile_id, new.quest_date);
    end if;
    
    return new;
end;
$$;

-- Function to update player hearts based on daily completion
create or replace function public.update_player_hearts(profile_id uuid, quest_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    total_quests integer;
    completed_quests integer;
    heart_score real;
begin
    -- Count today's quests
    select 
        count(*)::int,
        sum(case when completed then 1 else 0 end)::int
    into total_quests, completed_quests
    from public.daily_quests
    where profile_id = update_player_hearts.profile_id 
    and quest_date = update_player_hearts.quest_date;
    
    -- Calculate heart score
    if total_quests = 0 then
        heart_score := 1.0;
    elsif completed_quests = total_quests then
        heart_score := 1.0;
    elsif completed_quests > 0 then
        heart_score := 0.5;
    else
        heart_score := 0.0;
    end if;
    
    -- Update hearts
    update public.player_stats 
    set hearts = heart_score
    where profile_id = update_player_hearts.profile_id;
end;
$$;

-- Create trigger
drop trigger if exists quest_completion_trigger on public.daily_quests;
create trigger quest_completion_trigger
after update on public.daily_quests
for each row execute function public.handle_quest_completion(); 