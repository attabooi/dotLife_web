import type { Route } from "./+types/promote-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Promote Product | dotLife" },
    {
      name: "description",
      content: "Promote your product to gain more visibility.",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function PromotePage() {
  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Promote
      </h1>
    </main>
  );
} 