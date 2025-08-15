-- Seed data for all game features (profiles, rankings, quests, towers)

INSERT INTO profiles (profile_id, name, username, avatar)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tower Master', 'towermaster', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Quest Hero', 'questhero', NULL),
  ('33333333-3333-3333-3333-333333333333', 'Brick Builder', 'brickbuilder', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Daily Champion', 'dailychampion', NULL),
  ('55555555-5555-5555-5555-555555555555', 'Streak King', 'streakking', NULL),
  ('66666666-6666-6666-6666-666666666666', 'Tower Architect', 'towerarchitect', NULL),
  ('77777777-7777-7777-7777-777777777777', 'Quest Lord', 'questlord', NULL),
  ('88888888-8888-8888-8888-888888888888', 'Brick Collector', 'brickcollector', NULL),
  ('99999999-9999-9999-9999-999999999999', 'Daily Grinder', 'dailygrinder', NULL),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Castle Guardian', 'castleguardian', NULL)
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO user_rankings (
  profile_id, current_rank, total_bricks, level, consecutive_days, score
) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 2847, 28, 127, 2847*1000 + 28*10 + 127),
  ('22222222-2222-2222-2222-222222222222', 2, 2234, 25,  89, 2234*1000 + 25*10 +  89),
  ('33333333-3333-3333-3333-333333333333', 3, 1998, 23, 156, 1998*1000 + 23*10 + 156),
  ('44444444-4444-4444-4444-444444444444', 4, 1847, 22,  67, 1847*1000 + 22*10 +  67),
  ('55555555-5555-5555-5555-555555555555', 5, 1723, 21, 203, 1723*1000 + 21*10 + 203),
  ('66666666-6666-6666-6666-666666666666', 6, 1654, 20,  45, 1654*1000 + 20*10 +  45),
  ('77777777-7777-7777-7777-777777777777', 7, 1502, 19,  78, 1502*1000 + 19*10 +  78),
  ('88888888-8888-8888-8888-888888888888', 8, 1398, 18,  34, 1398*1000 + 18*10 +  34),
  ('99999999-9999-9999-9999-999999999999', 9, 1267, 17,  92, 1267*1000 + 17*10 +  92),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',10, 1156, 16,  23, 1156*1000 + 16*10 +  23)
ON CONFLICT (profile_id) DO NOTHING;

-- Player Stats (align with rankings for demo)
INSERT INTO player_stats (
  profile_id, level, total_xp, current_xp, xp_to_next_level, consecutive_days, total_bricks, available_bricks, last_completed_date, hearts
) VALUES
  ('11111111-1111-1111-1111-111111111111', 28, 2800, 50, 2900, 127, 2847, 25, '2025-08-10', 1.0),
  ('22222222-2222-2222-2222-222222222222', 25, 2500, 30, 2600,  89, 2234, 20, '2025-08-10', 1.0),
  ('33333333-3333-3333-3333-333333333333', 23, 2300, 70, 2400, 156, 1998, 18, '2025-08-10', 1.0)
ON CONFLICT (profile_id) DO NOTHING;

-- Daily Quests (two days per top user)
INSERT INTO daily_quests (
  profile_id, title, description, difficulty, reward_xp, reward_bricks, completed, confirmed, quest_date, deadline, completed_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Morning workout', 'Complete 30 minutes workout', 'medium', 20, 1, true,  true, '2025-08-10', '2025-08-10 23:59:59+00', '2025-08-10 08:10:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'Read 30 pages',   'Read non-fiction book',      'easy',   10, 1, true,  true, '2025-08-10', '2025-08-10 23:59:59+00', '2025-08-10 21:00:00+00'),
  ('11111111-1111-1111-1111-111111111111', 'Code 2 hours',    'Feature work',               'hard',   30, 2, true,  true, '2025-08-10', '2025-08-10 23:59:59+00', '2025-08-10 22:30:00+00'),
  ('22222222-2222-2222-2222-222222222222', 'Meditation',      '10 minutes mindfulness',     'easy',   10, 1, true,  true, '2025-08-10', '2025-08-10 23:59:59+00', '2025-08-10 07:20:00+00'),
  ('22222222-2222-2222-2222-222222222222', 'Ship PR',         'Merge feature branch',       'medium', 20, 1, false, true, '2025-08-10', '2025-08-10 23:59:59+00', NULL);

-- Quest History (daily summary)
INSERT INTO quest_history (
  profile_id, completion_date, total_quests, completed_quests, total_bricks_earned, heart_score, perfect_day
) VALUES
  ('11111111-1111-1111-1111-111111111111', '2025-08-10', 3, 3, 3, 1.0, true),
  ('22222222-2222-2222-2222-222222222222', '2025-08-10', 2, 1, 0, 0.5, false)
ON CONFLICT DO NOTHING;

-- Daily Streaks (active streaks)
INSERT INTO daily_streaks (
  profile_id, start_date, end_date, streak_length, max_streak, is_active
) VALUES
  ('11111111-1111-1111-1111-111111111111', '2025-04-05', NULL, 127, 180, true),
  ('22222222-2222-2222-2222-222222222222', '2025-06-10', NULL,  89, 120, true)
ON CONFLICT DO NOTHING;

-- Tower Stats (one per user)
INSERT INTO tower_stats (
  profile_id, total_blocks, tower_height, tower_width, structure_data, views, likes, comments, is_public, last_built_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', 120, 30, 20, '{"blocks":[]}'::jsonb, 1500, 200, 20, true, '2025-08-10 22:45:00+00'),
  ('22222222-2222-2222-2222-222222222222',  90, 25, 18, '{"blocks":[]}'::jsonb,  900, 120, 12, true, '2025-08-10 20:10:00+00'),
  ('33333333-3333-3333-3333-333333333333',  60, 20, 16, '{"blocks":[]}'::jsonb,  600,  80,  8, true, '2025-08-10 18:00:00+00')
ON CONFLICT (profile_id) DO NOTHING;

-- Tower Blocks (sample pixels for first two users)
INSERT INTO tower_blocks (profile_id, build_date, x_position, y_position, color, metadata) VALUES
  ('11111111-1111-1111-1111-111111111111', '2025-08-10 10:00:00+00', 10, 59, '#60a5fa', '{"brick_source":"seed"}'),
  ('11111111-1111-1111-1111-111111111111', '2025-08-10 10:05:00+00', 11, 59, '#60a5fa', '{"brick_source":"seed"}'),
  ('11111111-1111-1111-1111-111111111111', '2025-08-10 10:10:00+00', 12, 59, '#2563eb', '{"brick_source":"seed"}'),
  ('22222222-2222-2222-2222-222222222222', '2025-08-10 09:00:00+00', 20, 59, '#f97316', '{"brick_source":"seed"}'),
  ('22222222-2222-2222-2222-222222222222', '2025-08-10 09:05:00+00', 21, 59, '#f97316', '{"brick_source":"seed"}');

-- Tower Interactions (views/likes/comments as rows)
INSERT INTO tower_interactions (tower_owner_id, viewer_id, interaction_type, comment_text)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'view', NULL),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'like', NULL),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'comment', 'Amazing build!');

-- Ranking History (snapshots)
INSERT INTO ranking_history (
  profile_id, rank_snapshot, total_bricks_snapshot, level_snapshot, score_snapshot, snapshot_date
) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 2800, 28, 2800*1000 + 28*10 + 120, '2025-08-09 23:59:00+00'),
  ('11111111-1111-1111-1111-111111111111', 1, 2847, 28, 2847*1000 + 28*10 + 127, '2025-08-10 23:59:00+00'),
  ('22222222-2222-2222-2222-222222222222', 2, 2200, 25, 2200*1000 + 25*10 +  85, '2025-08-09 23:59:00+00'),
  ('22222222-2222-2222-2222-222222222222', 2, 2234, 25, 2234*1000 + 25*10 +  89, '2025-08-10 23:59:00+00');

