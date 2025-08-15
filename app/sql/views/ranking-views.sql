CREATE VIEW ranking_view AS
SELECT
    user_rankings.profile_id,
    profiles.username,
    profiles.avatar as avatar_url,
    user_rankings.level,
    user_rankings.total_bricks,
    user_rankings.consecutive_days,
    user_rankings.current_rank,
    user_rankings.score,
    user_rankings.last_calculated
FROM user_rankings
JOIN profiles ON profiles.profile_id = user_rankings.profile_id;