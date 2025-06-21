import type { Route } from "./+types/daily-leaderboards-page";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.day}/${params.month}/${params.year} Daily Leaderboard | dotLife` },
    {
      name: "description",
      content: `Top performing products for ${params.day}/${params.month}/${params.year}.`,
    },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  return { 
    year: params.year, 
    month: params.month, 
    week: params.week, 
    day: params.day 
  };
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function DailyLeaderboardsPage({ loaderData }: Route.ComponentProps) {
  const { year, month, day } = loaderData;

  return (
    <main className="px-20 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            {day}/{month}/{year} Daily Leaderboard
          </h1>
          <p className="text-xl font-light text-foreground mt-4">
            Top performing products for {day}/{month}/{year}.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <p className="text-muted-foreground">Loading daily leaderboard data...</p>
        </div>
      </div>
    </main>
  );
} 