import z from "zod";
import type { Route } from "./+types/search-page";
import { HeroSection } from "~/common/components/hero-section";
import { ProductCard } from "../components/product-card";
import ProductPagination from "~/common/components/product-pagination";
import { Form } from "react-router";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";

export const meta: Route.MetaFunction = ({}) => {
  return [
    { title: "Search Products | dotLife" },
    {
      name: "description",
      content: "Search for products in our community.",
    },
  ];
};

const paramsSchema = z.object({
  query: z.string().optional().default(""),
  page: z.coerce.number().optional().default(1),
});

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const { success, data: parsedData } = paramsSchema.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!success) {
    throw new Error("Invalid params");
  }

}

export function action({}: Route.ActionArgs) {
  return {};
}

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <HeroSection title="Search" description="Search for products." />

      <Form className="flex justify-center max-w-screen-sm items-center mx-auto">
        <Input name="query" placeholder="Search for products" className="text-lg"/>
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
}
