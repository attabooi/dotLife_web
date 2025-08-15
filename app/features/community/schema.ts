import {
  bigint,
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// =============================================
// USER RANKING SYSTEM TABLES  
// =============================================

  // User Rankings - Leaderboard data based on bricks and game performance
  export const userRankings = pgTable("user_rankings", {
    ranking_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    profile_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull()
      .unique(), // One ranking record per user
    current_rank: integer().notNull().default(0),
    total_bricks: integer().notNull().default(0),
    level: integer().notNull().default(1),
    consecutive_days: integer().notNull().default(0),
    score: bigint({ mode: "number" }).notNull().default(0), // Calculated ranking score
    rank_change: integer().notNull().default(0), // +/- from previous ranking
    last_calculated: timestamp().notNull().defaultNow(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  });

  // Ranking History - Track rank changes over time
  export const rankingHistory = pgTable("ranking_history", {
    history_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    profile_id: uuid()
      .references(() => profiles.profile_id, { onDelete: "cascade" })
      .notNull(),
    rank_snapshot: integer().notNull(),
    total_bricks_snapshot: integer().notNull(),
    level_snapshot: integer().notNull(),
    score_snapshot: bigint({ mode: "number" }).notNull(),
    snapshot_date: timestamp().notNull().defaultNow(),
  });

  // Export new types for TypeScript
  export type UserRanking = typeof userRankings.$inferSelect;
  export type NewUserRanking = typeof userRankings.$inferInsert;

  export type RankingHistory = typeof rankingHistory.$inferSelect;
  export type NewRankingHistory = typeof rankingHistory.$inferInsert;