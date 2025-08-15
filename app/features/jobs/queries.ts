import { makeSSRClient } from "~/supa-client";

export const getQuests = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data, error } = await client.from("quest_view").select("*");
  if (error) throw error;
  return data;
};

export const getQuestHistory = async (request: Request, profileId: string) => {
  const { client } = makeSSRClient(request);
  const { data, error } = await client.from("quest_view").select("*").eq("profile_id", profileId);
  if (error) throw error;
  return data;
};
