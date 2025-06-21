import type { Route } from "./+types/search-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search Products | dotLife" },
    {
      name: "description",
      content: "Search for products in our community.",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function SearchPage() {
  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Search
      </h1>
    </main>
  );
} 