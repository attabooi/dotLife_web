import client from "~/supa-client";

export const getQuests = async () => {
  const { data, error } = await client.from("quest_view").select("*");
  if (error) throw error;
  return data;
};

export const getQuestHistory = async (profileId: string) => {
  const { data, error } = await client.from("quest_view").select("*").eq("profile_id", profileId);
  if (error) throw error;
  return data;
};
