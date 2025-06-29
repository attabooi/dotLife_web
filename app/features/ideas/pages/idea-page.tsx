import { EyeIcon, HeartIcon } from "lucide-react";
import { DotIcon } from "lucide-react";
import { HeroSection } from "~/common/components/hero-section";
import { Button } from "~/common/components/ui/button";

export const meta = () => {
  return [{ title: "Idea | dotLife" }];
};

export default function IdeaPage() {
  return (
    <div className="space-y-20">
      <HeroSection title="Idea #11" description="" />
      <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-10">
        <p className="italic text-center">
          A startup that creates an AI-powered generated personal trainer,
          delivering customized fitness routines based on the user's goals and
          preferences using a mobile app to track workouts and progress.
        </p>
        <div className="flex items-center text-sm">
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>123</span>
          </div>
          <DotIcon className="w-4 h-4" />
          <span>12 hours ago</span>
          <DotIcon className="w-4 h-4" />
          <Button variant="outline">
            <HeartIcon className="w-4 h-4" />
            <span className="ml-1">12</span>
          </Button>
          
        </div>
        <Button size="lg">Claim idea now &rarr;</Button>
      </div>
    </div>
  );
}
