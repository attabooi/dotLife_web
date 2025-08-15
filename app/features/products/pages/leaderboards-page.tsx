import { Link } from "react-router";
import type { Route } from "./+types/leaderboards-page";
import { HeroSection } from "~/common/components/hero-section";
import { ProductCard } from "../components/product-card";
import { Button } from "~/common/components/ui/button";
import BlockStackingGame from "../components/block-stacking-game";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "My Tower | dotLife" },
    {
      name: "description",
      content:
        "Build your pixel tower and track your quest completion history.",
    },
  ];
};

export default function MyTowerPage() {
  return (
    <div className="space-y-8">
      <HeroSection
        title="My Tower"
        description="Build your pixel tower and track your quest completion history"
      />
      
      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto">
        <BlockStackingGame />
      </div>
    </div>
  );
}
