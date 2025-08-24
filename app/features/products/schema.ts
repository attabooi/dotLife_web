import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// =============================================
// TOWER BUILDING SYSTEM TABLES
// =============================================

// Tower Blocks - Individual pixel blocks in user's tower
export const towerBlocks = pgTable("tower_blocks", {
  block_id: bigint("block_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid("profile_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  build_date: timestamp("build_date").notNull().defaultNow(),
  x_position: integer("x_position").notNull(),
  y_position: integer("y_position").notNull(),
  color: text("color").notNull(), // Hex color code
  quest_id: bigint("quest_id", { mode: "number" }), // Reference to completed quest
  build_session_id: text("build_session_id"), // Session ID for grouping blocks
  is_confirmed: boolean("is_confirmed").notNull().default(false), // Confirmed blocks are permanent
  metadata: jsonb("metadata").$type<{
    quest_id?: number;
    brick_source?: string;
    special_block?: boolean;
    build_session?: string;
  }>(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Tower Building Sessions - Temporary building sessions before confirmation
export const towerBuildingSessions = pgTable("tower_building_sessions", {
  session_id: text("session_id").primaryKey(),
  profile_id: uuid("profile_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  session_name: text("session_name").notNull().default("Building Session"),
  blocks_data: jsonb("blocks_data").notNull(), // Array of block data
  is_confirmed: boolean("is_confirmed").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  confirmed_at: timestamp("confirmed_at"),
});

// Tower History - For premium undo/restore features
export const towerHistory = pgTable("tower_history", {
  history_id: bigint("history_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid("profile_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  action_type: text("action_type").notNull(), // 'save', 'undo', 'restore', 'reset'
  previous_state: jsonb("previous_state"), // Previous tower state
  new_state: jsonb("new_state"), // New tower state
  blocks_changed: integer("blocks_changed").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Tower Calendar Events - Track daily building activities
export const towerCalendarEvents = pgTable("tower_calendar_events", {
  event_id: bigint("event_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid("profile_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  event_date: date("event_date").notNull(),
  quest_id: bigint("quest_id", { mode: "number" }),
  quest_title: text("quest_title"),
  blocks_added: integer("blocks_added").notNull().default(0),
  colors_used: jsonb("colors_used").$type<string[]>(), // Array of hex colors used
  total_height: integer("total_height").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Tower Premium Features - Track user's premium features
export const towerPremiumFeatures = pgTable("tower_premium_features", {
  feature_id: bigint("feature_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid("profile_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  feature_type: text("feature_type").notNull(), // 'undo', 'restore', 'unlimited_history'
  is_active: boolean("is_active").notNull().default(false),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Tower Stats - Overall tower information and social interactions
export const towerStats = pgTable("tower_stats", {
  tower_id: bigint("tower_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid("profile_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull()
    .unique(), // One tower per user
  total_blocks: integer("total_blocks").notNull().default(0),
  confirmed_blocks: integer("confirmed_blocks").notNull().default(0),
  tower_height: integer("tower_height").notNull().default(0),
  tower_width: integer("tower_width").notNull().default(0),
  total_sessions: integer("total_sessions").notNull().default(0),
  structure_data: jsonb("structure_data").$type<{
    blocks: Array<{
      x: number;
      y: number;
      color: string;
      date: string;
    }>;
    special_features?: any;
    build_history?: any;
  }>(),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  is_public: boolean("is_public").notNull().default(true),
  last_built_at: timestamp("last_built_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Tower Interactions - Views, likes, comments on towers
export const towerInteractions = pgTable("tower_interactions", {
  interaction_id: bigint("interaction_id", { mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  tower_owner_id: uuid("tower_owner_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  viewer_id: uuid("viewer_id")
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  interaction_type: text("interaction_type").notNull(), // 'view', 'like', 'comment'
  comment_text: text("comment_text"), // Only for comment type
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Export new types for TypeScript
export type TowerBlock = typeof towerBlocks.$inferSelect;
export type NewTowerBlock = typeof towerBlocks.$inferInsert;

export type TowerBuildingSession = typeof towerBuildingSessions.$inferSelect;
export type NewTowerBuildingSession = typeof towerBuildingSessions.$inferInsert;

export type TowerHistory = typeof towerHistory.$inferSelect;
export type NewTowerHistory = typeof towerHistory.$inferInsert;

export type TowerCalendarEvent = typeof towerCalendarEvents.$inferSelect;
export type NewTowerCalendarEvent = typeof towerCalendarEvents.$inferInsert;

export type TowerPremiumFeature = typeof towerPremiumFeatures.$inferSelect;
export type NewTowerPremiumFeature = typeof towerPremiumFeatures.$inferInsert;

export type TowerStats = typeof towerStats.$inferSelect;
export type NewTowerStats = typeof towerStats.$inferInsert;

export type TowerInteraction = typeof towerInteractions.$inferSelect;
export type NewTowerInteraction = typeof towerInteractions.$inferInsert;