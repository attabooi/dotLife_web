import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Textarea } from "~/common/components/ui/textarea";
import { Link } from "react-router";
import type { Route } from "./+types/product-review-page";

export function loader({ params }: Route.LoaderArgs) {
  // TODO: Fetch product data from database using params.productId
  return {
    product: {
      id: params.productId,
      name: "Product Name",
      tagline: "An amazing product that solves problems",
    },
  };
}

export function action({ params }: Route.ActionArgs) {
  // TODO: Handle review submission
  return { success: true };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const product = data?.product;
  return [
    { title: `Review ${product?.name || "Product"} | dotLife` },
    {
      name: "description",
      content: `Write a review for ${product?.name || "this product"}.`,
    },
  ];
};

export default function ProductReviewPage({ loaderData, actionData }: Route.ComponentProps) {
  const { product } = loaderData;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Write a Review</h1>
        <p className="text-muted-foreground">
          Share your experience with <strong>{product.name}</strong>
        </p>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
      </div>

      {actionData?.success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <p className="text-green-800 text-center">
              Thank you! Your review has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select name="rating" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                  <SelectItem value="2">⭐⭐ Fair</SelectItem>
                  <SelectItem value="1">⭐ Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Summarize your experience"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Tell others about your experience with this product..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" size="lg">
                Submit Review
              </Button>
              
              <Button variant="outline" asChild>
                <Link to={`/products/${product.id}/reviews`}>
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 