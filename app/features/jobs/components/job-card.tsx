import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";

interface JobCardProps {
  id: string;
  company: string;
  companyLogoUrl: string;
  companyHq: string;
  title: string;
  postedAt: string;
  type: string;
  positionLocation: string;
  salary: string;
  applyUrl: string;
}

export function JobCard({
  company,
  companyLogoUrl,
  companyHq,
  title,
  postedAt,
  type,
  positionLocation,
  salary,
  applyUrl,
}: JobCardProps) {
  return (
    <Card className="bg-transparent hover:bg-card/50 transition-colors flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <img
            src={companyLogoUrl}
            alt="Company Logo"
            className="size-10 rounded-full"
          />
          <div>
            <span className="text-accent-foreground font-semibold">
              {company}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {postedAt}
            </span>
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent >
          <Badge variant="outline">{type}</Badge>
          <Badge variant="outline">{positionLocation}</Badge>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{salary}</p>
          <p className="text-sm font-medium text-muted-foreground">{companyHq}</p>
        </div>
        <Button variant="secondary" size="sm">
          Apply now
        </Button>
      </CardFooter>
    </Card>
  );
} 