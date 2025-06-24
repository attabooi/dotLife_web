import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/category-page";
import { CategoryCard } from "../components/category-card";

export const meta: Route.MetaFunction = ({}) => {
  return [
    { title: "Categories | dotLife" },
    {
      name: "description",
      content: "Browse products by categories.",
    },
  ];
};

export default function CategoriesPage() {
  return (
    <div className="space-y-10">
      <HeroSection title="Categories" description="Browse products by categories." />
      <div className="grid grid-cols-4 gap-10">
        {Array.from({ length: 10 }).map((_, index) => (
          <CategoryCard
            key={`category-${index}`}
            id={`category-${index}`}
            name={`Category Name `}
            description={`Category Description `}
          />
        ))}
      </div>
    </div>
  );
} 