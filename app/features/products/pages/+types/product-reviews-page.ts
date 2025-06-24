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
      commentsCount: number;
    };
    reviews: Array<{
      id: string;
      author: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  }

  export interface MetaFunction {
    (args: { data?: LoaderData; params?: { productId: string } }): Array<
      { title: string } | { name: string; content: string }
    >;
  }

  export interface ComponentProps {
    loaderData: LoaderData;
    actionData?: { success: boolean };
  }
} 