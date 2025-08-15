import { makeSSRClient } from "~/supa-client";

export const checkUsernameExists = async (
  request: Request,
  { username }: { username: string }
) => {
  const { client } = makeSSRClient(request);
  const { error } = await client
    .from("profiles")
    .select("profile_id")
    .eq("username", username)
    .single();
  if (error) {
    console.error("Error checking username:", error);
    // 권한 에러인 경우 false 반환 (사용 가능한 것으로 간주)
    if (error.code === '42501') {
      return false;
    }
    return false;
  }
  return true;
};