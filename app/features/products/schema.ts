import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// =============================================
// TOWER BUILDING SYSTEM TABLES
// =============================================

  // Tower Blocks - Individual pixel blocks in user's tower
  export const towerBlocks = pgTable("tower_blocks", {
    block_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    profile_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
    build_date: timestamp().notNull().defaultNow(),
    x_position: integer().notNull(),
    y_position: integer().notNull(),
    color: text().notNull(), // Hex color code
    metadata: jsonb().$type<{
      quest_id?: number;
      brick_source?: string;
      special_block?: boolean;
      build_session?: string;
    }>(),
    created_at: timestamp().notNull().defaultNow(),
  });

  // Tower Stats - Overall tower information and social interactions
  export const towerStats = pgTable("tower_stats", {
    tower_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    profile_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull()
      .unique(), // One tower per user
    total_blocks: integer().notNull().default(0),
    tower_height: integer().notNull().default(0),
    tower_width: integer().notNull().default(0),
    structure_data: jsonb().$type<{
      blocks: Array<{
        x: number;
        y: number;
        color: string;
        date: string;
      }>;
      special_features?: any;
      build_history?: any;
    }>(),
    views: integer().notNull().default(0),
    likes: integer().notNull().default(0),
    comments: integer().notNull().default(0),
    is_public: boolean().notNull().default(true),
    last_built_at: timestamp(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  });

  // Tower Interactions - Views, likes, comments on towers (replaces some product functionality)
  export const towerInteractions = pgTable("tower_interactions", {
    interaction_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    tower_owner_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
    viewer_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
    interaction_type: text().notNull(), // 'view', 'like', 'comment'
    comment_text: text(), // Only for comment type
    created_at: timestamp().notNull().defaultNow(),
  });

  // Export new types for TypeScript
  export type TowerBlock = typeof towerBlocks.$inferSelect;
  export type NewTowerBlock = typeof towerBlocks.$inferInsert;

  export type TowerStats = typeof towerStats.$inferSelect;
  export type NewTowerStats = typeof towerStats.$inferInsert;

  export type TowerInteraction = typeof towerInteractions.$inferSelect;
  export type NewTowerInteraction = typeof towerInteractions.$inferInsert;