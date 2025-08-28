export interface Database {
  public: {
    Tables: {
      patch_notes: {
        Row: {
          id: number;
          version: string;
          title: string;
          content: string;
          release_date: string;
          is_published: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          version: string;
          title: string;
          content: string;
          release_date?: string;
          is_published?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          version?: string;
          title?: string;
          content?: string;
          release_date?: string;
          is_published?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
