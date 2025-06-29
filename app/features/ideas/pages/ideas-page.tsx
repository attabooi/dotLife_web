import { HeroSection } from "~/common/components/hero-section";
import { IdeaCard } from "../components/idea-card";

export const meta = () => {
  return [
    { title: "IdeasGPT | dotLife" },
    {
      name: "description",
      content:
        "IdeasGPT is a tool that helps you generate ideas for your business.",
    },
  ];
};

export default function IdeasPage() {
  return (
    <div>
      <HeroSection
        title="IdeasGPT"
        description="IdeasGPT is a tool that helps you generate ideas for your business."
      />
      <div className="space-y-10">
        <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 11 }).map((_, index) => (
          <IdeaCard
            key={`idea-${index}`}
            id={`idea-${index}`}
            title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness routines based on the user's goals and preferences using a mobile app to track workouts and progress."
              views={123}
              postedAt="12 hours ago"
              likesCount={12}
              claimed={index % 2 === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
