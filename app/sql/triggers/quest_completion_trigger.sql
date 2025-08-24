create or replace function public.handle_quest_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_today date;
    v_consec_days int;
    v_last_date date;
    v_current_xp int;
    v_total_xp int;
    v_level int;
    v_xp_to_next int;
    v_bricks int;
begin
    if new.completed = true and (old.completed = false or old.completed is null) then
        v_today := current_date;

        -- 현재 스탯 조회
        select current_xp, total_xp, level, xp_to_next_level, consecutive_days, last_completed_date
        into v_current_xp, v_total_xp, v_level, v_xp_to_next, v_consec_days, v_last_date
        from public.player_stats
        where profile_id = new.profile_id;

        -- XP 처리
        v_current_xp := v_current_xp + new.reward_xp;
        v_total_xp   := v_total_xp + new.reward_xp;
        v_xp_to_next := v_level * 100;

        while v_current_xp >= v_xp_to_next loop
            v_current_xp := v_current_xp - v_xp_to_next;
            v_level := v_level + 1;
            v_xp_to_next := v_level * 100;
        end loop;

        -- 연속일 처리
        if v_last_date is null then
            v_consec_days := 1;
        elsif v_last_date = v_today - interval '1 day' then
            v_consec_days := v_consec_days + 1;
        else
            v_consec_days := 1;
        end if;

        -- 오늘 보상 (연속일수 로직 적용)
        if v_consec_days >= 30 then
            v_bricks := 6;
        elsif v_consec_days >= 20 then
            v_bricks := 5;
        elsif v_consec_days >= 10 then
            v_bricks := 4;
        else
            v_bricks := 3;
        end if;

        -- total_bricks는 건드리지 않고 available_bricks만 지급
        update public.player_stats
        set
            current_xp = v_current_xp,
            total_xp   = v_total_xp,
            level = v_level,
            xp_to_next_level = v_xp_to_next,
            consecutive_days = v_consec_days,
            available_bricks = available_bricks + v_bricks,
            last_completed_date = v_today
        where profile_id = new.profile_id;
    end if;
    return new;
end;
$$;
