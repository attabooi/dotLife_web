import type { Route } from "./+types/profile-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "../queries";
import { updateUserProfile } from "../mutation";
import { z } from "zod";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Profile | wemake" }];
};

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const { client } = makeSSRClient(request);
    
    const userId = await getLoggedInUserId(client);
    
    const formData = await request.formData();
    
    // Handle profile information update
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    
    if (name || username) {
      const { success, error } = profileSchema.safeParse({ name, username });
      if (!success) {
        return { formErrors: error.flatten().fieldErrors };
      }
      
      await updateUserProfile(client, {
        id: userId,
        name,
        username,
      });
      
      return { ok: true };
    }
    
    return { formErrors: { general: ["No valid data provided"] } };
  } catch (error) {
    console.error("Profile action error:", error);
    throw error;
  }
};

export default function ProfilePage() {
  return (
    <div className="max-w-screen-md flex flex-col space-y-10">
      {/* Headline과 About 섹션 제거 */}
    </div>
  );
}