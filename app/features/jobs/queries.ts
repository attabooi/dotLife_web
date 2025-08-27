import { makeSSRClient } from "~/supa-client";











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
    easy: { xp: 10, bricks: 0 },
    medium: { xp: 20, bricks: 0 },
    hard: { xp: 35, bricks: 0 }
  };
  
  // Validate difficulty and provide default if invalid
  if (!questData.difficulty || !difficultyRewards[questData.difficulty]) {
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

// Complete quest
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
  
  // 먼저 오늘의 퀘스트가 있는지 확인
  const { data: quests, error: questsError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", today);
    
  if (questsError) throw questsError;
  
  if (!quests || quests.length === 0) {
    throw new Error("No quests found for today");
  }
  
  // 모든 퀘스트를 confirmed 상태로 업데이트
  const { error } = await client
    .from("daily_quests")
    .update({ confirmed: true })
    .eq("profile_id", user.id)
    .eq("quest_date", today);
    
  if (error) throw error;
  
  return { 
    success: true, 
    message: `Confirmed ${quests.length} quests successfully!`,
    questsConfirmed: quests.length
  };
};

// Check if all quests are completed and award bricks
export const checkAndAwardBricks = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
  // Get today's quests
  const { data: quests, error: questsError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", today);
    
  if (questsError) throw questsError;
  
  if (!quests || quests.length === 0) {
    return { success: false, message: "No quests found for today" };
  }
  
  // Check if all quests are completed
  const allCompleted = quests.every(quest => quest.completed);
  
  if (!allCompleted) {
    return { success: false, message: "Not all quests are completed yet" };
  }
  
  // Check if bricks were already awarded today
  const { data: stats, error: statsError } = await client
    .from("player_stats")
    .select("consecutive_days, available_bricks, total_bricks, last_bricks_awarded_date")
    .eq("profile_id", user.id)
    .maybeSingle();
    
  if (statsError) throw statsError;
  
  // Check if bricks were already awarded today
  if (stats.last_bricks_awarded_date === today) {
    return { success: false, message: "Bricks already awarded today" };
  }
  
  let bricksToAward = 3; // Base bricks
  
  // Add bonus based on consecutive days
  if (stats.consecutive_days >= 30) {
    bricksToAward = 6;
  } else if (stats.consecutive_days >= 20) {
    bricksToAward = 5;
  } else if (stats.consecutive_days >= 10) {
    bricksToAward = 4;
  }
  
  // Award bricks
  const { error: bricksError } = await client
    .from("player_stats")
    .update({ 
      available_bricks: stats.available_bricks + bricksToAward,
      total_bricks: stats.total_bricks + bricksToAward,
      last_bricks_awarded_date: today
    })
    .eq("profile_id", user.id);
    
  if (bricksError) throw bricksError;
  
  return { 
    success: true, 
    bricksAwarded: bricksToAward,
    consecutiveDays: stats.consecutive_days,
    message: `Awarded ${bricksToAward} bricks for completing all quests!`
  };
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

// Get quest history (last 7 days)
export const getQuestHistory = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Get last 7 days of quest history
  const { data: history, error } = await client
    .from("quest_history_view")
    .select("*")
    .eq("profile_id", user.id)
    .order("quest_date", { ascending: false })
    .limit(7);
    
  if (error) throw error;
  return history || [];
};