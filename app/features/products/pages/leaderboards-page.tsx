import type { Route } from "./+types/leaderboards-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Leaderboards | dotLife" },
    {
      name: "description",
      content: "Check out the top performing products across different time periods.",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function LeaderboardsPage() {
  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Leaderboard
      </h1>
    </main>
  );
} 