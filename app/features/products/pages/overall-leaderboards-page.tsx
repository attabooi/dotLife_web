import type { Route } from "./+types/overall-leaderboards-page";
import { data, isRouteErrorResponse } from "react-router";
import { HeroSection } from "~/common/components/hero-section";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { getOverallLeaderboard } from "../queries";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Overall Leaderboard | dotLife" },
    {
      name: "description",
      content: "Check out the overall leaderboard to see who has built the most impressive towers!",
    },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    // 전체 랭킹 데이터 가져오기 (상위 100명)
    const rankings = await getOverallLeaderboard(request, 100);

    return {
      rankings,
    };
  } catch (error) {
    console.error("Error loading overall leaderboard:", error);
    return {
      rankings: [],
    };
  }
};

export default function OverallLeaderboardsPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      <HeroSection  
        title="🏆 Overall Leaderboard"
        description="Check out the overall leaderboard to see who has built the most impressive towers!"
      />

      <div className="space-y-4 w-full max-w-4xl mx-auto px-4 md:px-6">
        {loaderData.rankings.length > 0 ? (
          loaderData.rankings.map((player: any, index: number) => (
            <Card key={player.profile_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* 랭킹 */}
                    <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px]">
                      <div className={`text-xl md:text-2xl font-bold ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        index === 2 ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        #{player.rank}
                      </div>
                      {index < 3 && (
                        <div className="text-xs text-gray-500">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>

                    {/* 프로필 */}
                    <div className="flex items-center gap-2 md:gap-3">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback>
                          {player.name?.charAt(0) || player.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-base md:text-lg">
                          {player.name || player.username || 'Anonymous'}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          @{player.username || 'user'}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">Level {player.level}</Badge>
                          <Badge variant="outline" className="text-xs">{player.consecutive_days} days</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-center">
                      <div className="text-base md:text-lg font-bold text-green-600">
                        {player.total_bricks}
                      </div>
                      <div className="text-xs text-gray-500">Total Bricks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base md:text-lg font-bold text-blue-600">
                        {player.total_xp}
                      </div>
                      <div className="text-xs text-gray-500">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {player.consecutive_days}
                      </div>
                      <div className="text-xs text-gray-500">Streak</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-4xl mb-4">🏗️</div>
              <div className="text-xl font-semibold mb-2">No Rankings Yet</div>
              <div className="text-gray-500">
                No one has built towers yet.
                <br />
                Start building your tower to appear on the leaderboard!
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto px-4 py-8">
        {error.data.message} / {error.data.error_code}
      </div>
    );
  }
  if (error instanceof Error) {
    return <div className="container mx-auto px-4 py-8">{error.message}</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">Unknown error happened</div>
  );
}
