import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { HeroSection } from "~/common/components/hero-section";
import { useState, useEffect } from "react";

import type { Route } from "./+types/jobs-page";
import { redirect } from "react-router";
import {
  Plus,
  CheckCircle,
  Sword,
  Castle,
  Info,
  Heart,
  Edit,
  Zap,
  History,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { makeSSRClient } from "~/supa-client";
import {
  createQuest,
  completeQuest,
  confirmQuests,
  deleteQuest,
  updateQuest,
  getQuestHistory,
} from "../queries";
import { DateTime } from "luxon";

export const meta = () => {
  const today = DateTime.now().setZone("Asia/Seoul").toFormat("yyyy-LL-dd");

  return [
    { title: `Daily Quests - ${today} | dotLife` },
    {
      name: "description",
      content: "Complete quests to build your tower and level up!",
    },
  ];
};


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get current time to determine which day's quests to show
  const now = new Date();
  
  // Check if it's past midnight (00:00) - if so, show today's quests
  // If it's before midnight, show today's quests
  const questDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD format

  // Get dashboard data (single query optimization)
  const { data: dashboardData, error: dashboardError } = await client
    .from("quest_dashboard_view")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (dashboardError) throw dashboardError;

  // Get today's quests (separate query for quest details)
  const { data: quests, error: questsError } = await client
    .from("quest_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", questDate);

  if (questsError) throw questsError;

  // Get quest history
  const questHistory = await getQuestHistory(request);

  return {
    quests: quests || [],
    dashboard: dashboardData,
    questHistory,
  };
};

// Action for creating quests
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    if (action === "create") {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const difficulty = formData.get("difficulty") as "easy" | "medium" | "hard";

      await createQuest(request, { title, description, difficulty });
    } else if (action === "complete") {
      const questId = Number(formData.get("questId"));
      await completeQuest(request, questId);
    } else if (action === "confirm") {
      const result = await confirmQuests(request);
      return { success: true, message: result.message };
    } else if (action === "delete") {
      const questId = Number(formData.get("questId"));
      await deleteQuest(request, questId);
    } else if (action === "update") {
      const questId = Number(formData.get("questId"));
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const difficulty = formData.get("difficulty") as "easy" | "medium" | "hard";
      await updateQuest(request, questId, { title, description, difficulty });
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An error occurred" 
    };
  }
};

export default function QuestPage({ loaderData }: Route.ComponentProps) {
  const { quests, dashboard, questHistory } = loaderData || {};
  
  // Extract data from dashboard
  const playerStats = dashboard ? {
    level: dashboard.level,
    total_bricks: dashboard.total_bricks,
    current_xp: dashboard.current_xp,
    xp_to_next_level: dashboard.xp_to_next_level,
    consecutive_days: dashboard.consecutive_days,
    hearts: dashboard.hearts,
  } : null;
  
  const userProfile = dashboard ? {
    name: dashboard.name,
    username: dashboard.username,
    avatar: dashboard.avatar,
  } : null;
  
  const todaySummary = dashboard ? {
    total_quests: dashboard.total_quests,
    completed_quests: dashboard.completed_quests,
    earned_bricks_if_perfect: dashboard.earned_bricks_if_perfect,
    all_completed: dashboard.completed_quests === dashboard.total_quests && dashboard.total_quests > 0,
  } : null;

  // Local state for forms
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [editingQuest, setEditingQuest] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time time update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Difficulty settings
  const difficultySettings = {
    easy: { reward: 10, color: "bg-green-500", label: "Easy", xp: 10 },
    medium: { reward: 20, color: "bg-yellow-500", label: "Medium", xp: 20 },
    hard: { reward: 35, color: "bg-red-500", label: "Hard", xp: 35 },
  };

  // Heart display component
  function HeartDisplay({ hearts }: { hearts: number }) {
    if (hearts === 1) {
      return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
    } else if (hearts === 0.5) {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 17.5C10 17.5 3 12.5 3 8.5C3 6 5 4 7.5 4C8.88 4 10 5.12 10 6.5V17.5Z"
            fill="#ef4444"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
          <path
            d="M10 17.5C10 17.5 17 12.5 17 8.5C17 6 15 4 12.5 4C11.12 4 10 5.12 10 6.5"
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        </svg>
      );
    } else {
      return <Heart className="w-5 h-5 text-gray-400" />;
    }
  }

  if (!loaderData || !playerStats || !userProfile) {
    return <div>Loading...</div>;
  }

  // Calculate progress string manually
  const progressString = todaySummary
    ? `${todaySummary.completed_quests || 0}/${todaySummary.total_quests || 0}`
    : "0/0";

  // Check if quests are confirmed
  const isConfirmed = quests.length > 0 && quests.every((q: any) => q.confirmed);
  
  // Check if it's past midnight (00:00) - quests are expired
  const isPastMidnight = currentTime.getHours() === 0;



  // Format today's date
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="w-full px-0 pt-16 pb-4 md:pt-20 md:pb-8">
        <HeroSection
          title={`Daily Quests - ${todayFormatted}`}
          description="Complete quests to build your tower and level up!"
        />

        <div className="space-y-6 md:space-y-8 px-4 md:px-6 max-w-6xl mx-auto">
          {/* Player Profile & Stats */}
          <Card className="w-full bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Profile Picture */}
                <div className="w-12 h-12 md:w-16 md:h-16">
                  {userProfile?.avatar ? (
                    // 아바타 이미지가 있을 경우
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name || "User Avatar"}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    // 아바타 이미지가 없을 경우
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-white text-lg md:text-xl font-bold border-4 border-white shadow-lg">
                      {userProfile?.name
                        ? userProfile.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                      {userProfile?.name || "User"}
                    </h2>
                    <div className="text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-1 rounded w-fit">
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
                      <span className="text-yellow-600 font-bold">
                        {playerStats.current_xp}/{playerStats.xp_to_next_level}
                      </span>
                    </div>
                    
                    {/* Level Up Notification */}
                    {playerStats.current_xp >= playerStats.xp_to_next_level && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg text-center animate-pulse">
                        🎉 LEVEL UP AVAILABLE! 🎉
                      </div>
                    )}
                    
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 ease-out rounded-full ${
                          playerStats.current_xp >= playerStats.xp_to_next_level
                            ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"
                            : "bg-gradient-to-r from-yellow-400 to-orange-500"
                        }`}
                        style={{
                          width: `${
                            (playerStats.current_xp /
                              playerStats.xp_to_next_level) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Health */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600 font-medium">
                      Health
                    </span>
                    <div className="flex items-center gap-1">
                      <HeartDisplay hearts={playerStats.hearts} />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
                    <div className="text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded">
                      {playerStats.consecutive_days} days
                    </div>
                    <div className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                      {playerStats.total_bricks} bricks
                    </div>
                  </div>
                </div>

                {/* Quest Stats */}
                <div className="text-right w-full md:w-auto">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">
                    {quests.filter((q: any) => !q.completed).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Active Quests
                  </div>
                  <div className="text-sm text-green-600 font-bold mt-1">
                    {quests.filter((q: any) => q.completed).length} completed
                  </div>

                  {/* Quest Progress */}
                  <div className="flex flex-col items-end gap-2 mt-2">
                  {todaySummary && (
                    <div className="inline-flex w-fit text-xs text-orange-600 font-bold mt-2 bg-orange-100 px-2 py-1 rounded">
                      {progressString} completed
                    </div>
                  )}

                  {/* Bricks Earned */}
                  {todaySummary?.all_completed && (
                    <div className="inline-flex w-fit text-xs text-orange-600 font-bold mt-2 bg-orange-100 px-2 py-1 rounded">
                      +{todaySummary.earned_bricks_if_perfect} bricks earned
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">
                  Quest System
                </span>
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>• Complete all quests by midnight to maintain health</div>
                <div>• Partial completion = 0.5 health loss</div>
                <div>• No quests completed = 1 health loss</div>
              </div>
            </CardContent>
          </Card>

                     {/* Add Quest Form (confirm 전만 또는 퀘스트가 없을 때 또는 자정이 지났을 때) */}
           {(!isConfirmed || quests.length === 0 || isPastMidnight) && (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Plus className="w-5 h-5" />
                  Create New Quest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form method="post" className="space-y-6">
                  <input type="hidden" name="action" value="create" />
                  <input type="hidden" name="difficulty" value={selectedDifficulty} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="title"
                      placeholder="Quest title..."
                      value={newQuestTitle}
                      onChange={(e) => setNewQuestTitle(e.target.value)}
                      className="flex-1 h-12 text-base caret-black"
                      required
                    />
                    <Input
                      name="description"
                      placeholder="Quest description..."
                      value={newQuestDescription}
                      onChange={(e) => setNewQuestDescription(e.target.value)}
                      className="flex-1 h-12 text-base caret-black"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      {(["easy", "medium", "hard"] as const).map(
                        (difficulty) => (
                          <Button
                            key={difficulty}
                            type="button"
                            variant={
                              selectedDifficulty === difficulty
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedDifficulty(difficulty)}
                            className={`transition-all duration-200 h-10 px-4 ${
                              selectedDifficulty === difficulty
                                ? difficultySettings[difficulty].color
                                : ""
                            }`}
                          >
                            {difficultySettings[difficulty].label}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={!newQuestTitle || !newQuestDescription}
                      className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    >
                      Create Quest
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Today's Quests */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                                 <h2 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                   <Sword className="w-5 h-5 text-orange-500" />
                   {isPastMidnight ? "Yesterday's Quests (Expired)" : "Today's Quests"} ({quests.length})
                   <Badge variant="outline" className="ml-2 text-xs">
                     {todayFormatted}
                   </Badge>
                   {isPastMidnight && (
                     <Badge variant="destructive" className="ml-2 text-xs">
                       EXPIRED
                     </Badge>
                   )}
                 </h2>
                                                   <div className="flex items-center gap-3">
                    {/* Current time */}
                    <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      Current: {currentTime.toLocaleTimeString('en-US', { 
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    {todaySummary && (
                     <div className="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded">
                       {progressString} completed
                     </div>
                   )}
                                                                                 {!isConfirmed && quests.length > 0 && !isPastMidnight && (
                       <form method="post">
                         <input type="hidden" name="action" value="confirm" />
                         <Button
                           type="submit"
                           size="sm"
                           className="bg-blue-500 hover:bg-blue-600 text-white"
                         >
                           Confirm All Quests
                         </Button>
                       </form>
                     )}
                     {isConfirmed && !isPastMidnight && (
                       <Badge className="bg-green-500 text-white">
                         Confirmed
                       </Badge>
                     )}
                     {isPastMidnight && (
                       <Badge className="bg-red-500 text-white">
                         Yesterday's Quests - Expired
                       </Badge>
                     )}
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                 {quests.map((quest: any) => {
                   const isEditing = editingQuest === quest.quest_id;
                   const isCompleted = quest.completed;
                   
                   // Calculate remaining time manually from current time to next midnight
                   const nextMidnight = new Date();
                   nextMidnight.setDate(nextMidnight.getDate() + 1);
                   nextMidnight.setHours(0, 0, 0, 0);
                   
                   const timeDiff = nextMidnight.getTime() - currentTime.getTime();
                   const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
                   const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                   
                   // Debug: Log calculated time
                   console.log('Quest:', quest.title, 'Current time:', currentTime.toISOString(), 'Next midnight:', nextMidnight.toISOString(), 'Hours remaining:', hoursRemaining, 'Minutes remaining:', minutesRemaining);
                   
                   // Check if expired using calculated time
                   const isExpired = (hoursRemaining <= 0 && minutesRemaining <= 0) || isPastMidnight;

                  return (
                                         <Card
                       key={quest.quest_id}
                       className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out rounded-xl ${
                         isCompleted ? "bg-green-50/80 border-green-200" : ""
                                               } ${
                                                     (() => {
                             if (isExpired) return "border-red-300 bg-red-50/80";
                             if (hoursRemaining < 1) return "border-orange-300 bg-orange-50/80";
                             return "";
                           })()
                        }`}
                     >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {isEditing && !isConfirmed ? (
                              <form method="post" className="space-y-3">
                                <input
                                  type="hidden"
                                  name="action"
                                  value="update"
                                />
                                <input
                                  type="hidden"
                                  name="questId"
                                  value={quest.quest_id}
                                />
                                <input type="hidden" name="difficulty" value={editDifficulty} />
                                <Input
                                  name="title"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Quest title..."
                                  className="text-lg font-semibold"
                                  required
                                />
                                <Input
                                  name="description"
                                  value={editDescription}
                                  onChange={(e) =>
                                    setEditDescription(e.target.value)
                                  }
                                  placeholder="Quest description..."
                                  className="text-sm"
                                  required
                                />
                                <div className="flex gap-2">
                                  {(["easy", "medium", "hard"] as const).map(
                                    (difficulty) => (
                                      <Button
                                        key={difficulty}
                                        type="button"
                                        variant={
                                          editDifficulty === difficulty
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setEditDifficulty(difficulty)}
                                        className={`transition-all duration-200 h-8 px-3 text-xs ${
                                          editDifficulty === difficulty
                                            ? difficultySettings[difficulty].color
                                            : ""
                                        }`}
                                      >
                                        {difficultySettings[difficulty].label}
                                      </Button>
                                    )
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" size="sm">
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingQuest(null);
                                      setEditTitle("");
                                      setEditDescription("");
                                      setEditDifficulty("medium");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <CardTitle
                                  className={`text-lg ${
                                    isCompleted
                                      ? "line-through text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {quest.title}
                                </CardTitle>
                                <p
                                  className={`text-sm mt-2 ${
                                    isCompleted
                                      ? "text-gray-500 line-through"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {quest.description}
                                </p>
                              </>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              difficultySettings[
                                quest.difficulty as keyof typeof difficultySettings
                              ].color
                            } ml-2`}
                          >
                            {difficultySettings[
                              quest.difficulty as keyof typeof difficultySettings
                            ].label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                                                 <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                           <span>
                             {isCompleted ? (
                               <span className="text-green-600 font-semibold">✅ Completed</span>
                             ) : isExpired ? (
                               <span className="text-red-500 font-semibold animate-pulse">⏰ Expired</span>
                                                           ) : (
                                                                 (() => {
                                   if (hoursRemaining < 1) {
                                     return (
                                       <span className="text-orange-600 font-semibold animate-pulse font-mono">
                                         ⚠️ Time left: {hoursRemaining}h {minutesRemaining}m
                                       </span>
                                     );
                                   }
                                   return (
                                     <span className="font-mono text-gray-600">
                                       ⏰ Time left: {hoursRemaining}h {minutesRemaining}m
                                     </span>
                                   );
                                 })()
                              )}
                           </span>
                           <span className="text-orange-600 font-bold">
                             +{difficultySettings[
                               quest.difficulty as keyof typeof difficultySettings
                             ].xp} XP
                           </span>
                         </div>
                                                 {isCompleted && (
                           <div className="text-green-600 font-bold text-sm">
                             +{difficultySettings[
                               quest.difficulty as keyof typeof difficultySettings
                             ].xp} XP Earned
                           </div>
                         )}
                        <div className="flex gap-2 mt-4">
                          {!isConfirmed && !isEditing && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingQuest(quest.quest_id);
                                  setEditTitle(quest.title);
                                  setEditDescription(quest.description);
                                  setEditDifficulty(quest.difficulty);
                                }}
                                className="flex-1"
                              >
                                Edit
                              </Button>
                              <form method="post" className="flex-1">
                                <input
                                  type="hidden"
                                  name="action"
                                  value="delete"
                                />
                                <input
                                  type="hidden"
                                  name="questId"
                                  value={quest.quest_id}
                                />
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  size="sm"
                                  className="w-full"
                                >
                                  Delete
                                </Button>
                              </form>
                            </>
                          )}
                          {isConfirmed && !isCompleted && !isEditing && (
                            <form method="post" className="flex-1">
                              <input
                                type="hidden"
                                name="action"
                                value="complete"
                              />
                              <input
                                type="hidden"
                                name="questId"
                                value={quest.quest_id}
                              />
                              <Button
                                type="submit"
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                              >
                                Complete
                              </Button>
                            </form>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

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

                       {/* Quest History Section */}
            {questHistory && questHistory.filter((dayRecord: any) => !dayRecord.is_today).length > 0 && (
             <div className="space-y-6 text-xs">
               <div className="flex items-center gap-2">
                 <History className="w-6 h-6 text-blue-600" />
                 <h2 className="text-xs font-bold text-gray-900">
                   Quest History
                 </h2>
                 <Badge variant="outline" className="ml-2">
                   Last 7 days
                 </Badge>
               </div>
                               <div className="space-y-4">
                  {questHistory.filter((dayRecord: any) => !dayRecord.is_today).map((dayRecord: any) => (
                   <Card
                     key={dayRecord.quest_date}
                     className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                   >
                     <CardHeader className="pb-3">
                       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                         <div className="flex items-center gap-3">
                           <div className="text-xs font-semibold text-gray-600">
                             {dayRecord.day_name}
                           </div>
                           <div className="text-xs font-bold text-gray-900">
                             {dayRecord.formatted_date}
                           </div>
                           
                           {dayRecord.is_yesterday && (
                             <Badge className="bg-green-500 text-white">
                               Yesterday
                             </Badge>
                           )}
                         </div>
                         <div className="flex items-center gap-4 text-xs">
                           <div className="text-center">
                             <div className="font-bold text-blue-600">
                               {dayRecord.completed_quests}/
                               {dayRecord.total_quests}
                             </div>
                             <div className="text-gray-500">Completed</div>
                           </div>
                           <div className="text-center">
                             <div className="font-bold text-yellow-600">
                               +{dayRecord.total_xp_earned}
                             </div>
                             <div className="text-gray-500">XP</div>
                           </div>
                           <div className="text-center">
                             <div className="font-bold text-green-600">
                               +{dayRecord.total_bricks_earned}
                             </div>
                             <div className="text-gray-500">Bricks</div>
                           </div>
                           <div className="text-center">
                             <div className="font-bold text-purple-600">
                               {dayRecord.completion_percentage}%
                             </div>
                             <div className="text-gray-500">Success</div>
                           </div>
                         </div>
                       </div>
                     </CardHeader>

                     {dayRecord.quests && dayRecord.quests.length > 0 && (
                       <CardContent className="pt-0">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                           {dayRecord.quests.map((quest: any) => (
                             <div
                               key={quest.quest_id}
                               className={`p-3 rounded-lg border ${
                                 quest.completed
                                   ? "bg-green-50 border-green-200"
                                   : "bg-gray-50 border-gray-200"
                               }`}
                             >
                               <div className="flex items-start justify-between mb-2">
                                 <h4
                                   className={`font-semibold text-sm ${
                                     quest.completed
                                       ? "text-green-800"
                                       : "text-gray-700"
                                   }`}
                                 >
                                   {quest.title}
                                 </h4>
                                 <Badge
                                   variant="outline"
                                   className={`text-xs ${
                                     quest.difficulty === "easy"
                                       ? "bg-green-100 text-green-700"
                                       : quest.difficulty === "medium"
                                       ? "bg-yellow-100 text-yellow-700"
                                       : "bg-red-100 text-red-700"
                                   }`}
                                 >
                                   {quest.difficulty}
                                 </Badge>
                               </div>
                               <p className="text-xs text-gray-600 mb-2">
                                 {quest.description}
                               </p>
                               <div className="flex items-center justify-between text-xs">
                                 <span className="text-gray-500">
                                   +{quest.reward_xp} XP
                                 </span>
                                 {quest.completed ? (
                                   <div className="flex items-center gap-1 text-green-600">
                                     <CheckCircle className="w-3 h-3" />
                                     <span>Completed</span>
                                   </div>
                                 ) : (
                                   <span className="text-gray-400">
                                     Not completed
                                   </span>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       </CardContent>
                     )}
                   </Card>
                 ))}
               </div>
             </div>
           )}


         </div>
       </div>
     </div>
   );
 }
