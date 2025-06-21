import type { Route } from "./+types/monthly-leaderboards-page";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.month}/${params.year} Monthly Leaderboard | dotLife` },
    {
      name: "description",
      content: `Top performing products for ${params.month}/${params.year}.`,
    },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  return { year: params.year, month: params.month };
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function MonthlyLeaderboardsPage({ loaderData }: Route.ComponentProps) {
  const { year, month } = loaderData;

  return (
    <main className="px-20 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            {month}/{year} Monthly Leaderboard
          </h1>
          <p className="text-xl font-light text-foreground mt-4">
            Top performing products for {month}/{year}.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <p className="text-muted-foreground">Loading monthly leaderboard data...</p>
        </div>
      </div>
    </main>
  );
} 