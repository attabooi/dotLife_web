import { HeroSection } from "~/common/components/hero-section";
import type { Route } from "./+types/teams-page";
import { TeamCard } from "../components/team-card";

export const meta: Route.MetaFunction = () => [{ title: "Teams | wemake" }];

export default function TeamsPage() {
  return (
    <div className="space-y-20">
      <HeroSection
        title="Teams"
        description="Find a team looking for a new member."
      />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <TeamCard
            key={`teamId-${index}`}
            id={`teamId-${index}`}
            leaderUsername="lynn"
            leaderAvatarUrl="https://github.com/inthetiger.png"
            positions={[
              "React Developer",
              "Backend Developer",
              "Product Manager",
            ]}
            description="a new social media platform"
            joinUrl="/teams/teamId"
          />
        ))}
      </div>
    </div>
  );
}