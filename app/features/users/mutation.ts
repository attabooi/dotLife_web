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
  console.log("🔄 MUTATION: updateUserAvatar called");
  console.log("👤 User ID:", id);
  console.log("🖼️ Avatar URL:", avatarUrl);
  
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
  
  console.log("📋 Found profile:", profile);
  
  const { error } = await client
    .from("profiles")
    .update({ avatar: avatarUrl })
    .eq("profile_id", id);
  
  if (error) {
    console.error("❌ MUTATION: updateUserAvatar error:", error);
    throw error;
  }
  
  console.log("✅ MUTATION: updateUserAvatar success");
  
  // 업데이트 후 확인
  const { data: updatedProfile, error: checkError } = await client
    .from("profiles")
    .select("avatar")
    .eq("profile_id", id)
    .single();
  
  if (checkError) {
    console.error("❌ MUTATION: Check update error:", checkError);
  } else {
    console.log("✅ MUTATION: Updated avatar in DB:", updatedProfile?.avatar);
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
  console.log("🔄 MUTATION: updateUserProfile called");
  console.log("👤 User ID:", id);
  console.log("📝 Profile data:", { name, username });
  
  const { error } = await client
    .from("profiles")
    .update({ name, username })
    .eq("profile_id", id);
  
  if (error) {
    console.error("❌ MUTATION: updateUserProfile error:", error);
    throw error;
  }
  
  console.log("✅ MUTATION: updateUserProfile success");
};