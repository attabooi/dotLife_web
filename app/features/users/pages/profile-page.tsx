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
  console.log("🚀 PROFILE PAGE ACTION STARTED!");
  console.log("📝 Request method:", request.method);
  console.log("🌐 Request URL:", request.url);
  
  try {
    const { client } = makeSSRClient(request);
    console.log("✅ Client created");
    
    const userId = await getLoggedInUserId(client);
    console.log("👤 User ID:", userId);
    
    const formData = await request.formData();
    console.log("📋 FormData received");
    
    // Log all form data keys
    const formDataKeys = Array.from(formData.keys());
    console.log("🔑 Form data keys:", formDataKeys);
    
    // Handle profile information update
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    
    console.log("📝 Processing profile update...");
    console.log("📋 Profile data:", { name, username });
    
    if (name || username) {
      const { success, error } = profileSchema.safeParse({ name, username });
      if (!success) {
        console.log("❌ Profile validation failed:", error.flatten().fieldErrors);
        return { formErrors: error.flatten().fieldErrors };
      }
      
      console.log("✅ Profile validation passed, calling updateUserProfile...");
      await updateUserProfile(client, {
        id: userId,
        name,
        username,
      });
      
      console.log("✅ Profile updated successfully");
      return { ok: true };
    }
    
    console.log("❌ No valid data provided");
    return { formErrors: { general: ["No valid data provided"] } };
  } catch (error) {
    console.error("💥 ACTION ERROR:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
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