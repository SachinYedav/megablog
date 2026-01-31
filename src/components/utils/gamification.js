import { PenTool, Feather, BookOpen, Crown } from "lucide-react";

export const LEVELS = [
  {
    id: "scribe",
    label: "Scribe",
    minPosts: 0,
    minFollowers: 0,
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: Feather, 
    progressColor: "bg-slate-400",
  },
  {
    id: "wordsmith",
    label: "Wordsmith",
    minPosts: 5,
    minFollowers: 10,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
    icon: PenTool,
    progressColor: "bg-cyan-500",
  },
  {
    id: "storyteller",
    label: "Storyteller", 
    minPosts: 10,
    minFollowers: 50,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    icon: BookOpen,
    progressColor: "bg-amber-500",
    isVerified: true, 
  },
  {
    id: "legend",
    label: "Legend", 
    minPosts: 20,
    minFollowers: 100,
    color: "text-purple-600", 
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    icon: Crown,
    progressColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    isPro: true, 
  },
];

export const calculateLevel = (postCount, followerCount) => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    if (postCount >= level.minPosts || followerCount >= level.minFollowers) {
      currentLevel = level;
      nextLevel = LEVELS[i + 1] || null;
    }
  }
  return { currentLevel, nextLevel };
};

export const calculateProgress = (postCount, followerCount, nextLevel) => {
  if (!nextLevel) return 100;
  const postProgress = Math.min((postCount / nextLevel.minPosts) * 100, 100);
  const followerProgress = Math.min(
    (followerCount / nextLevel.minFollowers) * 100,
    100
  );
  return Math.max(postProgress, followerProgress);
};
