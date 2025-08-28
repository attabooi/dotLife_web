import { makeSSRClient } from "~/supa-client";

// Get all published patch notes
export const getPublishedPatchNotes = async (request: Request) => {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("patch_notes")
    .select("*")
    .eq("is_published", true)
    .order("release_date", { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Get all patch notes (admin only)
export const getAllPatchNotes = async (request: Request) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Check if user is admin (replace with your admin user ID)
  if (user.id !== 'b6327126-79ae-4dac-8f2a-d1a6f3931ded') {
    throw new Error("Admin access required");
  }
  
  const { data, error } = await client
    .from("patch_notes")
    .select("*")
    .order("release_date", { ascending: false });
    
  if (error) throw error;
  return data || [];
};

// Create new patch note (admin only)
export const createPatchNote = async (request: Request, patchNoteData: {
  version: string;
  title: string;
  content: string;
  release_date: string;
  is_published: boolean;
}) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Check if user is admin (replace with your admin user ID)
  if (user.id !== 'b6327126-79ae-4dac-8f2a-d1a6f3931ded') {
    throw new Error("Admin access required");
  }
  
  const { data, error } = await client
    .from("patch_notes")
    .insert(patchNoteData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Update patch note (admin only)
export const updatePatchNote = async (request: Request, id: number, updates: {
  version?: string;
  title?: string;
  content?: string;
  release_date?: string;
  is_published?: boolean;
}) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Check if user is admin (replace with your admin user ID)
  if (user.id !== 'b6327126-79ae-4dac-8f2a-d1a6f3931ded') {
    throw new Error("Admin access required");
  }
  
  const { data, error } = await client
    .from("patch_notes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Delete patch note (admin only)
export const deletePatchNote = async (request: Request, id: number) => {
  const { client } = makeSSRClient(request);
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  
  // Check if user is admin (replace with your admin user ID)
  if (user.id !== 'b6327126-79ae-4dac-8f2a-d1a6f3931ded') {
    throw new Error("Admin access required");
  }
  
  const { error } = await client
    .from("patch_notes")
    .delete()
    .eq("id", id);
    
  if (error) throw error;
  return { success: true };
};

// Get single patch note
export const getPatchNote = async (request: Request, id: number) => {
  const { client } = makeSSRClient(request);
  
  const { data, error } = await client
    .from("patch_notes")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) throw error;
  return data;
};
