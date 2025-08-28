import type { Route as BaseRoute } from "@react-router/dev/routes";

export interface Route extends BaseRoute {
  LoaderArgs: {
    request: Request;
  };
  ActionArgs: {
    request: Request;
  };
  ComponentProps: {
    loaderData: {
      patchNotes: Array<{
        id: number;
        version: string;
        title: string;
        content: string;
        release_date: string;
        is_published: boolean;
        created_at: string | null;
        updated_at: string | null;
      }>;
      isAdmin: boolean;
    } | null;
  };
}
