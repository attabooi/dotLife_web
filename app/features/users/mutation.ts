import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export const updateUser = async (
  client: SupabaseClient<Database>,
  {
    id,
    name,
    role,
    headline,
    bio,
  }: {
    id: string;
    name: string;
    role: "developer" | "designer" | "marketer" | "founder" | "product-manager";
    headline: string;
    bio: string;
  }
) => {
  const { error } = await client
    .from("profiles")
    .update({ name, role, headline, bio })
    .eq("profile_id", id);
  if (error) {
    throw error;
  }
};

export const updateUserAvatar = async (
  client: SupabaseClient<Database>,
  {
    id,
    avatarUrl,
  }: {
    id: string;
    avatarUrl: string;
  }
) => {

  
  // 먼저 profiles 테이블에서 해당 사용자 찾기
  const { data: profile, error: findError } = await client
    .from("profiles")
    .select("*")
    .eq("profile_id", id)
    .single();
  
  if (findError) {
    console.error("❌ MUTATION: Profile not found error:", findError);
    throw findError;
  }
  

  
  const { error } = await client
    .from("profiles")
    .update({ avatar: avatarUrl })
    .eq("profile_id", id);
  
  if (error) {
    console.error("❌ MUTATION: updateUserAvatar error:", error);
    throw error;
  }
  

  
  // 업데이트 후 확인
  const { data: updatedProfile, error: checkError } = await client
    .from("profiles")
    .select("avatar")
    .eq("profile_id", id)
    .single();
  
  if (checkError) {
    console.error("❌ MUTATION: Check update error:", checkError);
  } else {
  
  }
};

export const updateUserProfile = async (
  client: SupabaseClient<Database>,
  {
    id,
    name,
    username,
  }: {
    id: string;
    name: string;
    username: string;
  }
) => {

  
  const { error } = await client
    .from("profiles")
    .update({ name, username })
    .eq("profile_id", id);
  
  if (error) {
    console.error("❌ MUTATION: updateUserProfile error:", error);
    throw error;
  }
  

};