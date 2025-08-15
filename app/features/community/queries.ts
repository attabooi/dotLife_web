import type { SupabaseClient } from "@supabase/supabase-js";


export async function getRankings(client: SupabaseClient) {
    const { data, error } = await client
      .from("ranking_view")
      .select("")
    if (error) throw error;
    return data ?? [];
  }