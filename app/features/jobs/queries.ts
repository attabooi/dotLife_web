import { makeSSRClient } from "~/supa-client";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CreateQuestParams {
  userId: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

interface CompleteQuestParams {
  userId: string;
  questId: string;
}

const DIFFICULTY_REWARDS = {
  easy: { xp: 10, bricks: 1 },
  medium: { xp: 20, bricks: 2 },
  hard: { xp: 35, bricks: 3 }
};

export const getQuests = async (client: SupabaseClient, userId: string) => {
  const { data, error } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserStats = async (client: SupabaseClient, userId: string) => {
  const { data, error } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (error) {
    // If stats don't exist, create them
    if (error.code === "PGRST116") {
      const { data: newStats, error: createError } = await client
        .from("player_stats")
        .insert({
          profile_id: userId,
          level: 1,
          total_xp: 0,
          current_xp: 0,
          consecutive_days: 0,
          total_bricks: 0,
          available_bricks: 20,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newStats;
    }
    throw error;
  }

  return data;
};

export const createQuest = async (
  client: SupabaseClient,
  { userId, title, description, difficulty }: CreateQuestParams
) => {
  const deadline = new Date();
  deadline.setHours(23, 59, 59, 999);

  const { data: quest, error } = await client
    .from("daily_quests")
    .insert({
      profile_id: userId,
      title,
      description,
      difficulty,
      reward_xp: DIFFICULTY_REWARDS[difficulty].xp,
      reward_bricks: DIFFICULTY_REWARDS[difficulty].bricks,
      quest_date: new Date().toISOString().split("T")[0],
      deadline: deadline.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    type: 'create',
    quest
  };
};

export const completeQuest = async (
  client: SupabaseClient,
  { userId, questId }: CompleteQuestParams
) => {
  // Start a transaction
  const { data: quest, error: questError } = await client
    .from("daily_quests")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("quest_id", questId)
    .eq("profile_id", userId)
    .select()
    .single();

  if (questError) throw questError;

  // Update player stats
  const { data: currentStats, error: statsError } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (statsError) throw statsError;

  const newXp = currentStats.current_xp + quest.reward_xp;
  const levelUp = newXp >= currentStats.level * 100;
  const newLevel = levelUp ? currentStats.level + 1 : currentStats.level;
  const finalXp = levelUp ? newXp - (currentStats.level * 100) : newXp;

  const { data: updatedStats, error: updateError } = await client
    .from("player_stats")
    .update({
      level: newLevel,
      current_xp: finalXp,
      total_xp: currentStats.total_xp + quest.reward_xp,
      total_bricks: currentStats.total_bricks + quest.reward_bricks,
      available_bricks: currentStats.available_bricks + quest.reward_bricks,
      last_completed_date: new Date().toISOString(),
    })
    .eq("profile_id", userId)
    .select()
    .single();

  if (updateError) throw updateError;

  return {
    type: 'complete',
    quest,
    stats: updatedStats
  };
};
