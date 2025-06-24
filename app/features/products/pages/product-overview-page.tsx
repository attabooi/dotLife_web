import { ChevronUpIcon, StarIcon } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/product-overview-page";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Product Overview" },
    { name: "description", content: "Product overview page" },
  ];
}

export default function ProductOverviewPage({
    params: { productId },  
}: Route.ComponentProps) {
  return (

      <div className="space-y-10">
        <div className="space-y-1">
            <h3 className="text-lg font-bold">Waht is this product?</h3>
            <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
                quos.
            </p>        
        </div>
        <div className="space-y-1">
            <h3 className="text-lg font-bold">How does it work?</h3>
            <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
                quos.
            </p>
        </div>
      </div>
  );
}
