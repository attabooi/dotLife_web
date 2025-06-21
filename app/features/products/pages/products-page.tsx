import type { Route } from "./+types/products-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Products | dotLife" },
    {
      name: "description",
      content: "Browse all products from our community.",
    },
  ];
}

export function loader({}: Route.LoaderArgs) {
  return {};
}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function ProductsPage() {
  return (
    <main className="px-20 py-8">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        Products
      </h1>
    </main>
  );
} 