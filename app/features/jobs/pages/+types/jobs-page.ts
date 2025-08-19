import type { LoaderArgs as BaseLoaderArgs, ActionArgs as BaseActionArgs, MetaFunction } from "react-router";

export namespace Route {
  export interface ComponentProps {
    loaderData: {
      quests: any[];
      stats: any;
      userId: string;
    };
    actionData: {
      type: 'create' | 'complete';
      quest: any;
      stats?: any;
    } | null;
  }

  export interface LoaderArgs extends BaseLoaderArgs {
    request: Request;
  }

  export interface ActionArgs extends BaseActionArgs {
    request: Request;
  }

  export interface MetaFunction extends MetaFunction {}
} 