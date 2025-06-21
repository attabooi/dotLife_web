import { Link } from "react-router";
import {
  Card,
  CardDescription,
  CardTitle,
} from "~/common/components/ui/card";
import {
  ChevronUpIcon,
  EyeIcon,
  MessageCircleIcon,
} from "lucide-react";
import { Button } from "~/common/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  commentsCount: number;
  viewsCount: number;
  votesCount: number;
}

export function ProductCard({
  id,
  name,
  description,
  commentsCount,
  viewsCount,
  votesCount,
}: ProductCardProps) {
  return (
    <Link to={`/products/${id}`} className="block h-full">
      <Card className="flex flex-row w-full h-full items-center justify-between bg-card p-4">
        {/* Main Content */}
        <div>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
            {name}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            {description}
          </CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-px text-xs text-muted-foreground">
              <MessageCircleIcon className="w-4 h-4 mr-1" />
              <span>{commentsCount}</span>
            </div>
            <div className="flex items-center gap-px text-xs text-muted-foreground">
              <EyeIcon className="w-4 h-4 mr-1" />
              <span>{viewsCount}</span>
            </div>
          </div>
        </div>

        {/* Vote Button */}
        <div>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-14 w-12"
          >
            <ChevronUpIcon className="size-4 shrink-0" />
            <span>{votesCount}</span>
          </Button>
        </div>
      </Card>
    </Link>
  );
} 