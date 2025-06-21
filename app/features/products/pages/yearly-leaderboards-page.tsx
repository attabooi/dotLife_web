import type { Route } from "./+types/yearly-leaderboards-page";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.year} Yearly Leaderboard | dotLife` },
    {
      name: "description",
      content: `Top performing products for the year ${params.year}.`,
    },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  return { year: params.year };
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function YearlyLeaderboardsPage({ loaderData }: Route.ComponentProps) {
  const { year } = loaderData || { year: '' };

  return (
    <main className="px-20 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            {year} Yearly Leaderboard
          </h1>
          <p className="text-xl font-light text-foreground mt-4">
            Top performing products for the year {year}.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <p className="text-muted-foreground">Loading yearly leaderboard data...</p>
        </div>
      </div>
    </main>
  );
} 