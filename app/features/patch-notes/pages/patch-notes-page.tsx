import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { HeroSection } from "~/common/components/hero-section";
import { useState } from "react";
import { Textarea } from "~/common/components/ui/textarea";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";

import type { Route } from "./+types/patch-notes-page";
import { redirect } from "react-router";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Tag,
  User,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";
import { makeSSRClient } from "~/supa-client";
import {
  getPublishedPatchNotes,
  getAllPatchNotes,
  createPatchNote,
  updatePatchNote,
  deletePatchNote,
} from "../queries";

export const meta = () => {
  return [
    { title: "Patch Notes | dotLife" },
    {
      name: "description",
      content: "Latest updates and improvements to dotLife",
    },
  ];
};

export const loader = async ({ request }: Route["LoaderArgs"]) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  let patchNotes = [];
  let isAdmin = false;

  if (user) {
    // Check if user is admin (replace with your admin user ID)
    isAdmin = user.id === 'b6327126-79ae-4dac-8f2a-d1a6f3931ded';

    if (isAdmin) {
      // Admin sees all patch notes
      patchNotes = await getAllPatchNotes(request);
    } else {
      // Regular users see only published patch notes
      patchNotes = await getPublishedPatchNotes(request);
    }
  } else {
    // Non-logged in users see only published patch notes
    patchNotes = await getPublishedPatchNotes(request);
  }

  return {
    patchNotes,
    isAdmin,
  };
};

export const action = async ({ request }: Route["ActionArgs"]) => {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  try {
    if (action === "create") {
      const version = formData.get("version") as string;
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const release_date = formData.get("release_date") as string;
      const is_published = formData.get("is_published") === "true";

      await createPatchNote(request, {
        version,
        title,
        content,
        release_date,
        is_published,
      });
    } else if (action === "update") {
      const id = Number(formData.get("id"));
      const version = formData.get("version") as string;
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const release_date = formData.get("release_date") as string;
      const is_published = formData.get("is_published") === "true";

      await updatePatchNote(request, id, {
        version,
        title,
        content,
        release_date,
        is_published,
      });
    } else if (action === "delete") {
      const id = Number(formData.get("id"));
      await deletePatchNote(request, id);
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
};

export default function PatchNotesPage({ loaderData }: Route["ComponentProps"]) {
  const { patchNotes, isAdmin } = loaderData || {};

  // Local state for forms
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPatchNote, setNewPatchNote] = useState({
    version: "",
    title: "",
    content: "",
    release_date: new Date().toISOString().split("T")[0],
    is_published: false,
  });
  const [editPatchNote, setEditPatchNote] = useState({
    version: "",
    title: "",
    content: "",
    release_date: "",
    is_published: false,
  });

  const handleCreate = () => {
    setIsCreating(true);
    setNewPatchNote({
      version: "",
      title: "",
      content: "",
      release_date: new Date().toISOString().split("T")[0],
      is_published: false,
    });
  };

  const handleEdit = (patchNote: any) => {
    setEditingId(patchNote.id);
    setEditPatchNote({
      version: patchNote.version,
      title: patchNote.title,
      content: patchNote.content,
      release_date: patchNote.release_date,
      is_published: patchNote.is_published,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  if (!loaderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="w-full px-0 pt-16 pb-4 md:pt-20 md:pb-8">
        {/* Debug info - remove this later */}
        <div className="px-4 md:px-6 max-w-4xl mx-auto mb-4">
          <div className="bg-yellow-100 p-4 rounded-lg">
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {loaderData?.isAdmin ? 'Admin' : 'Not Admin'}</p>
            <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
            <p>Patch Notes Count: {patchNotes?.length || 0}</p>
          </div>
        </div>
        
        <HeroSection
          title="Patch Notes"
          description="Latest updates and improvements to dotLife"
        />

        <div className="space-y-6 md:space-y-8 px-4 md:px-6 max-w-4xl mx-auto">
          {/* Admin Controls */}
          {isAdmin && (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Tag className="w-5 h-5" />
                    Admin Controls
                  </CardTitle>
                  {!isCreating && (
                    <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="w-4 h-4 mr-2" />
                      New Patch Note
                    </Button>
                  )}
                </div>
              </CardHeader>
              {isCreating && (
                <CardContent>
                  <form method="post" className="space-y-4">
                    <input type="hidden" name="action" value="create" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="version">Version</Label>
                        <Input
                          id="version"
                          name="version"
                          value={newPatchNote.version}
                          onChange={(e) =>
                            setNewPatchNote({ ...newPatchNote, version: e.target.value })
                          }
                          placeholder="e.g., 1.2.0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="release_date">Release Date</Label>
                        <Input
                          id="release_date"
                          name="release_date"
                          type="date"
                          value={newPatchNote.release_date}
                          onChange={(e) =>
                            setNewPatchNote({ ...newPatchNote, release_date: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={newPatchNote.title}
                        onChange={(e) =>
                          setNewPatchNote({ ...newPatchNote, title: e.target.value })
                        }
                        placeholder="Brief description of the update"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={newPatchNote.content}
                        onChange={(e) =>
                          setNewPatchNote({ ...newPatchNote, content: e.target.value })
                        }
                        placeholder="Detailed description of changes..."
                        rows={6}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_published"
                        name="is_published"
                        checked={newPatchNote.is_published}
                        onCheckedChange={(checked) =>
                          setNewPatchNote({ ...newPatchNote, is_published: checked as boolean })
                        }
                      />
                      <Label htmlFor="is_published">Publish immediately</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-500 hover:bg-green-600">
                        <Save className="w-4 h-4 mr-2" />
                        Create
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>
          )}

          {/* Patch Notes List */}
          <div className="space-y-4">
            {patchNotes.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-16 text-center">
                  <div className="space-y-4">
                    <Tag className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No patch notes yet
                      </h3>
                      <p className="text-gray-600">
                        {isAdmin
                          ? "Create your first patch note to keep users updated!"
                          : "Check back later for updates!"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              patchNotes.map((patchNote: any) => {
                const isEditing = editingId === patchNote.id;

                return (
                  <Card
                    key={patchNote.id}
                    className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out rounded-xl ${
                      !patchNote.is_published ? "border-orange-300 bg-orange-50/80" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {isEditing ? (
                            <form method="post" className="space-y-4">
                              <input type="hidden" name="action" value="update" />
                              <input type="hidden" name="id" value={patchNote.id} />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`version-${patchNote.id}`}>Version</Label>
                                  <Input
                                    id={`version-${patchNote.id}`}
                                    name="version"
                                    value={editPatchNote.version}
                                    onChange={(e) =>
                                      setEditPatchNote({ ...editPatchNote, version: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`release_date-${patchNote.id}`}>Release Date</Label>
                                  <Input
                                    id={`release_date-${patchNote.id}`}
                                    name="release_date"
                                    type="date"
                                    value={editPatchNote.release_date}
                                    onChange={(e) =>
                                      setEditPatchNote({ ...editPatchNote, release_date: e.target.value })
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`title-${patchNote.id}`}>Title</Label>
                                <Input
                                  id={`title-${patchNote.id}`}
                                  name="title"
                                  value={editPatchNote.title}
                                  onChange={(e) =>
                                    setEditPatchNote({ ...editPatchNote, title: e.target.value })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`content-${patchNote.id}`}>Content</Label>
                                <Textarea
                                  id={`content-${patchNote.id}`}
                                  name="content"
                                  value={editPatchNote.content}
                                  onChange={(e) =>
                                    setEditPatchNote({ ...editPatchNote, content: e.target.value })
                                  }
                                  rows={6}
                                  required
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`is_published-${patchNote.id}`}
                                  name="is_published"
                                  checked={editPatchNote.is_published}
                                  onCheckedChange={(checked) =>
                                    setEditPatchNote({ ...editPatchNote, is_published: checked as boolean })
                                  }
                                />
                                <Label htmlFor={`is_published-${patchNote.id}`}>Published</Label>
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit" size="sm">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancel}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                  v{patchNote.version}
                                </Badge>
                                {!patchNote.is_published && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Draft
                                  </Badge>
                                )}
                                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(patchNote.release_date).toLocaleDateString()}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl">{patchNote.title}</CardTitle>
                                                             <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                 <User className="w-4 h-4" />
                                 <span>
                                   by Admin
                                 </span>
                               </div>
                            </>
                          )}
                        </div>
                        {isAdmin && !isEditing && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(patchNote)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <form method="post" className="inline">
                              <input type="hidden" name="action" value="delete" />
                              <input type="hidden" name="id" value={patchNote.id} />
                              <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  if (!confirm("Are you sure you want to delete this patch note?")) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </form>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {!isEditing && (
                      <CardContent className="pt-0">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {patchNote.content}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
