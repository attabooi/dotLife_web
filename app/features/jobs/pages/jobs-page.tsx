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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/common/components/ui/dialog";
import { X } from "lucide-react";
import type { Route } from "./+types/jobs-page";
import { redirect } from "react-router";
import {
  Plus,
  CheckCircle,
  Sword,
  Castle,
  Info,
  Heart,
  Crown,
  Edit,
  Zap,
  Target,
  Star,
  Calendar,
  History,
  TrendingUp,
} from "lucide-react";
import { makeSSRClient } from "~/supa-client";
import {
  createQuest,
  completeQuest,
  confirmQuests,
  deleteQuest,
  updateQuest,
} from "../queries";

export const meta = () => {
  const today = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });

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

  // Use current date in local timezone
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format

  // Get today's quests with calculated stats
  const { data: quests, error: questsError } = await client
    .from("quest_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", today);

  if (questsError) throw questsError;

  // Get player stats
  const { data: playerStats, error: statsError } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (statsError) throw statsError;

  // Get today's summary
  const { data: todaySummary, error: summaryError } = await client
    .from("quest_daily_summary_view")
    .select("*")
    .eq("profile_id", user.id)
    .eq("quest_date", today)
    .single();

  if (summaryError && summaryError.code !== "PGRST116") throw summaryError;

  // Get user profile
  const { data: userProfile, error: profileError } = await client
    .from("profiles")
    .select("name, username, avatar")
    .eq("profile_id", user.id)
    .single();

  if (profileError) throw profileError;

  // Get quest history (last 7 days)
  const { data: questHistory, error: historyError } = await (client as any)
    .from("quest_history_view")
    .select("*")
    .eq("profile_id", user.id)
    .order("quest_date", { ascending: false })
    .limit(7);

  if (historyError && historyError.code !== "PGRST116") throw historyError;

  return {
    quests: quests || [],
    playerStats,
    todaySummary: todaySummary || null,
    userProfile,
    questHistory: questHistory || [],
  };
};

// Action for creating quests
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "create") {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const difficulty = formData.get("difficulty") as "easy" | "medium" | "hard";

    await createQuest(request, { title, description, difficulty });
  } else if (action === "complete") {
    const questId = Number(formData.get("questId"));
    await completeQuest(request, questId);
  } else if (action === "confirm") {
    await confirmQuests(request);
  } else if (action === "delete") {
    const questId = Number(formData.get("questId"));
    await deleteQuest(request, questId);
  } else if (action === "update") {
    const questId = Number(formData.get("questId"));
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    await updateQuest(request, questId, { title, description });
  }

  return null;
};

export default function QuestPage({ loaderData }: Route.ComponentProps) {
  const { quests, playerStats, todaySummary, userProfile, questHistory } =
    loaderData || {};

  // Local state for forms
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [editingQuest, setEditingQuest] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check if quests are confirmed
  const isConfirmed = (todaySummary as any)?.all_confirmed || false;

  // Difficulty settings
  const difficultySettings = {
    easy: { reward: 10, color: "bg-green-500" },
    medium: { reward: 20, color: "bg-yellow-500" },
    hard: { reward: 35, color: "bg-red-500" },
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

  if (!loaderData) {
    return <div>Loading...</div>;
  }

  // Calculate progress string manually
  const progressString = todaySummary
    ? `${todaySummary.completed_quests || 0}/${todaySummary.total_quests || 0}`
    : "0/0";

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HeroSection
          title={`Daily Quests - ${todayFormatted}`}
          description="Complete quests to build your tower and level up!"
        />

        <div className="space-y-8">
          {/* Player Profile & Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="w-16 h-16">
                  {userProfile?.avatar ? (
                    // 아바타 이미지가 있을 경우
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name || "User Avatar"}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    // 아바타 이미지가 없을 경우
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg">
                      {userProfile?.name
                        ? userProfile.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userProfile?.name || "User"}
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
                      <span className="text-yellow-600 font-bold">
                        {playerStats.current_xp}/{playerStats.xp_to_next_level}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out rounded-full"
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
                  <div className="text-3xl font-bold text-blue-600">
                    {quests.filter((q: any) => !q.completed).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Active Quests
                  </div>
                  <div className="text-sm text-green-600 font-bold mt-1">
                    {quests.filter((q: any) => q.completed).length} completed
                  </div>

                  {/* Quest Progress */}
                  {todaySummary && (
                    <div className="text-xs text-orange-600 font-bold mt-2 bg-orange-100 px-2 py-1 rounded">
                      {progressString} completed
                    </div>
                  )}

                  {/* Bricks Earned */}
                  {todaySummary?.all_completed && (
                    <div className="text-xs text-orange-600 font-bold mt-2 bg-orange-100 px-2 py-1 rounded">
                      +{todaySummary.earned_bricks_if_perfect} bricks earned
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
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
          </div>

          {/* Add Quest Form (confirm 전만) */}
          {!isConfirmed && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Plus className="w-5 h-5" />
                  Create New Quest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form method="post" className="space-y-6">
                  <input type="hidden" name="action" value="create" />
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
                  <div className="flex items-center justify-between">
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
                            {difficulty.charAt(0).toUpperCase() +
                              difficulty.slice(1)}
                          </Button>
                        )
                      )}
                      <input
                        type="hidden"
                        name="difficulty"
                        value={selectedDifficulty}
                      />
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Reward: {difficultySettings[selectedDifficulty].reward} XP
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !newQuestTitle.trim() || !newQuestDescription.trim()
                      }
                      className="h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-white font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Quest
                    </Button>
                    <Button
                      type="button"
                      className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-2 rounded shadow"
                      onClick={() => setShowConfirmModal(true)}
                      disabled={quests.length === 0}
                    >
                      Confirm Today's Quests
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Confirm Modal */}
          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm your quests for today?</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-gray-600 mb-4">
                After confirming, you cannot add, edit, or delete quests. Start
                tracking today's quests?
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </Button>
                <form method="post" className="inline">
                  <input type="hidden" name="action" value="confirm" />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
                  >
                    Confirm
                  </Button>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Today's Quests */}
          {quests.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sword className="w-6 h-6 text-blue-600" />
                  Today's Quests ({quests.length})
                  <Badge variant="outline" className="ml-2 text-xs">
                    {todayFormatted}
                  </Badge>
                </h2>
                {todaySummary && (
                  <div className="text-xs text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded">
                    {progressString} completed
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests.map((quest: any) => {
                  const isEditing = editingQuest === quest.quest_id;
                  const isCompleted = quest.completed;

                  return (
                    <Card
                      key={quest.quest_id}
                      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out ${
                        isCompleted ? "bg-green-50/80 border-green-200" : ""
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
                            } text-white border-0 px-3 py-1 font-semibold`}
                          >
                            {quest.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded">
                            {quest.hours_remaining}h {quest.minutes_remaining}m
                          </div>
                          <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                            +{quest.reward_xp} XP
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isConfirmed && (
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
                              <form method="post" className="inline">
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
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 transition-all duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </form>
                            </>
                          )}
                          {isConfirmed && !isCompleted && (
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
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-white font-semibold"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete
                              </Button>
                            </form>
                          )}
                          {isCompleted && (
                            <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">
                              +{quest.reward_xp} XP Earned
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

          {/* Quest History Section */}
          {questHistory.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Quest History
                </h2>
                <Badge variant="outline" className="ml-2">
                  Last 7 days
                </Badge>
              </div>

              <div className="space-y-4">
                {questHistory.map((dayRecord: any) => (
                  <Card
                    key={dayRecord.quest_date}
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-gray-600">
                            {dayRecord.day_name}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {dayRecord.formatted_date}
                          </div>
                          {dayRecord.is_today && (
                            <Badge className="bg-blue-500 text-white">
                              Today
                            </Badge>
                          )}
                          {dayRecord.is_yesterday && (
                            <Badge className="bg-green-500 text-white">
                              Yesterday
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
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
