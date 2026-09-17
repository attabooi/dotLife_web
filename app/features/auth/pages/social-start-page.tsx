import { z } from "zod";
import type { Route } from "./+types/social-start-page";
import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";

const paramsSchema = z.object({
  provider: z.enum(["github", "kakao"]),
});

// Vercel sets x-forwarded-host / x-forwarded-proto to the domain the client
// actually used (www.dotlife.app, a preview URL, ...). Building redirectTo from
// them keeps it identical to the origin the auth cookies were issued for, and
// lets Supabase match it against its Redirect URLs allow list.
const getRequestOrigin = (request: Request) => {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return host ? `${proto}://${host}` : url.origin;
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { success, data } = paramsSchema.safeParse(params);
  if (!success) {
    return redirect("/auth/login");
  }
  const { provider } = data;
  const redirectTo = `${getRequestOrigin(request)}/auth/social/${provider}/complete`;
  const { client, headers } = makeSSRClient(request);
  const {
    data: { url },
    error,
  } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
  if (url) {
    return redirect(url, { headers });
  }
  if (error) {
    throw error;
  }
};