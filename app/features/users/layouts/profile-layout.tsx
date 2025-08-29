import { Form, Link, NavLink, Outlet, redirect } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button, buttonVariants } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/profile-layout";
import { getUserProfile, updateUserProfile } from "../queries";
import { makeSSRClient } from "~/supa-client";
import { useState } from "react";
import { 
  Trophy, 
  Flame, 
  Zap, 
  Clock, 
  Target,
  TrendingUp,
  Calendar,
  Star
} from "lucide-react";
import { updateUserAvatar } from "../mutation";
import EnhancedBlockStackingGame from "~/features/products/components/enhanced-block-stacking-game";

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: `${data?.user.name} | dotLife` }];
};

export const loader = async ({
  request,
  params,
}: Route.LoaderArgs & { params: { username: string } }) => {
  const { client, headers } = makeSSRClient(request);
  
  // Get current user
  const { data: { user: currentUser } } = await client.auth.getUser();
  
  // Get user profile
  const user = await getUserProfile(client, {
    username: params.username,
  });
  

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && user.profile_id === currentUser.id;

  // Get player stats
  const { data: playerStats } = await client
    .from("player_stats")
    .select("*")
    .eq("profile_id", user.profile_id)
    .single();

  // Get tower stats
  const { data: towerStats } = await client
    .from("tower_stats")
    .select("*")
    .eq("profile_id", user.profile_id)
    .single();

  // Get Quest data
  console.log("=== Quest Data Query ===");
  console.log("Querying daily_quests for profile_id:", user.profile_id);
  console.log("Profile ID type:", typeof user.profile_id);
  console.log("Profile ID value:", user.profile_id);
  
  const { data: questData, error: questDataError } = await client
    .from("daily_quests")
    .select("*")
    .eq("profile_id", user.profile_id);
  
  console.log("Quest data query result:");
  console.log("- Data:", questData);
  console.log("- Error:", questDataError);
  console.log("- Quest count:", questData?.length || 0);

  
  const { data: towerBlocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("x_position, y_position, color, build_date")
    .eq("profile_id", user.profile_id)
    .eq("is_confirmed", true)
    .order("created_at", { ascending: true });
  

  // Transform tower blocks data to match Block interface
  const transformedTowerBlocks = towerBlocks?.map(block => ({
    x: block.x_position,
    y: block.y_position,
    color: block.color,
    date: block.build_date
  })) || [];

  console.log("Transformed tower blocks:", transformedTowerBlocks);
  console.log("user.profile_id:", user.profile_id);
  console.log("questData:", questData);

  // Get quest completion stats
  const { data: questHistory, error: questError } = await client
    .from("quest_history")
    .select("*")
    .eq("profile_id", user.profile_id)
    .order("completion_date", { ascending: false })
    .limit(30); // Last 30 days

  // Calculate stats
  const totalBlocks = transformedTowerBlocks?.length || 0;
  const totalQuests = questHistory?.length || 0;
  const perfectDays = questHistory?.filter(q => q.perfect_day).length || 0;
  const totalBricksEarned = questHistory?.reduce((sum, q) => sum + q.total_bricks_earned, 0) || 0;

  return { 
    user,
    isOwnProfile,
    playerStats: playerStats || {
      level: 1,
      total_xp: 0,
      current_xp: 0,
      xp_to_next_level: 100,
      consecutive_days: 0,
      available_bricks: 20,
      hearts: 1.0
    },
    towerStats: towerStats || {
      total_blocks: 0,
      tower_height: 0,
      tower_width: 0,
      views: 0,
      likes: 0,
      comments: 0
    },
    stats: {
      totalBlocks,
      totalQuests,
      perfectDays,
      totalBricksEarned
    },
    questData: questData || [],
    towerBlocks: transformedTowerBlocks
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const { client } = makeSSRClient(request);
    
    const {
      data: { user },
    } = await client.auth.getUser();
    
    if (!user) {
      return redirect("/auth/login");
    }
    
    const formData = await request.formData();
    
    const avatar = formData.get("avatar");
    
    // Handle avatar upload if file is provided
    if (avatar && avatar instanceof File) {
      if (avatar.size <= 2097152 && avatar.type.startsWith("image/")) {
        const { data, error } = await client.storage
          .from("avatars")
          .upload(user.id, avatar, {
            contentType: avatar.type,
            upsert: true,
          });
        
        if (error) {
          console.error("Storage upload error:", error);
          return { formErrors: { avatar: ["Failed to upload avatar"] } };
        }
        
        const {
          data: { publicUrl },
        } = await client.storage.from("avatars").getPublicUrl(data.path);
        
        await updateUserAvatar(client, {
          id: user.id,
          avatarUrl: publicUrl,
        });
        
        return { ok: true };
      } else {
        return { formErrors: { avatar: ["Invalid file size or type"] } };
      }
    } else {
      // Handle profile information update
      const name = formData.get("name") as string;
      const username = formData.get("username") as string;
      
      await updateUserProfile(client, {
        id: user.id,
        name,
        username,
      });
      
      return { ok: true };
    }
  } catch (error) {
    console.error("Profile layout action error:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    throw error; // Re-throw to see the actual error
  }
};

export default function ProfileLayout({ loaderData }: Route.ComponentProps) {
  const { user, isOwnProfile, playerStats, towerStats, stats, towerBlocks, questData } = loaderData;

  return (
    <div className="space-y-6">
      {/* Profile Header - Compact */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {user.avatar ? (
            <AvatarImage src={user.avatar} />
          ) : (
            <AvatarFallback className="text-xl">
              {user.name[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <Badge variant="outline" className="text-xs font-normal">
              Level {playerStats.level}
            </Badge>
            {isOwnProfile && (
              <Link to="/my/settings">
                <Button variant="outline" className="text-xs font-normal h-6 px-2 py-1">Edit Profile</Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">@{user.username}</span>
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats and Tower Container */}
      <div className="max-w-3xl space-y-0">
        {/* Stats - Compact and minimal above tower */}
        <div className="w-full flex items-center justify-center gap-6 py-1 px-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{stats.totalBlocks}</div>
            <div className="text-xs text-gray-500">Blocks</div>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{questData?.length || 0}</div>
            <div className="text-xs text-gray-500">Quests</div>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">{playerStats.consecutive_days}</div>
            <div className="text-xs text-gray-500">Streak</div>
          </div>
        </div>

        {/* Tower Viewer */}
        <div className="w-full">
          <EnhancedBlockStackingGame 
            initialBlocks={towerBlocks}
            totalBlocks={towerBlocks.length}
            remainingBlocks={0}
            calendarEvents={[]}
            overallRankings={[]}
            currentUserId=""
            readOnly={true}
            username={user.username}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-screen-lg">
        <Outlet
          context={{
            headline: user.headline,
            bio: user.bio,
            playerStats,
            towerStats,
            stats
          }}
        />
      </div>
    </div>
  );
}