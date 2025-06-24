import { HeroSection } from "~/common/components/hero-section";
import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import ProductPagination from "~/common/components/product-pagination";
import { ProductCard } from "../components/product-card";
import type { Route } from "./+types/category-page";

export const meta: Route.MetaFunction = ({ params }) => {
  return [
    { title: `Developer Tools | dotLife` },
    {
      name: "description",
      content: `Products in the Developer Tools category.`,
    },
  ];
}

export default function CategoryPage() {
  return (
    <div className="space-y-8">
      <HeroSection title="Develpper Tools" description="Tools for developers." />

      <Form className="flex justify-center max-w-screen-sm items-center mx-auto">
        <Input
          name="query"
          placeholder="Search for products"
          className="text-lg"
        />
        <Button type="submit">Search</Button>
      </Form>

      <div className="space-y-5 w-full max-w-screen-md mx-auto">
        {Array.from({ length: 11 }).map((_, index) => (
          <ProductCard
            key={`product-${index}`}
            id={`product-${index}`}
            name="Product Name"
            description="Product Description"
            commentsCount={12}
            viewsCount={12}
            votesCount={120}
          />
        ))}
      </div>
      <ProductPagination totalPages={10} currentPage={1} />
    </div>
  );
};
