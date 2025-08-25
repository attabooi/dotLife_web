-- Clear all data from the database while preserving table structures and policies
-- This script will remove all user data, game data, and other records

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Clear game-related data first (due to foreign key constraints)
DELETE FROM tower_blocks;
DELETE FROM tower_building_sessions;
DELETE FROM tower_history;
DELETE FROM tower_calendar_events;
DELETE FROM tower_premium_features;
DELETE FROM tower_stats;

-- Clear quest and player data
DELETE FROM daily_quests;
DELETE FROM player_stats;

-- Clear user-related data
DELETE FROM profiles;

-- Clear community data
DELETE FROM posts;
DELETE FROM replies;

-- Clear job-related data
DELETE FROM jobs;

-- Clear idea-related data
DELETE FROM ideas;

-- Clear team-related data
DELETE FROM teams;

-- Clear user messages and notifications
DELETE FROM messages;
DELETE FROM notifications;

-- Clear any other user-generated content
DELETE FROM user_activities;
DELETE FROM user_sessions;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset sequences (if any)
-- Note: This will reset auto-increment counters
-- Uncomment the lines below if you want to reset sequences too

-- ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS player_stats_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS daily_quests_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tower_blocks_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tower_building_sessions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tower_history_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tower_calendar_events_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tower_premium_features_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS tower_stats_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS posts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS replies_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS jobs_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS ideas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS teams_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS user_activities_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS user_sessions_id_seq RESTART WITH 1;

-- Verify data is cleared
SELECT 
  'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'player_stats', COUNT(*) FROM player_stats
UNION ALL
SELECT 'daily_quests', COUNT(*) FROM daily_quests
UNION ALL
SELECT 'tower_blocks', COUNT(*) FROM tower_blocks
UNION ALL
SELECT 'tower_building_sessions', COUNT(*) FROM tower_building_sessions
UNION ALL
SELECT 'tower_history', COUNT(*) FROM tower_history
UNION ALL
SELECT 'tower_calendar_events', COUNT(*) FROM tower_calendar_events
UNION ALL
SELECT 'tower_premium_features', COUNT(*) FROM tower_premium_features
UNION ALL
SELECT 'tower_stats', COUNT(*) FROM tower_stats
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'replies', COUNT(*) FROM replies
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'ideas', COUNT(*) FROM ideas
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'user_activities', COUNT(*) FROM user_activities
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions;
