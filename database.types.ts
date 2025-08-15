export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      daily_quests: {
        Row: {
          completed: boolean
          completed_at: string | null
          confirmed: boolean
          created_at: string
          deadline: string
          description: string
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          profile_id: string
          quest_date: string
          quest_id: number
          reward_bricks: number
          reward_xp: number
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          confirmed?: boolean
          created_at?: string
          deadline: string
          description: string
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          profile_id: string
          quest_date: string
          quest_id?: never
          reward_bricks?: number
          reward_xp?: number
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          confirmed?: boolean
          created_at?: string
          deadline?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          profile_id?: string
          quest_date?: string
          quest_id?: never
          reward_bricks?: number
          reward_xp?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quests_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      daily_streaks: {
        Row: {
          created_at: string
          end_date: string | null
          is_active: boolean
          max_streak: number
          profile_id: string
          start_date: string
          streak_id: number
          streak_length: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          is_active?: boolean
          max_streak?: number
          profile_id: string
          start_date: string
          streak_id?: never
          streak_length?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          is_active?: boolean
          max_streak?: number
          profile_id?: string
          start_date?: string
          streak_id?: never
          streak_length?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_streaks_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_profiles_profile_id_fk"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_following_id_profiles_profile_id_fk"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      message_room_members: {
        Row: {
          created_at: string
          message_room_id: number
          profile_id: string
        }
        Insert: {
          created_at?: string
          message_room_id: number
          profile_id: string
        }
        Update: {
          created_at?: string
          message_room_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_room_members_message_room_id_message_rooms_message_room"
            columns: ["message_room_id"]
            isOneToOne: false
            referencedRelation: "message_rooms"
            referencedColumns: ["message_room_id"]
          },
          {
            foreignKeyName: "message_room_members_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      message_rooms: {
        Row: {
          created_at: string
          message_room_id: number
        }
        Insert: {
          created_at?: string
          message_room_id?: never
        }
        Update: {
          created_at?: string
          message_room_id?: never
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          message_id: number
          message_room_id: number | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          message_id?: never
          message_room_id?: number | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          message_id?: never
          message_room_id?: number | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_message_room_id_message_rooms_message_room_id_fk"
            columns: ["message_room_id"]
            isOneToOne: false
            referencedRelation: "message_rooms"
            referencedColumns: ["message_room_id"]
          },
          {
            foreignKeyName: "messages_sender_id_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          notification_id: number
          source_id: string | null
          target_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          notification_id?: never
          source_id?: string | null
          target_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          notification_id?: never
          source_id?: string | null
          target_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_source_id_profiles_profile_id_fk"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_target_id_profiles_profile_id_fk"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      player_stats: {
        Row: {
          available_bricks: number
          consecutive_days: number
          created_at: string
          current_xp: number
          hearts: number
          last_completed_date: string | null
          level: number
          profile_id: string
          total_bricks: number
          total_xp: number
          updated_at: string
          xp_to_next_level: number
        }
        Insert: {
          available_bricks?: number
          consecutive_days?: number
          created_at?: string
          current_xp?: number
          hearts?: number
          last_completed_date?: string | null
          level?: number
          profile_id: string
          total_bricks?: number
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Update: {
          available_bricks?: number
          consecutive_days?: number
          created_at?: string
          current_xp?: number
          hearts?: number
          last_completed_date?: string | null
          level?: number
          profile_id?: string
          total_bricks?: number
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          headline: string | null
          name: string
          profile_id: string
          role: Database["public"]["Enums"]["role"]
          stats: Json | null
          updated_at: string
          username: string
          views: Json | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          headline?: string | null
          name: string
          profile_id: string
          role?: Database["public"]["Enums"]["role"]
          stats?: Json | null
          updated_at?: string
          username: string
          views?: Json | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          headline?: string | null
          name?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["role"]
          stats?: Json | null
          updated_at?: string
          username?: string
          views?: Json | null
        }
        Relationships: []
      }
      quest_history: {
        Row: {
          completed_quests: number
          completion_date: string
          created_at: string
          heart_score: number
          history_id: number
          perfect_day: boolean
          profile_id: string
          total_bricks_earned: number
          total_quests: number
        }
        Insert: {
          completed_quests?: number
          completion_date: string
          created_at?: string
          heart_score?: number
          history_id?: never
          perfect_day?: boolean
          profile_id: string
          total_bricks_earned?: number
          total_quests?: number
        }
        Update: {
          completed_quests?: number
          completion_date?: string
          created_at?: string
          heart_score?: number
          history_id?: never
          perfect_day?: boolean
          profile_id?: string
          total_bricks_earned?: number
          total_quests?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_history_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      ranking_history: {
        Row: {
          history_id: number
          level_snapshot: number
          profile_id: string
          rank_snapshot: number
          score_snapshot: number
          snapshot_date: string
          total_bricks_snapshot: number
        }
        Insert: {
          history_id?: never
          level_snapshot: number
          profile_id: string
          rank_snapshot: number
          score_snapshot: number
          snapshot_date?: string
          total_bricks_snapshot: number
        }
        Update: {
          history_id?: never
          level_snapshot?: number
          profile_id?: string
          rank_snapshot?: number
          score_snapshot?: number
          snapshot_date?: string
          total_bricks_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_history_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tower_blocks: {
        Row: {
          block_id: number
          build_date: string
          color: string
          created_at: string
          metadata: Json | null
          profile_id: string
          x_position: number
          y_position: number
        }
        Insert: {
          block_id?: never
          build_date?: string
          color: string
          created_at?: string
          metadata?: Json | null
          profile_id: string
          x_position: number
          y_position: number
        }
        Update: {
          block_id?: never
          build_date?: string
          color?: string
          created_at?: string
          metadata?: Json | null
          profile_id?: string
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "tower_blocks_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tower_interactions: {
        Row: {
          comment_text: string | null
          created_at: string
          interaction_id: number
          interaction_type: string
          tower_owner_id: string
          viewer_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string
          interaction_id?: never
          interaction_type: string
          tower_owner_id: string
          viewer_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string
          interaction_id?: never
          interaction_type?: string
          tower_owner_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tower_interactions_tower_owner_id_profiles_profile_id_fk"
            columns: ["tower_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "tower_interactions_viewer_id_profiles_profile_id_fk"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tower_stats: {
        Row: {
          comments: number
          created_at: string
          is_public: boolean
          last_built_at: string | null
          likes: number
          profile_id: string
          structure_data: Json | null
          total_blocks: number
          tower_height: number
          tower_id: number
          tower_width: number
          updated_at: string
          views: number
        }
        Insert: {
          comments?: number
          created_at?: string
          is_public?: boolean
          last_built_at?: string | null
          likes?: number
          profile_id: string
          structure_data?: Json | null
          total_blocks?: number
          tower_height?: number
          tower_id?: never
          tower_width?: number
          updated_at?: string
          views?: number
        }
        Update: {
          comments?: number
          created_at?: string
          is_public?: boolean
          last_built_at?: string | null
          likes?: number
          profile_id?: string
          structure_data?: Json | null
          total_blocks?: number
          tower_height?: number
          tower_id?: never
          tower_width?: number
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "tower_stats_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      user_rankings: {
        Row: {
          consecutive_days: number
          created_at: string
          current_rank: number
          last_calculated: string
          level: number
          profile_id: string
          rank_change: number
          ranking_id: number
          score: number
          total_bricks: number
          updated_at: string
        }
        Insert: {
          consecutive_days?: number
          created_at?: string
          current_rank?: number
          last_calculated?: string
          level?: number
          profile_id: string
          rank_change?: number
          ranking_id?: never
          score?: number
          total_bricks?: number
          updated_at?: string
        }
        Update: {
          consecutive_days?: number
          created_at?: string
          current_rank?: number
          last_calculated?: string
          level?: number
          profile_id?: string
          rank_change?: number
          ranking_id?: never
          score?: number
          total_bricks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rankings_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      quest_daily_summary_view: {
        Row: {
          all_completed: boolean | null
          available_bricks: number | null
          avatar_url: string | null
          completed_quests: number | null
          consecutive_days: number | null
          earned_bricks_if_perfect: number | null
          heart_score: number | null
          hearts: number | null
          level: number | null
          potential_bricks: number | null
          profile_id: string | null
          quest_date: string | null
          total_bricks: number | null
          total_quests: number | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_quests_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      quest_view: {
        Row: {
          available_bricks: number | null
          avatar_url: string | null
          completed: boolean | null
          completed_at: string | null
          confirmed: boolean | null
          consecutive_days: number | null
          current_xp: number | null
          deadline: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["quest_difficulty"] | null
          hearts: number | null
          last_completed_date: string | null
          level: number | null
          profile_id: string | null
          quest_date: string | null
          quest_id: number | null
          reward_bricks: number | null
          reward_xp: number | null
          title: string | null
          total_bricks: number | null
          total_xp: number | null
          username: string | null
          xp_to_next_level: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_quests_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      ranking_view: {
        Row: {
          avatar_url: string | null
          consecutive_days: number | null
          current_rank: number | null
          last_calculated: string | null
          level: number | null
          profile_id: string | null
          score: number | null
          total_bricks: number | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rankings_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      notification_type:
        | "follow"
        | "quest_completed"
        | "level_up"
        | "streak_achieved"
        | "tower_liked"
        | "ranking_changed"
      quest_difficulty: "easy" | "medium" | "hard"
      role:
        | "developer"
        | "designer"
        | "marketer"
        | "founder"
        | "product-manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "follow",
        "quest_completed",
        "level_up",
        "streak_achieved",
        "tower_liked",
        "ranking_changed",
      ],
      quest_difficulty: ["easy", "medium", "hard"],
      role: ["developer", "designer", "marketer", "founder", "product-manager"],
    },
  },
} as const
