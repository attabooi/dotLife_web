// =============================================
// QUEST SYSTEM CONSTANTS
// =============================================

export const QUEST_DIFFICULTIES = [
  {
    label: "Easy",
    value: "easy",
    color: "bg-green-100 text-green-800",
    xp: 10,
    bricks: 1,
  },
  {
    label: "Medium", 
    value: "medium",
    color: "bg-yellow-100 text-yellow-800",
    xp: 20,
    bricks: 2,
  },
  {
    label: "Hard",
    value: "hard", 
    color: "bg-red-100 text-red-800",
    xp: 30,
    bricks: 3,
  },
] as const;

export const BRICK_MULTIPLIERS = {
  1: 1,    // 1 day = 1 brick
  2: 2,    // 2+ days = 2 bricks
  5: 3,    // 5+ days = 3 bricks  
  30: 4,   // 30+ days = 4 bricks
} as const;

export const LEVEL_XP_REQUIREMENTS = (level: number): number => {
  return level * 100 + (level - 1) * 50; // Progressive XP requirement
};
