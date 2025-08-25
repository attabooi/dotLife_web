import { makeSSRClient } from "~/supa-client";

// Get quest history (past records)
export const getQuestHistory = async (request: Request, limit: number = 30) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await (client as any)
    .from("quest_history_view")
    .select("*")
    .eq("profile_id", user.id)
    .order("quest_date", { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};

// Get today's quests with calculated stats
export const getQuests = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Use current date in local timezone
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
  const { data, error } = await client
    .from("quest_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", today);
    
  if (error) throw error;
  return data;
};

// Test function to simulate different dates (for development only)
export const getQuestsForDate = async (request: Request, targetDate: string) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await client
    .from("quest_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", targetDate);
    
  if (error) throw error;
  return data;
};

// Test function to get summary for specific date
export const getQuestSummaryForDate = async (request: Request, targetDate: string) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await client
    .from("quest_daily_summary_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", targetDate)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

// Test function to get history for specific date range
export const getQuestHistoryForDateRange = async (request: Request, startDate: string, endDate: string) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await (client as any)
    .from("quest_history_view")
    .select("*")
    .eq("profile_id", user.id)
    .gte("quest_date", startDate)
    .lte("quest_date", endDate)
    .order("quest_date", { ascending: false });
    
  if (error) throw error;
  return data;
};

// Get player stats
export const getPlayerStats = async (request: Request, userId: string) => {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", userId)
    .single();
    
  if (error) throw error;
  return data;
};

// Get today's summary
export const getTodayQuestSummary = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Use current date in local timezone
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
  const { data, error } = await client
    .from("quest_daily_summary_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", today)
    .single();
    
  if (error) throw error;
  return data;
};

// Create new quest (triggers will handle stats)
export const createQuest = async (request: Request, questData: {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const difficultyRewards = {
    easy: { xp: 10, bricks: 1 },    // 쉬운 퀘스트 = 1 브릭
    medium: { xp: 20, bricks: 2 },  // 보통 퀘스트 = 2 브릭
    hard: { xp: 35, bricks: 3 }     // 어려운 퀘스트 = 3 브릭
  };
  
  // Validate difficulty and provide default if invalid
  if (!questData.difficulty || !difficultyRewards[questData.difficulty]) {
    console.error('Invalid difficulty:', questData.difficulty);
    questData.difficulty = 'medium'; // Default to medium
  }
  
  const reward = difficultyRewards[questData.difficulty];
  
  if (!reward) {
    throw new Error(`Invalid difficulty level: ${questData.difficulty}`);
  }
  
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
  const deadline = new Date();
  deadline.setHours(23, 59, 59, 999);
  
  const { data, error } = await client
    .from("daily_quests")
    .insert({
      profile_id: user.id,
      title: questData.title,
      description: questData.description,
      difficulty: questData.difficulty,
      reward_xp: reward.xp,
      reward_bricks: reward.bricks,
      quest_date: today,
      deadline: deadline.toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Complete quest (triggers will handle all stats updates)
export const completeQuest = async (request: Request, questId: number) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await client
    .from("daily_quests")
    .update({ 
      completed: true, 
      completed_at: new Date().toISOString() 
    })
    .eq("quest_id", questId)
    .eq("profile_id", user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Confirm today's quests
export const confirmQuests = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
  const { error } = await client
    .from("daily_quests")
    .update({ confirmed: true })
    .eq("profile_id", user.id)
    .eq("quest_date", today);
    
  if (error) throw error;
  return { success: true };
};

// Delete quest
export const deleteQuest = async (request: Request, questId: number) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { error } = await client
    .from("daily_quests")
    .delete()
    .eq("quest_id", questId)
    .eq("profile_id", user.id);
    
  if (error) throw error;
  return { success: true };
};

// Update quest
export const updateQuest = async (request: Request, questId: number, updates: {
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const { data, error } = await client
    .from("daily_quests")
    .update(updates)
    .eq("quest_id", questId)
    .eq("profile_id", user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};