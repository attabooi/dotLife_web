import type { Route } from "./+types/categories-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Categories | dotLife" },
    {
      name: "description",
      content: "Browse products by categories.",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function CategoriesPage() {
  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Categories
      </h1>
    </main>
  );
} 