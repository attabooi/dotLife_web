import { DateTime } from "luxon";
import type { Route } from "./+types/weekly-leaderboards-page";
import { data, isRouteErrorResponse, Link } from "react-router";
import { z } from "zod";
import { HeroSection } from "~/common/components/hero-section";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { getWeeklyLeaderboard } from "../queries";

const paramsSchema = z.object({
  year: z.coerce.number(),
  week: z.coerce.number(),
});

const meta: Route.MetaFunction = ({ params }) => {
  const date = DateTime.fromObject({
    weekYear: Number(params.year),
    weekNumber: Number(params.week),
  }).setZone("Asia/Seoul").setLocale("ko");
  return [
    {
      title: `Best of week ${date
          .startOf("week")
          .toLocaleString(DateTime.DATE_SHORT)} - ${date
          .endOf("week")
          .toLocaleString(DateTime.DATE_SHORT)} | dotLife`,
    },
    {
      name: "description",
      content: "",
    },
  ];
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data: parsedData } = paramsSchema.safeParse(params);

  if (!success) {
    throw data(
      {
        error_code: "INVALID_PARAMS",
        message: "Invalid params",
      },
      {
        status: 400,
      }
    );
  }
  const date = DateTime.fromObject({
    weekYear: parsedData.year,
    weekNumber: parsedData.week,
  }).setZone("Asia/Seoul");
  if (!date.isValid) {
    throw data(
      {
        error_code: "INVALID_DATE",
        message: "Invalid date",
      },
      {
        status: 400,
      }
    );
  }

  const today = DateTime.now().setZone("Asia/Seoul").startOf("day");
  if (date > today) {
    throw data(
      {
        error_code: "FUTURE_DATE",
        message: "Future date",
      },
      {
        status: 400,
      }
    );
  }

  try {
    // 실제 주간 랭킹 데이터 가져오기
    const rankings = await getWeeklyLeaderboard(
      request, 
      parsedData.year, 
      parsedData.week
    );

    return {
      ...parsedData,
      rankings,
    };
  } catch (error) {
    console.error("Error loading weekly leaderboard:", error);
    return {
      ...parsedData,
      rankings: [],
    };
  }
};

export default function WeeklyLeaderboardsPage({
  loaderData,
}: Route.ComponentProps) {
  const urlDate = DateTime.fromObject({
    weekYear: loaderData.year,
    weekNumber: loaderData.week,
  }).setZone("Asia/Seoul");

  const previousWeek = urlDate.minus({ weeks: 1 });
  const nextWeek = urlDate.plus({ weeks: 1 });
  const isToday = urlDate.equals(DateTime.now().startOf("week"));

  return (
    <div className="space-y-8">
      <HeroSection
        title={`Best of week ${urlDate
          .startOf("week")
          .toLocaleString(DateTime.DATE_SHORT)} - ${urlDate
          .endOf("week")
          .toLocaleString(DateTime.DATE_SHORT)}`}
        description=""
      />

      <div className="flex justify-center gap-2">
        <Button variant="secondary" asChild>
          <Link
            to={`/products/leaderboards/weekly/${previousWeek.year}/${previousWeek.weekNumber}`}
          >
            &larr; {previousWeek.toLocaleString(DateTime.DATE_SHORT)}
          </Link>
        </Button>
        {!isToday ? (
          <Button variant="secondary" asChild>
            <Link
              to={`/products/leaderboards/weekly/${nextWeek.year}/${nextWeek.weekNumber}`}
            >
              {nextWeek.toLocaleString(DateTime.DATE_SHORT)} &rarr;
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 w-full max-w-4xl mx-auto">
        {loaderData.rankings.length > 0 ? (
          loaderData.rankings.map((player: any, index: number) => (
            <Card key={player.profile_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 랭킹 */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div className={`text-2xl font-bold ${
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
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback>
                          {player.name?.charAt(0) || player.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">
                          {player.name || player.username || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{player.username || 'user'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {player.total_xp}
                      </div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {player.total_bricks}
                      </div>
                      <div className="text-xs text-gray-500">Bricks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {player.quests_completed}
                      </div>
                      <div className="text-xs text-gray-500">Quests</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-4xl mb-4">📊</div>
              <div className="text-xl font-semibold mb-2">No Rankings Yet</div>
              <div className="text-gray-500">
                No one has completed quests this week yet.
                <br />
                Be the first to complete this week's quests!
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
