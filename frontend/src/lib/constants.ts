export const BADGE_DEFINITIONS = {
  first_lesson: { icon: '📚', label: 'First Steps', description: 'Completed your first lesson' },
  streak_7: { icon: '🔥', label: 'On Fire', description: '7 day learning streak' },
  streak_30: { icon: '⚡', label: 'Lightning', description: '30 day learning streak' },
  perfect_quiz: { icon: '💯', label: 'Perfect Score', description: 'Got 100% on a quiz' },
  quiz_master: { icon: '🏆', label: 'Quiz Master', description: 'Passed 10 quizzes' },
  bookworm: { icon: '🐛', label: 'Bookworm', description: 'Bookmarked 10 lessons' },
  level_5: { icon: '⭐', label: 'Rising Star', description: 'Reached Level 5' },
  level_10: { icon: '🌟', label: 'Star Learner', description: 'Reached Level 10' }
};

export const LEVEL_THRESHOLDS = [0, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000];

export const getLevelFromXP = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

export const getXPForNextLevel = (level: number): number => {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] || 20000;
};

export const SUBJECTS_DATA = [
  { title: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#6366f1', description: 'Algebra, Geometry, Calculus and more' },
  { title: 'Physics', slug: 'physics', icon: '⚡', color: '#f59e0b', description: 'Mechanics, Electricity, Thermodynamics' },
  { title: 'English', slug: 'english', icon: '📝', color: '#10b981', description: 'Grammar, Vocabulary, Writing' },
  { title: 'Chemistry', slug: 'chemistry', icon: '🧪', color: '#ef4444', description: 'Organic, Inorganic, Physical Chemistry' },
  { title: 'Biology', slug: 'biology', icon: '🧬', color: '#8b5cf6', description: 'Cell Biology, Genetics, Evolution' },
  { title: 'Computer Science', slug: 'cs', icon: '💻', color: '#06b6d4', description: 'Programming, Algorithms, Data Structures' }
];

export const DIFFICULTY_COLORS = {
  beginner: 'text-green-500 bg-green-500/10',
  intermediate: 'text-yellow-500 bg-yellow-500/10',
  advanced: 'text-red-500 bg-red-500/10'
};

export const DIFFICULTY_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};
