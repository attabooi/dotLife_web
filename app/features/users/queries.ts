import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "react-router";

export const getUserProfile = async (
  client: SupabaseClient<any>,
  { username }: { username: string }
) => {
  const { data, error } = await client
    .from("profiles")
    .select(
      `
        profile_id,
        name,
        username,
        avatar,
        role,
        headline,
        bio
        `
    )
    .eq("username", username)
    .single();
  if (error) {
    throw error;
  }
  return data;
};

export const getUserById = async (
  client: SupabaseClient<any>,
  { id }: { id: string }
) => {
  const { data, error } = await client
    .from("profiles")
    .select(
      `
        profile_id,
        name,
        username,
        avatar 
        `
    )
    .eq("profile_id", id)
    .single();
  if (error) {
    throw error;
  }
  return data;
};


export const getUserPosts = async (
  client: SupabaseClient<any>,
  { username }: { username: string }
) => {
  const { data, error } = await client
    .from("ranking_view")
    .select("*")
    .eq("author_username", username);
  if (error) {
    throw error;
  }
  return data;
};

export const getLoggedInUserId = async (client: SupabaseClient<any>) => {
  const { data, error } = await client.auth.getUser();
  if (error || data.user === null) {
    throw redirect("/auth/login");
  }
  return data.user.id;
};

export const updateUserProfile = async (
  client: SupabaseClient<any>,
  {
    id,
    name,
    username,
    avatar,
  }: {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
  }
) => {
  const updateData: any = {
    name,
    username,
    updated_at: new Date().toISOString(),
  };
  
  if (avatar !== undefined) {
    updateData.avatar = avatar;
  }
  
  const { data, error } = await client
    .from("profiles")
    .update(updateData)
    .eq("profile_id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};


