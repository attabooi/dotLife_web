import { Button } from "~/common/components/ui/button";
import { JobCard } from "../components/job-card";
import { HeroSection } from "~/common/components/hero-section";
import { JOB_TYPES, LOCATION_TYPES, SALARY_TYPES } from "../constants";
import { Link, useSearchParams } from "react-router";
import { cn } from "~/lib/utils";

export const meta = () => {
  return [
    { title: "Jobs | dotLife" },
    {
      name: "description",
      content: "Find your next opportunity in tech jobs.",
    },
  ];
};

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const onFilterClick = (key: string, value: string) => {
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-20">
      <HeroSection
        title="Jobs"
        description="Find your next opportunity in tech jobs."
      />
      <div className="grid grid-cols-6 gap-20 items-start">
        <div className="grid grid-cols-3 col-span-4 gap-5">
          {Array.from({ length: 20 }).map((_, index) => (
            <JobCard
              key={`job-${index}`}
              id={`job-${index}`}
              company="Tesla"
              companyLogoUrl="https://github.com/facebook.png"
              companyHq="San Francisco, CA"
              title="Software Engineer"
              postedAt="12 hours ago"
              type="Full-time"
              positionLocation="Remote"
              salary="$100,000 - $120,000"
              applyUrl="/jobs/jobId"
            />
          ))}
        </div>
        <div className="col-span-2 sticky top-20">
          <div className="flex flex-col items-start gap-2.5">
            <h4 className="text-sm text-muted-foreground font-bold">Type</h4>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <Button
                  variant={"outline"}
                  onClick={() => onFilterClick("type", type.value)}
                  className={cn(
                    type.value === searchParams.get("type")
                      ? "bg-accent"
                      : "bg-background"
                  )}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <h4 className="text-sm text-muted-foreground font-bold">
              Location
            </h4>
            <div className="flex flex-wrap gap-2">
              {LOCATION_TYPES.map((location) => (
                <Button
                  variant={"outline"}
                  onClick={() => onFilterClick("location", location.value)}
                  className={cn(
                    location.value === searchParams.get("location")
                      ? "bg-accent"
                      : "bg-background"
                  )}
                >
                  {location.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <h4 className="text-sm text-muted-foreground font-bold">
              Salary Range
            </h4>
            <div className="flex flex-wrap gap-2">
              {SALARY_TYPES.map((range) => (
                <Button
                  variant={"outline"}
                  onClick={() => onFilterClick("range", range)}
                  className={cn(
                    range === searchParams.get("range")
                      ? "bg-accent"
                      : "bg-background"
                  )}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
