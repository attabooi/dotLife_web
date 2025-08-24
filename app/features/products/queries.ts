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

// 1. 사용자의 total_blocks로 타워 로드 - 수정된 부분
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

// 2. 블록 저장 (임시) - 수정된 부분
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
      session_id: blockData.sessionId || 'default'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 3. 블록 배치 저장 - 수정된 부분
export async function saveBlocksBatch(request: Request, profileId: string, sessionId: string, blockDataArray: any[]) {
  const { client } = makeSSRClient(request);
  
  const blocksToInsert = blockDataArray.map(blockData => ({
    profile_id: profileId,
    x_position: blockData.x,
    y_position: blockData.y,
    color: blockData.color,
    build_date: blockData.date,
    is_confirmed: false,
    session_id: sessionId
  }));

  const { data, error } = await client
    .from("tower_blocks")
    .insert(blocksToInsert)
    .select();

  if (error) throw error;
  return data;
}

// 3. 세션 저장
export async function saveBuildingSession(request: Request, profileId: string, sessionData: any) {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("tower_building_sessions")
    .insert({
      session_id: sessionData.sessionId,
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

// 4. 블록 확인 (영구 저장) - 수정된 부분
export async function confirmBlocks(request: Request, profileId: string, sessionId: string) {
  const { client } = makeSSRClient(request);
  
  // 해당 세션의 모든 블록을 확인 상태로 변경
  const { data: blocks, error: updateError } = await client
    .from("tower_blocks")
    .update({ is_confirmed: true })
    .eq("profile_id", profileId)
    .eq("session_id", sessionId)
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
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq("session_id", sessionId);
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

// 5. 타워 통계 업데이트 - 수정된 부분
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

// 5. 타워 리셋 - 수정된 부분
export async function resetTower(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  // 모든 블록 삭제
  const { error: deleteError } = await client
    .from("tower_blocks")
    .delete()
    .eq("profile_id", profileId);

  if (deleteError) throw deleteError;

  // 플레이어 스탯에서 available_bricks를 total_bricks로 복원
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("total_bricks")
    .eq("profile_id", profileId)
    .single();

  if (statsError) throw statsError;

  const { error: updateError } = await client
    .from("player_stats")
    .update({ available_bricks: playerStats?.total_bricks || 0 })
    .eq("profile_id", profileId);

  if (updateError) throw updateError;

  return { message: "Tower reset successfully" };
}

// 7. 캘린더 데이터 로드 - 수정된 부분
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

// 8. 프리미엄 기능 확인
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

// 9. 타워 히스토리 로드
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

// 11. 날짜별 상세 정보 로드 - 수정된 부분
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

// 12. 사용자 플레이어 스탯 디버깅 - 새로 추가
export async function debugPlayerStats(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('Debugging player stats for profile:', profileId); // 디버깅용

  // 플레이어 스탯 가져오기
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (statsError) {
    console.error('Error loading player stats:', statsError);
    throw statsError;
  }

  // 오늘 완료된 퀘스트 가져오기
  const today = new Date().toISOString().split('T')[0];
  const { data: todayQuests, error: questsError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("quest_date", today);

  if (questsError) {
    console.error('Error loading today quests:', questsError);
  }

  // 확인된 타워 블록 수 가져오기
  const { data: confirmedBlocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("block_id")
    .eq("profile_id", profileId)
    .eq("is_confirmed", true);

  if (blocksError) {
    console.error('Error loading confirmed blocks:', blocksError);
  }

  const debugInfo = {
    playerStats,
    todayQuests: todayQuests || [],
    confirmedBlocksCount: confirmedBlocks?.length || 0,
    today: today,
    calculatedAvailableBricks: (playerStats?.available_bricks || 0) - (confirmedBlocks?.length || 0)
  };

  console.log('Debug info:', debugInfo); // 디버깅용
  return debugInfo;
} 

// 13. 브릭 동기화 강제 업데이트 - 수정된 부분
export async function forceUpdateAvailableBricks(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('Force updating available bricks for profile:', profileId); // 디버깅용

  // 현재 플레이어 스탯 가져오기
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (statsError) {
    console.error('Error loading player stats:', statsError);
    throw statsError;
  }

  // 모든 완료된 퀘스트에서 얻은 브릭 수 계산 (연속된 날짜 시스템)
  const { data: completedQuests, error: questsError } = await client
    .from("daily_quests")
    .select("quest_date")
    .eq("profile_id", profileId)
    .eq("completed", true);

  if (questsError) {
    console.error('Error loading completed quests:', questsError);
  }

  // 완료된 날짜들을 중복 제거하여 고유한 날짜 수 계산
  const uniqueCompletedDates = [...new Set(completedQuests?.map(q => q.quest_date) || [])];
  const earnedBricks = uniqueCompletedDates.length * 3; // 각 완료된 날짜당 3브릭

  console.log('Completed quests:', completedQuests); // 디버깅용
  console.log('Unique completed dates:', uniqueCompletedDates); // 디버깅용
  console.log('Earned bricks calculation:', `${uniqueCompletedDates.length} dates × 3 = ${earnedBricks}`); // 디버깅용

  // 확인된 타워 블록 수 가져오기
  const { data: confirmedBlocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("block_id")
    .eq("profile_id", profileId)
    .eq("is_confirmed", true);

  if (blocksError) {
    console.error('Error loading confirmed blocks:', blocksError);
  }

  // 계산
  const usedBricks = confirmedBlocks?.length || 0;
  const newAvailableBricks = Math.max(0, earnedBricks - usedBricks);

  console.log(`Total earned bricks: ${earnedBricks}, Used bricks: ${usedBricks}, New available: ${newAvailableBricks}`); // 디버깅용

  // available_bricks 업데이트
  const { error: updateError } = await client
    .from("player_stats")
    .update({ 
      available_bricks: newAvailableBricks,
      updated_at: new Date().toISOString()
    })
    .eq("profile_id", profileId);

  if (updateError) {
    console.error('Error updating available bricks:', updateError);
    throw updateError;
  }

  console.log(`Updated available_bricks from ${playerStats?.available_bricks} to ${newAvailableBricks}`); // 디버깅용

  // 업데이트 후 실제 값 확인
  const { data: updatedStats, error: checkError } = await client
    .from("player_stats")
    .select("available_bricks, total_bricks")
    .eq("profile_id", profileId)
    .single();

  if (checkError) {
    console.error('Error checking updated stats:', checkError);
  } else {
    console.log('After update - available_bricks:', updatedStats?.available_bricks, 'total_bricks:', updatedStats?.total_bricks); // 디버깅용
  }

  return { 
    oldAvailableBricks: playerStats?.available_bricks || 0,
    newAvailableBricks,
    earnedBricks,
    usedBricks
  };
} 

// 14. 특정 날짜 퀘스트 데이터 확인 - 새로 추가
export async function checkSpecificDateQuests(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('Checking specific date quests for profile:', profileId); // 디버깅용

  // 20일과 23일의 퀘스트 데이터 가져오기
  const { data: day20Quests, error: day20Error } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("quest_date", "2025-08-20");

  const { data: day23Quests, error: day23Error } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("quest_date", "2025-08-23");

  if (day20Error) {
    console.error('Error loading day 20 quests:', day20Error);
  }

  if (day23Error) {
    console.error('Error loading day 23 quests:', day23Error);
  }

  console.log('Day 20 quests:', day20Quests); // 디버깅용
  console.log('Day 23 quests:', day23Quests); // 디버깅용

  return {
    day20Quests: day20Quests || [],
    day23Quests: day23Quests || []
  };
}

// 16. 트리거 작동 확인 - 새로 추가
export async function checkTriggerStatus(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('=== TRIGGER STATUS CHECK ==='); // 디버깅용

  // 1. 현재 player_stats 상태
  const { data: currentStats, error: statsError } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (statsError) {
    console.error('Error loading current stats:', statsError);
    return;
  }

  console.log('Current player_stats:', currentStats); // 디버깅용

  // 2. 완료된 퀘스트들 확인
  const { data: completedQuests, error: questsError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("completed", true)
    .order("completed_at", { ascending: true });

  if (questsError) {
    console.error('Error loading completed quests:', questsError);
    return;
  }

  console.log('Completed quests:', completedQuests); // 디버깅용

  // 3. 트리거가 제대로 작동했는지 확인
  // total_bricks는 트리거에서 업데이트되어야 함
  const expectedTotalBricks = completedQuests.length * 3; // 각 완료된 날짜당 3브릭
  const actualTotalBricks = currentStats.total_bricks || 0;

  console.log(`Expected total_bricks: ${expectedTotalBricks} (${completedQuests.length} completed dates × 3)`); // 디버깅용
  console.log(`Actual total_bricks: ${actualTotalBricks}`); // 디버깅용
  console.log(`Trigger working: ${actualTotalBricks >= expectedTotalBricks ? 'YES' : 'NO'}`); // 디버깅용

  // 4. available_bricks 계산
  const { data: confirmedBlocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("block_id")
    .eq("profile_id", profileId)
    .eq("is_confirmed", true);

  if (blocksError) {
    console.error('Error loading confirmed blocks:', blocksError);
    return;
  }

  const usedBricks = confirmedBlocks?.length || 0;
  const expectedAvailableBricks = Math.max(0, actualTotalBricks - usedBricks);
  const actualAvailableBricks = currentStats.available_bricks || 0;

  console.log(`Used bricks: ${usedBricks}`); // 디버깅용
  console.log(`Expected available_bricks: ${expectedAvailableBricks}`); // 디버깅용
  console.log(`Actual available_bricks: ${actualAvailableBricks}`); // 디버깅용
  console.log(`Available bricks correct: ${actualAvailableBricks === expectedAvailableBricks ? 'YES' : 'NO'}`); // 디버깅용

  console.log('=== END TRIGGER STATUS CHECK ==='); // 디버깅용

  return {
    currentStats,
    completedQuests,
    expectedTotalBricks,
    actualTotalBricks,
    usedBricks,
    expectedAvailableBricks,
    actualAvailableBricks,
    triggerWorking: actualTotalBricks >= expectedTotalBricks,
    availableBricksCorrect: actualAvailableBricks === expectedAvailableBricks
  };
}

// 17. total_bricks 수동 수정 - 새로 추가
export async function fixTotalBricks(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('=== FIXING TOTAL BRICKS ==='); // 디버깅용

  // 완료된 퀘스트에서 고유한 날짜 수 계산
  const { data: completedQuests, error: questsError } = await client
    .from("daily_quests")
    .select("quest_date")
    .eq("profile_id", profileId)
    .eq("completed", true);

  if (questsError) {
    console.error('Error loading completed quests:', questsError);
    return;
  }

  // 고유한 완료된 날짜 수 계산
  const uniqueCompletedDates = [...new Set(completedQuests?.map(q => q.quest_date) || [])];
  
  // 하루에 3브릭으로 계산
  const totalBricksEarned = uniqueCompletedDates.length * 3;

  console.log('Unique completed dates:', uniqueCompletedDates); // 디버깅용
  console.log(`Correct total_bricks: ${totalBricksEarned} (${uniqueCompletedDates.length} days × 3 bricks)`); // 디버깅용

  // 현재 player_stats 가져오기
  const { data: currentStats, error: statsError } = await client
    .from("player_stats")
    .select("total_bricks, available_bricks")
    .eq("profile_id", profileId)
    .single();

  if (statsError) {
    console.error('Error loading current stats:', statsError);
    return;
  }

  console.log(`Current total_bricks: ${currentStats?.total_bricks}`); // 디버깅용

  // total_bricks 수정
  const { error: updateError } = await client
    .from("player_stats")
    .update({
      total_bricks: totalBricksEarned,
      updated_at: new Date().toISOString()
    })
    .eq("profile_id", profileId);

  if (updateError) {
    console.error('Error updating total_bricks:', updateError);
    return;
  }

  console.log(`Updated total_bricks from ${currentStats?.total_bricks} to ${totalBricksEarned}`); // 디버깅용

  // available_bricks도 함께 수정
  const { data: confirmedBlocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("block_id")
    .eq("profile_id", profileId)
    .eq("is_confirmed", true);

  if (blocksError) {
    console.error('Error loading confirmed blocks:', blocksError);
    return;
  }

  const usedBricks = confirmedBlocks?.length || 0;
  const correctAvailableBricks = Math.max(0, totalBricksEarned - usedBricks);

  const { error: availableUpdateError } = await client
    .from("player_stats")
    .update({
      available_bricks: correctAvailableBricks,
      updated_at: new Date().toISOString()
    })
    .eq("profile_id", profileId);

  if (availableUpdateError) {
    console.error('Error updating available_bricks:', availableUpdateError);
    return;
  }

  console.log(`Updated available_bricks to ${correctAvailableBricks}`); // 디버깅용
  console.log('=== END FIXING TOTAL BRICKS ==='); // 디버깅용

  return {
    oldTotalBricks: currentStats?.total_bricks || 0,
    newTotalBricks: totalBricksEarned,
    oldAvailableBricks: currentStats?.available_bricks || 0,
    newAvailableBricks: correctAvailableBricks,
    usedBricks,
    uniqueCompletedDates
  };
}

// 18. player_stats 레코드 확인 및 생성 - 새로 추가
export async function ensurePlayerStats(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('=== ENSURING PLAYER STATS ==='); // 디버깅용

  // 현재 player_stats 확인
  const { data: existingStats, error: checkError } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (checkError && checkError.code === 'PGRST116') {
    // 레코드가 없음 - 생성
    console.log('Player stats not found, creating new record...'); // 디버깅용
    
    const { data: newStats, error: createError } = await client
      .from("player_stats")
      .insert({
        profile_id: profileId,
        level: 1,
        total_xp: 0,
        current_xp: 0,
        xp_to_next_level: 100,
        consecutive_days: 0,
        total_bricks: 0,
        available_bricks: 0,
        last_completed_date: null,
        hearts: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating player stats:', createError);
      return { error: createError };
    }

    console.log('Created new player stats:', newStats); // 디버깅용
    return { created: true, stats: newStats };
  } else if (checkError) {
    console.error('Error checking player stats:', checkError);
    return { error: checkError };
  }

  console.log('Player stats already exists:', existingStats); // 디버깅용
  return { created: false, stats: existingStats };
}

// 15. 기존 퀘스트 reward_bricks 업데이트 - 수정된 부분
export async function updateExistingQuestRewards(request: Request, profileId: string) {
  const { client } = makeSSRClient(request);
  
  console.log('Updating existing quest rewards for profile:', profileId); // 디버깅용

  // 먼저 reward_bricks가 0인 퀘스트들을 가져오기
  const { data: questsToUpdate, error: fetchError } = await client
    .from("daily_quests")
    .select("quest_id, difficulty")
    .eq("profile_id", profileId)
    .eq("reward_bricks", 0);

  if (fetchError) {
    console.error('Error fetching quests to update:', fetchError);
    throw fetchError;
  }

  console.log('Quests to update:', questsToUpdate); // 디버깅용

  // 각 퀘스트를 개별적으로 업데이트
  for (const quest of questsToUpdate || []) {
    let newRewardBricks = 0;
    
    switch (quest.difficulty) {
      case 'easy':
        newRewardBricks = 1;
        break;
      case 'medium':
        newRewardBricks = 2;
        break;
      case 'hard':
        newRewardBricks = 3;
        break;
      default:
        newRewardBricks = 0;
    }

    const { error: updateError } = await client
      .from("daily_quests")
      .update({ reward_bricks: newRewardBricks })
      .eq("quest_id", quest.quest_id);

    if (updateError) {
      console.error(`Error updating quest ${quest.quest_id}:`, updateError);
    } else {
      console.log(`Updated quest ${quest.quest_id} to ${newRewardBricks} bricks`); // 디버깅용
    }
  }

  console.log('Updated existing quest rewards'); // 디버깅용

  // 업데이트 후 player_stats도 다시 계산
  return await forceUpdateAvailableBricks(request, profileId);
} 

// 16. 일일 랭킹 데이터 가져오기 - 새로운 함수
export async function getDailyLeaderboard(request: Request, year: number, month: number, day: number) {
  const { client } = makeSSRClient(request);
  
  const targetDate = new Date(year, month - 1, day);
  const dateString = targetDate.toISOString().split('T')[0];
  
  console.log('Fetching daily leaderboard for date:', dateString); // 디버깅용

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

  console.log('Daily rankings:', rankings); // 디버깅용
  return rankings;
}

// 17. 전체 랭킹 데이터 가져오기 (total_bricks 기준) - 새로운 함수
export async function getOverallLeaderboard(request: Request, limit: number = 50) {
  const { client } = makeSSRClient(request);
  
  try {
    const { data: rankings, error } = await client
      .from("leaderboard_view")
      .select(`
        profile_id,
        level,
        total_bricks,
        consecutive_days,
        profiles!inner(name, username, avatar)
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

// 18. 주간 랭킹 데이터 가져오기 - 새로운 함수
export async function getWeeklyLeaderboard(request: Request, year: number, week: number) {
  const { client } = makeSSRClient(request);
  
  // 해당 주의 시작일과 종료일 계산
  const startOfWeek = new Date(year, 0, 1 + (week - 1) * 7);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  console.log('Fetching weekly leaderboard for week:', week, 'year:', year); // 디버깅용

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

  console.log('Weekly rankings:', rankings); // 디버깅용
  return rankings;
}

// 19. 월간 랭킹 데이터 가져오기 - 새로운 함수
export async function getMonthlyLeaderboard(request: Request, year: number, month: number) {
  const { client } = makeSSRClient(request);
  
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);
  
  console.log('Fetching monthly leaderboard for:', year, month); // 디버깅용

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

  console.log('Monthly rankings:', rankings); // 디버깅용
  return rankings;
} 