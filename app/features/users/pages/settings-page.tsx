import { Form } from "react-router";
import type { Route } from "./+types/settings-page";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import { useState, useEffect } from "react";
import React from "react";
import { Label } from "~/common/components/ui/label";
import { Input } from "~/common/components/ui/input";
import { Button } from "~/common/components/ui/button";
import { getLoggedInUserId, getUserById } from "../queries";
import { makeSSRClient } from "~/supa-client";
import { z } from "zod";
import { updateUser, updateUserAvatar, updateUserProfile } from "../mutation";


export const meta: Route.MetaFunction = () => {
  return [{ title: "Settings | wemake" }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const user = await getUserById(client, { id: userId });
  return { user };
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  console.log("🚀 SETTINGS ACTION STARTED!");
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
    
    const avatar = formData.get("avatar");
    console.log("🖼️ Avatar data type:", avatar?.constructor?.name);
    console.log("📁 Avatar is File:", avatar instanceof File);
    
    if (avatar instanceof File) {
      console.log("📄 Avatar file details:", {
        name: avatar.name,
        size: avatar.size,
        type: avatar.type
      });
    }
    
    // Handle avatar upload
    if (avatar && avatar instanceof File) {
      console.log("🔄 Processing avatar upload...");
      if (avatar.size <= 2097152 && avatar.type.startsWith("image/")) {
        console.log("✅ Avatar validation passed");
        const { data, error } = await client.storage
          .from("avatars")
          .upload(`${userId}/${Date.now()}`, avatar, {
            contentType: avatar.type,
          });
        if (error) {
          console.error("❌ Storage upload error:", error);
          return { formErrors: { avatar: ["Failed to upload avatar"] } };
        }
        console.log("✅ Avatar uploaded to storage:", data);
        const {
          data: { publicUrl },
        } = await client.storage.from("avatars").getPublicUrl(data.path);
        console.log("🔗 Public URL generated:", publicUrl);
        await updateUserAvatar(client, {
          id: userId,
          avatarUrl: publicUrl,
        });
        console.log("✅ Avatar URL updated in database");
        return { ok: true, newAvatarUrl: publicUrl };
      } else {
        console.log("❌ Avatar validation failed");
        return { formErrors: { avatar: ["Invalid file size or type"] } };
      }
    }
    
    // Handle profile information update
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    
    console.log("📝 Processing profile update...");
    console.log("📋 Profile data:", { name, username });
    
    if (name || username) {
      const { success, error } = formSchema.safeParse({ name, username });
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

export default function SettingsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // 아바타 업로드 성공 후 새로운 아바타 URL을 표시
  const [avatar, setAvatar] = useState<string | null>(loaderData.user.avatar);
  
  // actionData에서 성공 응답이 있으면 페이지 새로고침
  useEffect(() => {
    if (actionData?.ok) {
      // 성공 메시지를 잠시 보여주고 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }, [actionData?.ok]);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setAvatar(URL.createObjectURL(file));
    }
  };
  return (
    <div className="space-y-20">
      <div className="grid grid-cols-6 gap-40">
        <div className="col-span-4 flex flex-col gap-10">
          {actionData?.ok ? (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Your profile has been updated.
            </div>
          ) : null}
          <h2 className="text-2xl font-semibold">Edit profile</h2>
          <Form className="flex flex-col w-1/2 gap-5" method="post">
            <InputPair
              label="Name"
              description="Your public name"
              required
              id="name"
              defaultValue={loaderData.user.name}
              name="name"
              placeholder="John Doe"
            />
            {actionData?.formErrors && "name" in actionData?.formErrors ? (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {actionData.formErrors?.name?.join(", ")}
              </div>
            ) : null}
            <InputPair
              label="Username"
              description="Your unique username"
              required
              id="username"
              defaultValue={loaderData.user.username}
              name="username"
              placeholder="johndoe"
            />
            {actionData?.formErrors && "username" in actionData?.formErrors ? (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {actionData.formErrors?.username?.join(", ")}
              </div>
            ) : null}
            <Button className="w-full">Update profile</Button>
          </Form>
        </div>
        <Form
          className="col-span-2 p-6 rounded-lg border shadow-md"
          method="post"
          action="."
          encType="multipart/form-data"
          onSubmit={(e) => {
            console.log("🎯 AVATAR FORM SUBMIT EVENT!");
            console.log("📝 Form action:", e.currentTarget.action);
            console.log("📋 Form method:", e.currentTarget.method);
            console.log("🌐 Current URL:", window.location.href);
            
            const formData = new FormData(e.currentTarget);
            console.log("📄 Form data keys:", Array.from(formData.keys()));
            
            const avatarFile = formData.get("avatar");
            console.log("🖼️ Avatar file in form:", avatarFile);
            
            if (avatarFile instanceof File) {
              console.log("📁 File details:", {
                name: avatarFile.name,
                size: avatarFile.size,
                type: avatarFile.type
              });
            }
          }}
        >
          <Label className="flex flex-col gap-1">
            Avatar
            <small className="text-muted-foreground">
              This is your public avatar.
            </small>
          </Label>
          <div className="space-y-5">
            <div className="size-40 rounded-full shadow-xl overflow-hidden ">
              {avatar ? (
                <img src={avatar} className="object-cover w-full h-full" />
              ) : null}
            </div>
            <Input
              type="file"
              className="w-1/2"
              onChange={onChange}
              required
              name="avatar"
            />
            {actionData?.formErrors && "avatar" in actionData?.formErrors ? (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {actionData.formErrors.avatar?.join(", ")}
              </div>
            ) : null}
            <div className="flex flex-col text-xs">
              <span className=" text-muted-foreground">
                Recommended size: 128x128px
              </span>
              <span className=" text-muted-foreground">
                Allowed formats: PNG, JPEG
              </span>
              <span className=" text-muted-foreground">Max file size: 1MB</span>
            </div>
            <Button className="w-full">Update avatar</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}