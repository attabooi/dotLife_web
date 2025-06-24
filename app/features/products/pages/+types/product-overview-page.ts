import type * as ReactRouter from "react-router";

export namespace Route {
  export interface LoaderArgs {
    params: {
      productId: string;
    };
    request: Request;
  }

  export interface ActionArgs {
    params: {
      productId: string;
    };
    request: Request;
  }

  export interface LoaderData {
    product: {
      id: string;
      name: string;
      tagline: string;
      description: string;
      url: string;
      category: string;
      votes: number;
      commentsCount: number;
      views: number;
      createdAt: string;
      maker: string;
    };
  }

  export interface MetaFunction {
    (args: { data?: LoaderData; params?: { productId: string } }): Array<
      { title: string } | { name: string; content: string }
    >;
  }

  export interface ComponentProps {
    loaderData: LoaderData;
    actionData?: { success: boolean };
    params: {
      productId: string;
    };
  }
} 