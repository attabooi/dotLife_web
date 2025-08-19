import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { HeroSection } from "~/common/components/hero-section";
import { useState, useEffect } from "react";
import { getQuests, createQuest, completeQuest, getUserStats } from "../queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/common/components/ui/dialog";
import { X } from "lucide-react";
import type { Route } from "./+types/jobs-page";
import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import { Form, useSubmit } from "react-router";
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
  quest_id: string;
  profile_id: string;
  title: string;
  description: string;
  completed: boolean;
  quest_date: string;
  deadline: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward_xp: number;
  reward_bricks: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  confirmed: boolean;
}

interface PlayerStats {
  profile_id: string;
  level: number;
  total_xp: number;
  current_xp: number;
  consecutive_days: number;
  total_bricks: number;
  available_bricks: number;
  last_completed_date: string | null;
  created_at: string;
  updated_at: string;
}

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Daily Quests | dotLife" },
    {
      name: "description",
      content: "Complete quests to build your tower and level up!",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = makeSSRClient(request);
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (!user || authError) {
    return redirect("/auth/login");
  }

  // Get user's quests and stats
  const [quests, stats] = await Promise.all([
    getQuests(client, user.id),
    getUserStats(client, user.id)
  ]);

  return { 
    quests,
    stats,
    userId: user.id
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { client } = makeSSRClient(request);
  const { data: { user }, error: authError } = await client.auth.getUser();
  
  if (!user || authError) {
    return redirect("/auth/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "create": {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const difficulty = formData.get("difficulty") as "easy" | "medium" | "hard";
      
      return createQuest(client, {
        userId: user.id,
        title,
        description,
        difficulty
      });
    }
    
    case "complete": {
      const questId = formData.get("questId") as string;
      return completeQuest(client, {
        userId: user.id,
        questId
      });
    }

    case "confirm": {
      const quests = JSON.parse(formData.get("quests") as string);
      return Promise.all(quests.map(async (quest: Quest) => {
        if (quest.quest_id.startsWith('temp-')) {
          return createQuest(client, {
            userId: user.id,
            title: quest.title,
            description: quest.description,
            difficulty: quest.difficulty
          });
        }
        return Promise.resolve();
      }));
    }

    default:
      return null;
  }
}

const DIFFICULTY_SETTINGS = {
  easy: { reward: 10, bricks: 1, color: 'bg-green-500' },
  medium: { reward: 20, bricks: 2, color: 'bg-yellow-500' },
  hard: { reward: 35, bricks: 3, color: 'bg-red-500' }
} as const;

export default function QuestPage({ loaderData, actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    profile_id: "",
    level: 1,
    total_xp: 0,
    current_xp: 0,
    consecutive_days: 0,
    total_bricks: 0,
    available_bricks: 0,
    last_completed_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [editingQuest, setEditingQuest] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize data from loader
  useEffect(() => {
    if (loaderData?.quests) {
      setQuests(loaderData.quests);
    }
    if (loaderData?.stats) {
      setPlayerStats(loaderData.stats);
    }
  }, [loaderData]);

  // Add new quest locally
  const addQuest = () => {
    if (newQuestTitle.trim() && newQuestDescription.trim()) {
      const quest: Quest = {
        quest_id: Date.now().toString(), // Temporary ID until saved to DB
        profile_id: playerStats.profile_id,
        title: newQuestTitle.trim(),
        description: newQuestDescription.trim(),
        completed: false,
        quest_date: new Date().toISOString().split('T')[0],
        deadline: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        difficulty: selectedDifficulty,
        reward_xp: DIFFICULTY_SETTINGS[selectedDifficulty].reward,
        reward_bricks: DIFFICULTY_SETTINGS[selectedDifficulty].bricks,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        confirmed: false
      };
      setQuests(prev => [...prev, quest]);
      setNewQuestTitle("");
      setNewQuestDescription("");
    }
  };

  // Edit quest locally
  const saveEditQuest = (questId: string) => {
    if (editTitle.trim() && editDescription.trim()) {
      setQuests(quests.map(q => 
        q.quest_id === questId 
          ? { ...q, title: editTitle.trim(), description: editDescription.trim() }
          : q
      ));
      setEditingQuest(null);
      setEditTitle("");
      setEditDescription("");
    }
  };

  // Delete quest locally
  const deleteQuest = (questId: string) => {
    setQuests(quests.filter(q => q.quest_id !== questId));
  };

  // Confirm quests - Save to DB
  const confirmQuests = async () => {
    const formData = new FormData();
    formData.append("intent", "confirm");
    formData.append("quests", JSON.stringify(quests));
    submit(formData, { method: "post" });
    setIsConfirmed(true);
    setShowConfirmModal(false);
  };

  // Complete quest - Update DB
  const completeQuest = (questId: string) => {
    const formData = new FormData();
    formData.append("intent", "complete");
    formData.append("questId", questId);
    submit(formData, { method: "post" });
  };

  // Calculate remaining time
  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Calculate today's bricks
  const calculateTodayBricks = (consecutiveDays: number) => {
    if (consecutiveDays >= 30) return 4;
    if (consecutiveDays >= 5) return 3;
    if (consecutiveDays >= 2) return 2;
    return 1;
  };

  // Filter and sort quests
  const activeQuests = quests.filter(quest => !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);
  const todayBricks = calculateTodayBricks(playerStats.consecutive_days);

  // 오늘 퀘스트 진행률 계산
  const todayQuests = quests.filter(quest => {
    const questDate = new Date(quest.created_at);
    const today = new Date();
    return questDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  });
  const todayCompletedQuests = todayQuests.filter(quest => quest.completed);
  const questProgress = todayQuests.length > 0 ? `${todayCompletedQuests.length}/${todayQuests.length}` : "0/0";
  const allQuestsCompleted = quests.length > 0 && todayQuests.length > 0 && todayCompletedQuests.length === todayQuests.length;

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
                    {/* playerName is not defined in this scope, so this will cause a type error */}
                    {/* Assuming playerName should be derived from playerStats or loaderData */}
                    {/* For now, using a placeholder or removing if not available */}
                    {/* <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 fill-yellow-400" /> */}
                  </div>
                  {/* playerStats.level >= 10 && ( */}
                  {/* <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 fill-yellow-400" /> */}
                  {/* ) */}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">{/* playerName is not defined */}
                      Level {playerStats.level}
                    </h2>
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
                      <span className="text-yellow-600 font-bold">{playerStats.current_xp}/{playerStats.level * 100}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(playerStats.current_xp / (playerStats.level * 100)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Health */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600 font-medium">Health</span>
                    <div className="flex items-center gap-1">
                      {/* hearts is not defined in this scope, so this will cause a type error */}
                      {/* Assuming hearts should be derived from playerStats or loaderData */}
                      {/* For now, using a placeholder or removing if not available */}
                      {/* <Heart className="w-5 h-5 text-red-500 fill-red-500 transition-all duration-300" /> */}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded">
                      {playerStats.consecutive_days} days
                    </div>
                    
                    <div className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                      {playerStats.total_bricks} bricks
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
                  onClick={confirmQuests}
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
          {/* isConfirmed is not defined in this scope, so this will cause a type error */}
          {/* Assuming isConfirmed should be derived from playerStats or loaderData */}
          {/* For now, using a placeholder or removing if not available */}
          {/* {!isConfirmed && ( */}
            <Form method="post" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              formData.append("intent", "create");
              submit(formData, { method: "post" });
              setNewQuestTitle("");
              setNewQuestDescription("");
            }}>
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
                      name="title"
                      placeholder="Quest title..."
                      value={newQuestTitle}
                      onChange={(e) => setNewQuestTitle(e.target.value)}
                      className="flex-1 h-12 text-base"
                    />
                    <Input
                      name="description"
                      placeholder="Quest description..."
                      value={newQuestDescription}
                      onChange={(e) => setNewQuestDescription(e.target.value)}
                      className="flex-1 h-12 text-base"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                        <Button
                          key={difficulty}
                          type="button"
                          variant={selectedDifficulty === difficulty ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className={`transition-all duration-200 h-10 px-4 ${
                            selectedDifficulty === difficulty ? DIFFICULTY_SETTINGS[difficulty].color : ""
                          }`}
                        >
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <input type="hidden" name="difficulty" value={selectedDifficulty} />
                    <input type="hidden" name="intent" value="create" />
                    <div className="text-sm text-gray-600 font-medium">
                      Reward: {DIFFICULTY_SETTINGS[selectedDifficulty].reward} XP
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="submit"
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
            </Form>
          {/* )} */}
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
                  onClick={confirmQuests}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Active Quests (진행/완료 모두 한 리스트에서) */}
          {/* Unconfirmed Quests Section */}
          {!isConfirmed && quests.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Draft Quests ({quests.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests.map((quest) => (
                  <Card
                    key={quest.quest_id}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingQuest === quest.quest_id ? (
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
                              <CardTitle className="text-lg text-gray-900">{quest.title}</CardTitle>
                              <p className="text-sm mt-2 text-gray-600">{quest.description}</p>
                            </>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`${DIFFICULTY_SETTINGS[quest.difficulty].color} text-white border-0 px-3 py-1 font-semibold`}
                        >
                          {quest.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded">
                          {getTimeRemaining(quest.deadline)}
                        </div>
                        <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                          +{quest.reward_xp} XP
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingQuest === quest.quest_id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEditQuest(quest.quest_id)}
                              className="text-green-600 hover:text-green-700 transition-all duration-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingQuest(null);
                                setEditTitle("");
                                setEditDescription("");
                              }}
                              className="text-red-600 hover:text-red-700 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingQuest(quest.quest_id);
                                setEditTitle(quest.title);
                                setEditDescription(quest.description);
                              }}
                              className="text-blue-600 hover:text-blue-700 transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuest(quest.quest_id)}
                              className="text-red-600 hover:text-red-700 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Quests Section */}
          {isConfirmed && todayQuests.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sword className="w-6 h-6 text-blue-600" />
                  Today's Quests ({todayQuests.length})
                </h2>
                <div className="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded">
                  {questProgress} completed
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayQuests.map((quest) => (
                  <Card
                    key={quest.quest_id}
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out ${quest.completed ? 'bg-green-50/80 border-green-200' : ''}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className={`text-lg ${quest.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {quest.title}
                          </CardTitle>
                          <p className={`text-sm mt-2 ${quest.completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                            {quest.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${DIFFICULTY_SETTINGS[quest.difficulty].color} text-white border-0 px-3 py-1 font-semibold`}
                        >
                          {quest.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded">
                          {getTimeRemaining(quest.deadline)}
                        </div>
                        <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                          +{quest.reward_xp} XP
                        </div>
                      </div>
                      {!quest.completed && (
                        <Button
                          onClick={() => completeQuest(quest.quest_id)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-white font-semibold"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
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

