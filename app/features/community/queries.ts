import type { SupabaseClient } from "@supabase/supabase-js";


export async function getRankings(client: SupabaseClient) {
    const { data, error } = await client
      .from("ranking_view")
      .select("")
    if (error) throw error;
    return data ?? [];
  }


export async function getLeaderboard(client: SupabaseClient) {
  const { data: rankings } = await client
    .from("leaderboard_view")
    .select("*")
    .order("total_bricks", { ascending: false })
    .limit(50);

  return rankings ?? [];
}
