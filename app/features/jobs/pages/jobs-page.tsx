import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { HeroSection } from "~/common/components/hero-section";
import { useState, useEffect } from "react";
import { getQuests } from "../queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/common/components/ui/dialog";
import { X } from "lucide-react";
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Sword, 
  Shield, 
  Castle, 
  Info,
  Trophy,
  Flame,
  Heart,
  Crown,
  Edit,
  Square,
  Zap,
  Target,
  Star
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  deadline: Date; // 오늘 밤 12시
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number; // XP
}

interface PlayerStats {
  level: number;
  xp: number;
  consecutiveDays: number;
  totalBricks: number;
  lastCompletedDate: string | null;
}

export const meta = () => {
  return [
    { title: "Daily Quests | dotLife" },
    {
      name: "description",
      content: "Complete quests to build your tower and level up!",
    },
  ];
};

export const loader = async () => {
  const rows = await getQuests();
  return { quests: rows };
};

export default function QuestPage(props: any) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerName] = useState("Hero");
  const [editingQuest, setEditingQuest] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // 플레이어 스탯
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    xp: 0,
    consecutiveDays: 0,
    totalBricks: 0,
    lastCompletedDate: null
  });

  // 서버에서 받은 초기 데이터 매핑
  useEffect(() => {
    const data = (props?.loaderData as any)?.quests as any[] | undefined;
    if (!data) return;
    const mapped: Quest[] = data.map((r: any) => ({
      id: String(r.quest_id ?? r.id ?? ""),
      title: r.title ?? "",
      description: r.description ?? "",
      completed: !!r.completed,
      createdAt: new Date(r.quest_date ?? Date.now()),
      deadline: r.deadline ? new Date(r.deadline) : getTodayDeadline(),
      difficulty: (r.difficulty ?? "medium") as 'easy' | 'medium' | 'hard',
      reward: Number(r.reward_xp ?? r.reward ?? 0),
    }));
    setQuests(mapped);

    // Player snapshot (if present)
    if (data.length > 0) {
      const r0 = data[0];
      setPlayerStats(prev => ({
        level: Number(r0.level ?? prev.level),
        xp: Number(r0.current_xp ?? prev.xp),
        consecutiveDays: Number(r0.consecutive_days ?? prev.consecutiveDays),
        totalBricks: Number(r0.total_bricks ?? prev.totalBricks),
        lastCompletedDate: r0.last_completed_date ?? prev.lastCompletedDate,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.loaderData]);

  // 오늘 밤 12시 계산
  const getTodayDeadline = () => {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setHours(23, 59, 59, 999); // 오늘 밤 11:59:59
    return deadline;
  };

  // 난이도별 설정
  const difficultySettings = {
    easy: { reward: 10, color: 'bg-green-500' },
    medium: { reward: 20, color: 'bg-yellow-500' },
    hard: { reward: 35, color: 'bg-red-500' }
  };

  // 오늘 획득 가능한 브릭 계산
  const calculateTodayBricks = (consecutiveDays: number) => {
    if (consecutiveDays >= 30) return 4;
    if (consecutiveDays >= 5) return 3;
    if (consecutiveDays >= 2) return 2;
    return 1;
  };

  // 남은 시간 계산
  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // 하트(Health) 상태를 자정 이후에만 평가
  const [hearts, setHearts] = useState(1);

  // 자정 체크 및 하트 감소 로직
  useEffect(() => {
    if (!isConfirmed) {
      setHearts(1);
      return;
    }
    // 자정까지 남은 시간 계산
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const msToMidnight = midnight.getTime() - now.getTime();

    // 자정에 평가하는 함수
    const evaluateHearts = () => {
      const todayQuests = quests.filter(quest => {
        const questDate = new Date(quest.createdAt);
        return questDate.toDateString() === now.toDateString();
      });
      if (todayQuests.length === 0) {
        setHearts(1);
        return;
      }
      const completedQuests = todayQuests.filter(q => q.completed);
      const completionRate = completedQuests.length / todayQuests.length;
      if (completionRate === 1) setHearts(1);
      else if (completionRate === 0) setHearts(0);
      else setHearts(0.5);
    };

    // 자정 타이머 설정
    const timer = setTimeout(evaluateHearts, msToMidnight + 1000); // 1초 여유
    // 컴포넌트 언마운트 시 타이머 해제
    return () => clearTimeout(timer);
  }, [isConfirmed, quests]);

  // 연속 완료일 업데이트
  const updateConsecutiveDays = () => {
    const today = new Date().toDateString();
    
    if (playerStats.lastCompletedDate === today) return; // 이미 오늘 완료했으면 무시
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (playerStats.lastCompletedDate === yesterdayString) {
      // 연속 완료
      setPlayerStats(prev => ({
        ...prev,
        consecutiveDays: prev.consecutiveDays + 1,
        lastCompletedDate: today,
        totalBricks: prev.totalBricks + calculateTodayBricks(prev.consecutiveDays + 1)
      }));
    } else {
      // 연속 끊김
      setPlayerStats(prev => ({
        ...prev,
        consecutiveDays: 1,
        lastCompletedDate: today,
        totalBricks: prev.totalBricks + 1
      }));
    }
  };

  // 실패한 퀘스트 처리
  useEffect(() => {
    const failedQuests = quests.filter(quest => {
      const timeRemaining = getTimeRemaining(quest.deadline);
      return !quest.completed && timeRemaining.hours === 0 && timeRemaining.minutes === 0;
    });

    if (failedQuests.length > 0) {
      // 실패한 퀘스트 제거
      setQuests(prev => prev.filter(quest => quest.completed || 
        (getTimeRemaining(quest.deadline).hours > 0 || getTimeRemaining(quest.deadline).minutes > 0)
      ));
    }
  }, [quests]);

  const addQuest = () => {
    if (newQuestTitle.trim() && newQuestDescription.trim()) {
      const settings = difficultySettings[selectedDifficulty];
      const quest: Quest = {
        id: Date.now().toString(),
        title: newQuestTitle.trim(),
        description: newQuestDescription.trim(),
        completed: false,
        createdAt: new Date(),
        deadline: getTodayDeadline(),
        difficulty: selectedDifficulty,
        reward: settings.reward,
      };
      setQuests([...quests, quest]);
      setNewQuestTitle("");
      setNewQuestDescription("");
    }
  };

  // 삭제 기능
  const deleteQuest = (id: string) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  // 완료 체크 (confirm 이후에만 가능)
  const completeQuest = (id: string) => {
    if (!isConfirmed) return;
    const quest = quests.find(q => q.id === id);
    if (quest && !quest.completed) {
      setQuests(quests.map(q => 
        q.id === id ? { ...q, completed: true } : q
      ));
      setPlayerStats(prev => {
        const newXP = prev.xp + quest.reward;
        if (newXP >= prev.level * 100) {
          return {
            ...prev,
            level: prev.level + 1,
            xp: newXP - (prev.level * 100)
          };
        }
        return { ...prev, xp: newXP };
      });
      // 모든 퀘스트 완료 체크
      const todayQuests = quests.filter(q => {
        const questDate = new Date(q.createdAt);
        const today = new Date();
        return questDate.toDateString() === today.toDateString();
      });
      const allCompleted = todayQuests.every(q => q.id === id ? true : q.completed);
      if (allCompleted) {
        updateConsecutiveDays();
      }
    }
  };

  const startEditQuest = (quest: Quest) => {
    setEditingQuest(quest.id);
    setEditTitle(quest.title);
    setEditDescription(quest.description);
  };

  const saveEditQuest = () => {
    if (editingQuest && editTitle.trim() && editDescription.trim()) {
      setQuests(quests.map(q => 
        q.id === editingQuest 
          ? { ...q, title: editTitle.trim(), description: editDescription.trim() }
          : q
      ));
      setEditingQuest(null);
      setEditTitle("");
      setEditDescription("");
    }
  };

  const cancelEditQuest = () => {
    setEditingQuest(null);
    setEditTitle("");
    setEditDescription("");
  };

  const activeQuests = quests.filter(quest => !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);
  const todayBricks = calculateTodayBricks(playerStats.consecutiveDays);
  
  // 오늘 퀘스트 진행률 계산
  const todayQuests = quests.filter(quest => {
    const questDate = new Date(quest.createdAt);
    const today = new Date();
    return questDate.toDateString() === today.toDateString();
  });
  const todayCompletedQuests = todayQuests.filter(quest => quest.completed);
  const questProgress = todayQuests.length > 0 ? `${todayCompletedQuests.length}/${todayQuests.length}` : "0/0";
  const allQuestsCompleted = isConfirmed && todayQuests.length > 0 && todayCompletedQuests.length === todayQuests.length;

  // 하트(Health) 반쪽 표시 개선
  function HeartHalf() {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 17.5C10 17.5 3 12.5 3 8.5C3 6 5 4 7.5 4C8.88 4 10 5.12 10 6.5V17.5Z" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5"/>
        <path d="M10 17.5C10 17.5 17 12.5 17 8.5C17 6 15 4 12.5 4C11.12 4 10 5.12 10 6.5" stroke="#ef4444" strokeWidth="1.5"/>
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
      <HeroSection
          title="Daily Quests"
          description="Complete quests to build your tower and level up!"
        />

        <div className="space-y-8">
          {/* Player Profile & Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg">
                    {playerName.charAt(0)}
                  </div>
                  {playerStats.level >= 10 && (
                    <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">{playerName}</h2>
                    <div className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded">
                      Level {playerStats.level}
                    </div>
                  </div>
                  
                  {/* XP Bar */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Experience
                      </span>
                      <span className="text-yellow-600 font-bold">{playerStats.xp}/{playerStats.level * 100}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(playerStats.xp / (playerStats.level * 100)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Health */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600 font-medium">Health</span>
                    <div className="flex items-center gap-1">
                      {hearts === 1 ? (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500 transition-all duration-300" />
                      ) : hearts === 0.5 ? (
                        <HeartHalf />
                      ) : (
                        <Heart className="w-5 h-5 text-gray-400 transition-all duration-300" />
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded">
                      {playerStats.consecutiveDays} days
                    </div>
                    
                    <div className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                      {playerStats.totalBricks} bricks
                    </div>
                  </div>
                </div>

                {/* Quest Stats */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 transition-all duration-300">{activeQuests.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Active Quests</div>
                  <div className="text-sm text-green-600 font-bold mt-1 transition-all duration-300">
                    {completedQuests.length} completed
                  </div>
                  
                  {/* Quest Progress Sticker */}
                  {todayQuests.length > 0 && (
                    <div className="text-xs text-orange-600 font-bold mt-2 bg-orange-100 px-2 py-1 rounded">
                      {questProgress} completed
                    </div>
                  )}
                  
                  {/* Bricks Earned Sticker */}
                  {activeQuests.length === 0 && completedQuests.length > 0 && (
                    <div className="text-xs text-orange-600 font-bold mt-2 bg-orange-100 px-2 py-1 rounded">
                      +{todayBricks} bricks earned
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm your quests for today?</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-gray-600 mb-4">
                After confirming, you cannot add, edit, or delete quests. Start tracking today's quests?
        </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
                  onClick={() => { setIsConfirmed(true); setShowConfirmModal(false); }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* System Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">Quest System</span>
            </div>
            <div className="text-xs text-blue-600 space-y-1">
              <div>• Complete all quests by midnight to maintain health</div>
              <div>• Partial completion = 0.5 health loss</div>
              <div>• No quests completed = 1 health loss</div>
            </div>
          </div>

          {/* Add Quest Form (confirm 전만) + Confirm 버튼 */}
          {!isConfirmed && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Plus className="w-5 h-5" />
                  Create New Quest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Quest title..."
                    value={newQuestTitle}
                    onChange={(e) => setNewQuestTitle(e.target.value)}
                    className="flex-1 h-12 text-base caret-black"
                  />
                  <Input
                    placeholder="Quest description..."
                    value={newQuestDescription}
                    onChange={(e) => setNewQuestDescription(e.target.value)}
                    className="flex-1 h-12 text-base caret-black"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <Button
                        key={difficulty}
                        variant={selectedDifficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`transition-all duration-200 h-10 px-4 ${
                          selectedDifficulty === difficulty ? difficultySettings[difficulty].color : ""
                        }`}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Button>
              ))}
            </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Reward: {difficultySettings[selectedDifficulty].reward} XP
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={addQuest}
                    disabled={!newQuestTitle.trim() || !newQuestDescription.trim()}
                    className="h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-white font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Quest
                  </Button>
                  <Button
                    className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-2 rounded shadow"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={quests.length === 0}
                  >
                    Confirm Today's Quests
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm your quests for today?</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-gray-600 mb-4">
                After confirming, you cannot add, edit, or delete quests. Start tracking today's quests?
          </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
                  onClick={() => { setIsConfirmed(true); setShowConfirmModal(false); }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Active Quests (진행/완료 모두 한 리스트에서) */}
          {todayQuests.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sword className="w-6 h-6 text-blue-600" />
                  Today's Quests ({todayQuests.length})
                </h2>
                <div className="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded">
                  {questProgress} completed
                </div>
                {allQuestsCompleted && (
                  <div className="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded ml-2">
                    +{todayBricks} bricks earned
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayQuests.map((quest) => {
                  const timeRemaining = getTimeRemaining(quest.deadline);
                  const isUrgent = timeRemaining.hours < 2;
                  const isEditing = editingQuest === quest.id;
                  const isCompleted = quest.completed;
                  return (
                    <Card
                      key={quest.id}
                      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out ${isCompleted ? 'bg-green-50/80 border-green-200' : ''}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {isEditing && !isConfirmed ? (
                              <div className="space-y-3">
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Quest title..."
                                  className="text-lg font-semibold"
                                />
                                <Input
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Quest description..."
                                  className="text-sm"
                                />
                              </div>
                            ) : (
                              <>
                                <CardTitle className={`text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>{quest.title}</CardTitle>
                                <p className={`text-sm mt-2 ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-600'}`}>{quest.description}</p>
                              </>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`${difficultySettings[quest.difficulty].color} text-white border-0 px-3 py-1 font-semibold`}
                          >
                            {quest.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded">
                            {timeRemaining.hours}h {timeRemaining.minutes}m
                          </div>
                          <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                            +{quest.reward} XP
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isConfirmed && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditQuest(quest)}
                                className="text-blue-600 hover:text-blue-700 transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteQuest(quest.id)}
                                className="text-red-600 hover:text-red-700 transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {isConfirmed && !isCompleted && (
                            <Button
                              onClick={() => completeQuest(quest.id)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-white font-semibold"
                              disabled={quest.completed}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          {isCompleted && (
                            <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                              +{quest.reward} XP Earned
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {quests.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-16 text-center">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Castle className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      No quests yet
                    </h3>
                    <p className="text-gray-600">
                      Create your first quest to build your tower and level up!
                    </p>
            </div>
          </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

