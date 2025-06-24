import { StarIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";

interface ReviewCardProps {
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
}

export function ReviewCard({ author, rating, content, createdAt }: ReviewCardProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          <AvatarImage src={author.avatar} />
        </Avatar>
        <div>
          <h4 className="text-lg font-bold">{author.name}</h4>
          <p className="text-sm text-muted-foreground">@{author.username}</p>
        </div>
      </div>
      <div className="flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon 
            key={index}
            className="size-4" 
            fill={index < rating ? "currentColor" : "none"} 
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{content}</p>
      <span className="text-xs text-muted-foreground">{createdAt}</span>
    </div>
  );
} 