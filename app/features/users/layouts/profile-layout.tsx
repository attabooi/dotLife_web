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

  // Get tower blocks count
  const { data: towerBlocks, error: blocksError } = await client
    .from("tower_blocks")
    .select("block_id")
    .eq("profile_id", user.profile_id)
    .eq("is_confirmed", true);

  // Get quest completion stats
  const { data: questHistory, error: questError } = await client
    .from("quest_history")
    .select("*")
    .eq("profile_id", user.profile_id)
    .order("completion_date", { ascending: false })
    .limit(30); // Last 30 days

  // Calculate stats
  const totalBlocks = towerBlocks?.length || 0;
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
    }
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
  const { user, isOwnProfile, playerStats, towerStats, stats } = loaderData;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <Avatar className="size-32">
          {user.avatar ? (
            <AvatarImage src={user.avatar} />
          ) : (
            <AvatarFallback className="text-3xl">
              {user.name[0]}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{user.name}</h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Blocks</p>
                <p className="text-2xl font-bold">{stats.totalBlocks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Quests Completed</p>
                <p className="text-2xl font-bold">{stats.totalQuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Perfect Days</p>
                <p className="text-2xl font-bold">{stats.perfectDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Tower Height</p>
                <p className="text-2xl font-bold">{towerStats.tower_height}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">XP Progress</span>
              <span className="text-sm font-medium">
                {playerStats.current_xp} / {playerStats.xp_to_next_level}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${(playerStats.current_xp / playerStats.xp_to_next_level) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Available Bricks</span>
              <span className="text-sm font-medium">{playerStats.available_bricks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {playerStats.consecutive_days}
              </p>
              <p className="text-sm text-muted-foreground">Consecutive Days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tower Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Blocks</span>
              <span className="text-sm font-medium">{towerStats.total_blocks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tower Width</span>
              <span className="text-sm font-medium">{towerStats.tower_width}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Views</span>
              <span className="text-sm font-medium">{towerStats.views}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Likes</span>
              <span className="text-sm font-medium">{towerStats.likes}</span>
            </div>
          </CardContent>
        </Card>
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