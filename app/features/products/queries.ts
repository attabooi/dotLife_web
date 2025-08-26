import { makeSSRClient } from "~/supa-client";
import { eq, and, desc, gte, lte } from "drizzle-orm";  
import { 
  towerBlocks, 
  towerBuildingSessions, 
  towerHistory, 
  towerCalendarEvents,
  towerPremiumFeatures,
  towerStats 
} from "./schema";

interface Quest {
  id: string;
  title: string;
  completed: boolean;
  difficulty: "easy" | "medium" | "hard";
  reward: number;
}

// 1. 사용자의 total_blocks로 타워 로드
export async function loadUserTower(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  // 사용자의 모든 블록들 로드 (확인된 것과 미확인된 것 모두)
  const { data: blocks, error } = await client
    .from("tower_blocks")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // 타워 통계 업데이트
  const { data: stats } = await client
    .from("tower_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  // Convert database blocks to component format
  const formattedBlocks = (blocks || []).map(block => ({
    x: block.x_position,
    y: block.y_position,
    color: block.color,
    date: block.build_date ? new Date(block.build_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    saved: block.is_confirmed
  }));

  // 플레이어 스탯에서 available_bricks 가져오기
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("available_bricks, total_bricks, consecutive_days")
    .eq("profile_id", profileId)
    .single();

  if (statsError) {
    console.error('Error loading player stats:', statsError);
    throw statsError;
  }

  // available_bricks는 퀘스트에서 얻은 사용 가능한 브릭 수
  const availableBricks = playerStats?.available_bricks || 0;
  
  // 사용된 블록 수는 확인된 블록들만 계산 (확인된 블록만 실제로 사용된 것으로 간주)
  const usedBlocks = formattedBlocks.filter(block => block.saved).length;
  const remainingBlocks = Math.max(0, availableBricks - usedBlocks);

  const result = {
    blocks: formattedBlocks,
    stats: stats || null,
    totalBlocks: availableBricks,
    remainingBlocks: remainingBlocks
  };

  return result;
}

// 2. 블록 저장 (임시)
export async function saveBlock(request: Request, profileId: string, blockData: any) {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("tower_blocks")
    .insert({
      profile_id: profileId,
      x_position: blockData.x,
      y_position: blockData.y,
      color: blockData.color,
      build_date: blockData.date,
      is_confirmed: false,
      build_session_id: blockData.sessionId || 'default'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 3. 블록 배치 저장
export async function saveBlocksBatch(request: Request, profileId: string, sessionId: string, blockDataArray: any[]) {
  const { client } = makeSSRClient(request);
  
  const blocksToInsert = blockDataArray.map(blockData => ({
    profile_id: profileId,
    x_position: blockData.x,
    y_position: blockData.y,
    color: blockData.color,
    build_date: blockData.date,
    is_confirmed: false,
    build_session_id: sessionId
  }));

  const { data, error } = await client
    .from("tower_blocks")
    .insert(blocksToInsert)
    .select();

  if (error) throw error;
  return data;
}

// 4. 세션 저장
export async function saveBuildingSession(request: Request, profileId: string, sessionData: any) {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("tower_building_sessions")
    .insert({
      build_session_id: sessionData.sessionId,
      profile_id: profileId,
      session_name: sessionData.name,
      blocks_data: sessionData.blocks,
      is_confirmed: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 5. 블록 확인 (영구 저장)
export async function confirmBlocks(request: Request, profileId: string, sessionId: string) {
  const { client } = makeSSRClient(request);
  
  // 해당 세션의 모든 블록을 확인 상태로 변경
  const { data: blocks, error: updateError } = await client
    .from("tower_blocks")
    .update({ is_confirmed: true })
    .eq("profile_id", profileId)
    .eq("build_session_id", sessionId)
    .eq("is_confirmed", false)
    .select();

  if (updateError) throw updateError;

  if (!blocks || blocks.length === 0) {
    return { message: "No blocks to confirm" };
  }

  // 플레이어 스탯 업데이트
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("available_bricks, total_bricks")
    .eq("profile_id", profileId)
    .single();

  if (statsError) throw statsError;

  const newAvailableBricks = Math.max(0, (playerStats?.available_bricks || 0) - blocks.length);
  const newTotalBricks = (playerStats?.total_bricks || 0) + blocks.length;

  const { error: updateStatsError } = await client
    .from("player_stats")
    .update({
      available_bricks: newAvailableBricks,
      total_bricks: newTotalBricks
    })
    .eq("profile_id", profileId);

  if (updateStatsError) throw updateStatsError;

  // 세션 정보 업데이트 (선택사항)
  try {
    await client
      .from("tower_building_sessions")
      .update({ 
        is_confirmed: true,
        confirmed_at: new Date().toISOString()
      })
      .eq("build_session_id", sessionId);
  } catch (sessionError) {
    // 세션 업데이트 실패는 치명적이지 않음
  }

  return { 
    message: "Blocks confirmed successfully",
    blocksConfirmed: blocks.length,
    newAvailableBricks,
    newTotalBricks
  };
}

// 6. 타워 통계 업데이트
export async function updateTowerStats(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  // 확인된 블록들 가져오기
  const { data: blocks } = await client
    .from("tower_blocks")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_confirmed", true);

  if (!blocks || blocks.length === 0) {
    // No blocks, create empty stats
    const { data: existingStats } = await client
      .from("tower_stats")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (existingStats) {
      await client
        .from("tower_stats")
        .update({
          total_blocks: 0,
          confirmed_blocks: 0,
          tower_height: 0,
          tower_width: 0,
          last_built_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("profile_id", profileId);
    } else {
      await client
        .from("tower_stats")
        .insert({
          profile_id: profileId,
          total_blocks: 0,
          confirmed_blocks: 0,
          tower_height: 0,
          tower_width: 0,
          last_built_at: new Date().toISOString()
        });
    }
    return;
  }

  const totalBlocks = blocks.length;
  const confirmedBlocks = blocks.filter(b => b.is_confirmed).length;
  
  // 타워 높이와 너비 계산
  const maxY = Math.max(...blocks.map(b => b.y_position));
  const minY = Math.min(...blocks.map(b => b.y_position));
  const maxX = Math.max(...blocks.map(b => b.x_position));
  const minX = Math.min(...blocks.map(b => b.x_position));
  
  const towerHeight = maxY - minY + 1;
  const towerWidth = maxX - minX + 1;

  // 통계 업데이트 또는 생성
  const { data: existingStats } = await client
    .from("tower_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (existingStats) {
    await client
      .from("tower_stats")
      .update({
        total_blocks: totalBlocks,
        confirmed_blocks: confirmedBlocks,
        tower_height: towerHeight,
        tower_width: towerWidth,
        last_built_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("profile_id", profileId);
  } else {
    await client
      .from("tower_stats")
      .insert({
        profile_id: profileId,
        total_blocks: totalBlocks,
        confirmed_blocks: confirmedBlocks,
        tower_height: towerHeight,
        tower_width: towerWidth,
        last_built_at: new Date().toISOString()
      });
  }
}

// 7. 타워 리셋
export async function resetTower(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  // 모든 블록 삭제
  const { error: deleteError } = await client
    .from("tower_blocks")
    .delete()
    .eq("profile_id", profileId);

  if (deleteError) throw deleteError;

  // 플레이어 스탯에서 total_blocks를 0으로 리셋하고 available_bricks를 total_bricks로 복원
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("total_bricks")
    .eq("profile_id", profileId)
    .single();

  if (statsError) throw statsError;

  const { error: updateError } = await client
    .from("player_stats")
    .update({ 
      available_bricks: playerStats?.total_bricks || 0,
      total_blocks: 0  // total_blocks를 0으로 리셋
    })
    .eq("profile_id", profileId);

  if (updateError) throw updateError;

  return { message: "Tower reset successfully" };
}

// 8. 캘린더 데이터 로드
export async function loadCalendarData(request: Request, profileId: string, year: number, month: number) {
  const { client } = makeSSRClient(request);
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  // 퀘스트 데이터 가져오기
  const { data: questData, error: questError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", profileId)
    .gte("quest_date", startDate.toISOString().split('T')[0])
    .lte("quest_date", endDate.toISOString().split('T')[0])
    .order("quest_date", { ascending: true });

  if (questError) throw questError;

  // 퀘스트 데이터를 캘린더 이벤트 형식으로 변환
  const calendarEvents = (questData || []).map(quest => ({
    event_id: quest.quest_id,
    profile_id: quest.profile_id,
    event_date: quest.quest_date,
    quest_id: quest.quest_id,
    quest_title: quest.title,
    blocks_added: quest.completed ? (quest.reward_bricks || 3) : 0,
    colors_used: [],
    total_height: 0,
    created_at: quest.created_at,
    all_quests: [quest]
  }));

  return calendarEvents;
}

// 9. 프리미엄 기능 확인
export async function checkPremiumFeatures(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("tower_premium_features")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_active", true);

  if (error) throw error;
  
  return {
    hasUndo: data?.some(f => f.feature_type === 'undo'),
    hasRestore: data?.some(f => f.feature_type === 'restore'),
    hasUnlimitedHistory: data?.some(f => f.feature_type === 'unlimited_history')
  };
}

// 10. 타워 히스토리 로드
export async function loadTowerHistory(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("tower_history")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error loading tower history:', error);
    return [];
  }

  return data || [];
}

// 11. 날짜별 상세 정보 로드
export async function loadDateDetails(request: Request, profileId: string, date: string) {
  const { client } = makeSSRClient(request);
  
  // 해당 날짜의 블록들 가져오기
  const { data: blocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("*")
    .eq("profile_id", profileId)
    .eq("build_date", date)
    .eq("is_confirmed", true);

  if (blocksError) throw blocksError;

  // 해당 날짜의 퀘스트들 가져오기
  const { data: quests, error: questsError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("quest_date", date);

  if (questsError) throw questsError;

  const blocks_added = blocks?.length || 0;
  const formattedQuests = (quests || []).map(quest => ({
    id: quest.quest_id.toString(),
    title: quest.title,
    completed: quest.completed,
    difficulty: quest.difficulty,
    reward: quest.reward_bricks || 3
  }));

  return {
    date,
    blocks_added,
    quests: formattedQuests,
    colors_used: blocks?.map(b => b.color) || []
  };
}

// 12. 전체 랭킹 데이터 가져오기 (total_bricks 기준)
export async function getOverallLeaderboard(request: Request, limit: number = 50) {
  const { client } = makeSSRClient(request);
  
  try {
    const { data: rankings, error } = await client
      .from("player_stats")
      .select(`
        profile_id,
        level,
        total_bricks,
        consecutive_days,
        profiles(name, username, avatar)
      `)
      .order("total_bricks", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 랭킹 추가
    const rankedData = (rankings || []).map((player, index) => ({
      ...player,
      rank: index + 1,
      name: player.profiles?.name || player.profiles?.username || "Anonymous"
    }));

    return rankedData;
  } catch (error) {
    console.error('Error fetching overall rankings:', error);
    return [];
  }
}

// 13. 일일 랭킹 데이터 가져오기
export async function getDailyLeaderboard(request: Request, year: number, month: number, day: number) {
  const { client } = makeSSRClient(request);
  
  const targetDate = new Date(year, month - 1, day);
  const dateString = targetDate.toISOString().split('T')[0];

  // 해당 날짜에 퀘스트를 완료한 사용자들의 랭킹
  const { data: dailyRankings, error: dailyError } = await client
    .from("daily_quests")
    .select(`
      profile_id,
      quest_date,
      status,
      reward_xp,
      reward_bricks,
      profiles!inner(
        profile_id,
        name,
        username,
        avatar
      )
    `)
    .eq("quest_date", dateString)
    .eq("status", "completed")
    .order("reward_xp", { ascending: false });

  if (dailyError) {
    console.error('Error fetching daily rankings:', dailyError);
    throw dailyError;
  }

  // 프로필별로 그룹화하고 통계 계산
  const profileStats = new Map();
  
  dailyRankings?.forEach(quest => {
    const profileId = quest.profile_id;
    const profile = quest.profiles;
    
    if (!profileStats.has(profileId)) {
      profileStats.set(profileId, {
        profile_id: profileId,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        total_xp: 0,
        total_bricks: 0,
        quests_completed: 0
      });
    }
    
    const stats = profileStats.get(profileId);
    stats.total_xp += quest.reward_xp || 0;
    stats.total_bricks += quest.reward_bricks || 0;
    stats.quests_completed += 1;
  });

  // 랭킹 순으로 정렬 (XP 기준)
  const rankings = Array.from(profileStats.values())
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((profile, index) => ({
      ...profile,
      rank: index + 1
    }));

  return rankings;
}

// 14. 주간 랭킹 데이터 가져오기
export async function getWeeklyLeaderboard(request: Request, year: number, week: number) {
  const { client } = makeSSRClient(request);
  
  // 해당 주의 시작일과 종료일 계산
  const startOfWeek = new Date(year, 0, 1 + (week - 1) * 7);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // 해당 주에 퀘스트를 완료한 사용자들의 랭킹
  const { data: weeklyRankings, error: weeklyError } = await client
    .from("daily_quests")
    .select(`
      profile_id,
      quest_date,
      status,
      reward_xp,
      reward_bricks,
      profiles!inner(
        profile_id,
        name,
        username,
        avatar
      )
    `)
    .gte("quest_date", startOfWeek.toISOString().split('T')[0])
    .lte("quest_date", endOfWeek.toISOString().split('T')[0])
    .eq("status", "completed")
    .order("reward_xp", { ascending: false });

  if (weeklyError) {
    console.error('Error fetching weekly rankings:', weeklyError);
    throw weeklyError;
  }

  // 프로필별로 그룹화하고 통계 계산
  const profileStats = new Map();
  
  weeklyRankings?.forEach(quest => {
    const profileId = quest.profile_id;
    const profile = quest.profiles;
    
    if (!profileStats.has(profileId)) {
      profileStats.set(profileId, {
        profile_id: profileId,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        total_xp: 0,
        total_bricks: 0,
        quests_completed: 0
      });
    }
    
    const stats = profileStats.get(profileId);
    stats.total_xp += quest.reward_xp || 0;
    stats.total_bricks += quest.reward_bricks || 0;
    stats.quests_completed += 1;
  });

  // 랭킹 순으로 정렬 (XP 기준)
  const rankings = Array.from(profileStats.values())
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((profile, index) => ({
      ...profile,
      rank: index + 1
    }));

  return rankings;
}

// 15. 월간 랭킹 데이터 가져오기
export async function getMonthlyLeaderboard(request: Request, year: number, month: number) {
  const { client } = makeSSRClient(request);
  
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  // 해당 월에 퀘스트를 완료한 사용자들의 랭킹
  const { data: monthlyRankings, error: monthlyError } = await client
    .from("daily_quests")
    .select(`
      profile_id,
      quest_date,
      status,
      reward_xp,
      reward_bricks,
      profiles!inner(
        profile_id,
        name,
        username,
        avatar
      )
    `)
    .gte("quest_date", startOfMonth.toISOString().split('T')[0])
    .lte("quest_date", endOfMonth.toISOString().split('T')[0])
    .eq("status", "completed")
    .order("reward_xp", { ascending: false });

  if (monthlyError) {
    console.error('Error fetching monthly rankings:', monthlyError);
    throw monthlyError;
  }

  // 프로필별로 그룹화하고 통계 계산
  const profileStats = new Map();
  
  monthlyRankings?.forEach(quest => {
    const profileId = quest.profile_id;
    const profile = quest.profiles;
    
    if (!profileStats.has(profileId)) {
      profileStats.set(profileId, {
        profile_id: profileId,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        total_xp: 0,
        total_bricks: 0,
        quests_completed: 0
      });
    }
    
    const stats = profileStats.get(profileId);
    stats.total_xp += quest.reward_xp || 0;
    stats.total_bricks += quest.reward_bricks || 0;
    stats.quests_completed += 1;
  });

  // 랭킹 순으로 정렬 (XP 기준)
  const rankings = Array.from(profileStats.values())
    .sort((a, b) => b.total_xp - a.total_xp)
    .map((profile, index) => ({
      ...profile,
      rank: index + 1
    }));

  return rankings;
} 