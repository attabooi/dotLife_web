import {
  bigint,
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "../users/schema";

// Quest difficulty levels
export const questDifficulty = pgEnum("quest_difficulty", [
  "easy",
  "medium", 
  "hard"
]);

// Player Stats - Core gamification data for each user
export const playerStats = pgTable("player_stats", {
  profile_id: uuid()
    .primaryKey()
    .references(() => profiles.profile_id, { onDelete: "cascade" }),
  level: integer().notNull().default(1),
  total_xp: integer().notNull().default(0),
  current_xp: integer().notNull().default(0),
  xp_to_next_level: integer().notNull().default(100),
  consecutive_days: integer().notNull().default(0),
  total_bricks: integer().notNull().default(0),
  available_bricks: integer().notNull().default(20), // Bricks available for building
  last_completed_date: date(),
  hearts: real().notNull().default(1.0), // 0, 0.5, or 1.0
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

// Daily Quests - User's daily missions
export const dailyQuests = pgTable("daily_quests", {
  quest_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid()
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  title: text().notNull(),
  description: text().notNull(),
  difficulty: questDifficulty().notNull().default("easy"),
  reward_xp: integer().notNull().default(10),
  reward_bricks: integer().notNull().default(1),
  completed: boolean().notNull().default(false),
  confirmed: boolean().notNull().default(false), // Quest confirmation system
  quest_date: date().notNull(),
  deadline: timestamp().notNull(), // Usually midnight of quest_date
  completed_at: timestamp(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

// Quest History - Daily completion summary
export const questHistory = pgTable("quest_history", {
  history_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid()
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  completion_date: date().notNull(),
  total_quests: integer().notNull().default(0),
  completed_quests: integer().notNull().default(0),
  total_bricks_earned: integer().notNull().default(0),
  heart_score: real().notNull().default(0), // 0, 0.5, or 1.0
  perfect_day: boolean().notNull().default(false), // All quests completed
  created_at: timestamp().notNull().defaultNow(),
});

// Daily Streaks - Track consecutive quest completion
export const dailyStreaks = pgTable("daily_streaks", {
  streak_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  profile_id: uuid()
    .references(() => profiles.profile_id, { onDelete: "cascade" })
    .notNull(),
  start_date: date().notNull(),
  end_date: date(),
  streak_length: integer().notNull().default(1),
  max_streak: integer().notNull().default(1),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

// Export types for TypeScript
export type PlayerStats = typeof playerStats.$inferSelect;
export type NewPlayerStats = typeof playerStats.$inferInsert;

export type DailyQuest = typeof dailyQuests.$inferSelect;
export type NewDailyQuest = typeof dailyQuests.$inferInsert;

export type QuestHistory = typeof questHistory.$inferSelect;
export type NewQuestHistory = typeof questHistory.$inferInsert;

export type DailyStreak = typeof dailyStreaks.$inferSelect;
export type NewDailyStreak = typeof dailyStreaks.$inferInsert;