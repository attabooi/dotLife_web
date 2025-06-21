import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { Avatar, AvatarImage } from "~/common/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

interface TeamCardProps {
  id: string;
  leaderUsername: string;
  leaderAvatarUrl: string;
  positions: string[];
  description: string;
  joinUrl: string;
}

export function TeamCard({
  leaderUsername,
  leaderAvatarUrl,
  positions,
  description,
  joinUrl,
}: TeamCardProps) {
  return (
    <Card className="bg-transparent hover:bg-card/50 transition-colors">
      <CardHeader className="flex flex-row items-center">
        <CardTitle className="text-base leading-loose">
          <Badge
            variant="secondary"
            className="inline-flex shadow-sm items-center"
          >
            <span>@{leaderUsername}</span>
            <Avatar className="size-5 ml-1">
              <AvatarFallback>
                {leaderUsername.charAt(0).toUpperCase()}
              </AvatarFallback>
              <AvatarImage src={leaderAvatarUrl} />
            </Avatar>
          </Badge>
          <span className="text-sm text-muted-foreground ml-2">is looking for</span>
          {positions.map((position) => (
            <Badge className="text-base ">
              {position}
            </Badge>
          ))}
          <span className="ml-2">to build</span>
          <span> {description}</span>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Button variant="link" asChild>
          <Link to={joinUrl}>Join Team &rarr;</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
