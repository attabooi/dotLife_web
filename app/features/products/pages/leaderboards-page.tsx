import { Link } from "react-router";
import type { Route } from "./+types/leaderboards-page";
import { HeroSection } from "~/common/components/hero-section";
import { ProductCard } from "../components/product-card";
import { Button } from "~/common/components/ui/button";
import EnhancedBlockStackingGame from "../components/enhanced-block-stacking-game";
import { makeSSRClient } from "~/supa-client";
import { redirect } from "react-router";
import { 
  loadUserTower, 
  saveBlocksBatch, 
  saveBlock,
  confirmBlocks, 
  loadCalendarData, 
  loadDateDetails, 
  getOverallLeaderboard,
  resetTower,
  loadTowerHistory
} from "../queries";

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

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  try {
    // Load user profile
    const { data: userProfile, error: profileError } = await client
      .from("profiles")
      .select("name, username, avatar")
      .eq("profile_id", user.id)
      .single();

    if (profileError) throw profileError;

    // Load player stats - with error handling
    let playerStats = null;
    try {
      const { data: stats, error: statsError } = await client
        .from("player_stats")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (!statsError) {
        playerStats = stats;
      }
    } catch (error) {
      // Player stats not found, using defaults
    }

    // Load tower data using our query function
    const towerData = await loadUserTower(request, user.id);

    // Load calendar data
    const currentDate = new Date();
    const calendarData = await loadCalendarData(
      request, 
      user.id, 
      currentDate.getFullYear(), 
      currentDate.getMonth() + 1
    );

    // Load overall rankings (limited to top 20 for performance)
    let overallRankings: any[] = [];
    try {
      overallRankings = await getOverallLeaderboard(request, 20);
    } catch (error) {
      // If rankings fail, continue without them
    }

    const result = {
      userProfile,
      userId: user.id,
      playerStats,
      towerBlocks: towerData.blocks,
      totalBlocks: towerData.totalBlocks,
      remainingBlocks: towerData.remainingBlocks,
      calendarEvents: calendarData,
      overallRankings,
    };

    return result;
  } catch (error) {
    console.error("Tower loader error:", error);
    return {
      userProfile: null,
      userId: '',
      playerStats: null,
      towerBlocks: [],
      totalBlocks: 20,
      remainingBlocks: 20,
      calendarEvents: [],
      overallRankings: [],
    };
  }
};

// Action for handling tower operations
export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    switch (action) {
      case "save-blocks":
        const sessionId = formData.get("sessionId") as string;
        const blockData = JSON.parse(formData.get("blockData") as string);
        await saveBlock(request, user.id, blockData);
        return { success: true, message: "Block saved" };

      case "save-blocks-batch":
        const batchSessionId = formData.get("sessionId") as string;
        const blockDataArray = JSON.parse(formData.get("blockData") as string);
        await saveBlocksBatch(request, user.id, batchSessionId, blockDataArray);
        return { success: true, message: "Blocks saved" };

      case "confirm-blocks":
        const confirmSessionId = formData.get("sessionId") as string;
        await confirmBlocks(request, user.id, confirmSessionId);
        return { success: true, message: "Blocks confirmed" };

      case "reset-tower":
        await resetTower(request, user.id);
        return { success: true, message: "Tower reset" };

      case "load-history":
        const history = await loadTowerHistory(request, user.id);
        return { success: true, history };

      case "load-date-details":
        const date = formData.get("date") as string;
        const dateDetails = await loadDateDetails(request, user.id, date);
        return { success: true, ...dateDetails };

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Tower action error:", error);
    return { error: "Operation failed" };
  }
};

export default function MyTowerPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      <HeroSection
        title="My Tower"
        description="Build your pixel tower and track your quest completion history"
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <EnhancedBlockStackingGame 
          initialBlocks={loaderData.towerBlocks}
          totalBlocks={loaderData.totalBlocks}
          remainingBlocks={loaderData.remainingBlocks}
          calendarEvents={loaderData.calendarEvents}
          overallRankings={loaderData.overallRankings}
          currentUserId={loaderData.userId}
        />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error("Tower page error:", error);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-4">
          We encountered an error while loading your tower. Please try refreshing the page.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
