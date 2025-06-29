export namespace Route {
  export interface LoaderArgs {
    params: {
      ideaId: string;
    };
    request: Request;
  }

  export interface ActionArgs {
    params: {
      ideaId: string;
    };
    request: Request;
  }

  export interface LoaderData {
    idea: {
      id: string;
      title: string;
      description: string;
      fullDescription: string;
      category: string;
      status: string;
      votes: number;
      comments: number;
      createdAt: string;
      updatedAt: string;
      author: {
        name: string;
        username: string;
        avatar: string;
      };
      tags: string[];
      progress: Array<{
        title: string;
        date: string;
        completed: boolean;
      }>;
    };
  }

  export interface MetaFunction {
    (args: {
      data: LoaderData | undefined;
      params: { ideaId: string };
    }): Array<{ title: string } | { name: string; content: string }>;
  }

  export interface ComponentProps {
    loaderData: LoaderData;
    params: {
      ideaId: string;
    };
    actionData?: {
      success?: boolean;
    };
  }
} 