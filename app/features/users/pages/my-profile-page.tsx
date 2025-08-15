
import { redirect } from "react-router";
import type { Route } from "./+types/my-profile-page";
import { makeSSRClient } from "~/supa-client";
import { getUserById } from "../queries";

export async function loader({ request }: Route.LoaderArgs) {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user) {
    const profile = await getUserById(client, { id: user.id });
    return redirect(`/users/${profile.username}`);
  }
  return redirect("/auth/login");
}

// export const meta = () => [
//   { title: "My Profile | dotLife" },
//   { name: "description", content: "View and edit your profile." },
// ];

// export default function MyProfilePage() {
//   return (
//     <div>
//       <h1>My Profile</h1>
//       <p>Your profile details will go here.</p>
//     </div>
//   );
// }