import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/submit-post-page";
import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Zap, User } from "lucide-react";
import { PixelFlame } from "~/common/components/ui/pixel-icons";
import { cn } from "~/lib/utils";
import { getOverallLeaderboard } from "~/features/products/queries";


interface UserRank {
  id: string;
  username: string;
  level: number;
  totalBricks: number;
  consecutiveDays: number;
  avatarUrl?: string;
  rank: number;
}

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Tower Leaderboards | dotLife" },
    { description: "See who's building the highest tower and dominating the leaderboards!" }
  ];
};
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 우리가 만든 getOverallLeaderboard 함수 사용
    const rankings = await getOverallLeaderboard(request, 100);
    
    console.log("[ranking loader] count:", rankings?.length ?? 0);
    console.log("[ranking loader] first:", rankings?.[0] ?? null);

    return { rankings: rankings ?? [] };
  } catch (e) {
    console.error("[ranking loader][catch]", e);
    return { rankings: [] };
  }
}

export default function RankPage(props: Route.ComponentProps) {
  const userRankings: UserRank[] = useMemo(() => {
    const rows = (props.loaderData as any)?.rankings ?? [];
    return rows.map((r: any) => ({
      id: r.profile_id ?? r.id ?? "",
      username: r.name ?? r.username ?? "Anonymous",
      level: r.level ?? 1,
      totalBricks: r.total_bricks ?? 0,
      consecutiveDays: r.consecutive_days ?? 0,
      avatarUrl: r.profiles?.avatar ?? undefined,
      rank: r.rank ?? 0,
    }));
  }, [props.loaderData]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-yellow-500">🥇</span>;
    } else if (rank === 2) {
      return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-400">🥈</span>;
    } else if (rank === 3) {
      return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-amber-600">🥉</span>;
    }
    return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankCardStyle = (rank: number) => {
    if (rank === 1) {
      return "border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg";
    } else if (rank === 2) {
      return "border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 shadow-md";
    } else if (rank === 3) {
      return "border-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md";
    }
    return "border-gray-200 hover:border-gray-300 transition-colors cursor-pointer";
  };

  const getTowerHeight = (totalBricks: number) => {
    // Calculate tower height based on bricks (max height 100px)
    const maxBricks = Math.max(...userRankings.map(u => u.totalBricks));
    return Math.max(20, (totalBricks / maxBricks) * 100);
  };

  const handleUserClick = (userId: string) => {
    // Navigate to user profile page - will implement with router later
    console.log(`Navigate to user profile: ${userId}`);
  };

  return (
    <div className="space-y-8">
      <HeroSection
        title="Tower Leaderboards"
        description="See who's building the highest tower and dominating the realm!"
      />

      {/* Champion Spotlight */}
      <div className="max-w-2xl mx-auto">
        {userRankings.length > 0 && (
          <Card 
            className={cn("text-center cursor-pointer", getRankCardStyle(1))}
            onClick={() => handleUserClick(userRankings[0].id)}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-3">
                <span className="text-4xl">🥇</span>
              </div>
              <div className="flex justify-center mb-3">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userRankings[0].avatarUrl} alt={userRankings[0].username} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
                    {userRankings[0].username[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="font-bold text-2xl">{userRankings[0].username}</h3>
              <p className="text-yellow-600 font-semibold">👑 Current Champion</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Level {userRankings[0].level}
              </Badge>
              
              <div className="flex items-center justify-center gap-2 text-lg">
                <span className="text-2xl">🧱</span>
                <span className="font-bold">{userRankings[0].totalBricks.toLocaleString()}</span>
                <span className="text-gray-600">bricks</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <PixelFlame className="w-5 h-5" />
                <span className="font-semibold">{userRankings[0].consecutiveDays} days streak</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Rankings Table */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🏆 Global Rankings
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRankings.map((user, index) => (
                <div 
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md",
                    getRankCardStyle(user.rank)
                  )}
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(user.rank)}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <Badge variant="outline" size="sm">
                          Level {user.level}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <PixelFlame className="w-3 h-3 text-orange-500" />
                          <span>{user.consecutiveDays} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-lg font-bold justify-end">
                      <span className="text-xl">🧱</span>
                      <span>{user.totalBricks.toLocaleString()}</span>
                    </div>
                    <span className="text-sm text-gray-500">Total Bricks</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Search & Stats */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Want to climb the rankings?</span>
              </div>
              <p className="text-blue-600 text-sm">
                Complete your daily quests consistently to earn more bricks and build the tallest tower!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}