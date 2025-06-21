import type { Route } from "./+types/category-page";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.category} | dotLife` },
    {
      name: "description",
      content: `Products in the ${params.category} category.`,
    },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  return { category: params.category };
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  const { category } = loaderData || { category: '' };

  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        {category}
      </h1>
    </main>
  );
} 