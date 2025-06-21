import type { Route } from "./+types/weekly-leaderboards-page";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Week ${params.week} of ${params.month}/${params.year} Leaderboard | dotLife` },
    {
      name: "description",
      content: `Top performing products for week ${params.week} of ${params.month}/${params.year}.`,
    },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  return { year: params.year, month: params.month, week: params.week };
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function WeeklyLeaderboardsPage({ loaderData }: Route.ComponentProps) {
  const { year, month, week } = loaderData;

  return (
    <main className="px-20 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Week {week} of {month}/{year} Leaderboard
          </h1>
          <p className="text-xl font-light text-foreground mt-4">
            Top performing products for week {week} of {month}/{year}.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <p className="text-muted-foreground">Loading weekly leaderboard data...</p>
        </div>
      </div>
    </main>
  );
} 