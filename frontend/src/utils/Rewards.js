/**
 * utils/rewards.js — Points & achievements system
 *
 * Points are calculated entirely from complaint data — no backend changes needed.
 * Points are awarded per complaint based on status (resolved = most valuable).
 *
 * POINT SYSTEM:
 *   Submitted a report    → +10 pts
 *   Report assigned       → +20 pts (bonus on top of submit)
 *   Report resolved       → +50 pts (bonus on top of assigned)
 *
 * So a fully resolved complaint = 10 + 20 + 50 = 80 pts total
 */

export const POINTS = {
  open:     10,   // submitted
  assigned: 30,   // 10 + 20 bonus
  resolved: 80,   // 10 + 20 + 50 bonus
};

export const LEVELS = [
  { name: 'Newcomer',    min: 0,    max: 79,   color: 'gray',   icon: 'seed' },
  { name: 'Reporter',    min: 80,   max: 239,  color: 'blue',   icon: 'flag' },
  { name: 'Guardian',    min: 240,  max: 479,  color: 'green',  icon: 'shield' },
  { name: 'Champion',    min: 480,  max: 799,  color: 'amber',  icon: 'star' },
  { name: 'Hero',        min: 800,  max: 1199, color: 'orange', icon: 'flame' },
  { name: 'Legend',      min: 1200, max: Infinity, color: 'purple', icon: 'crown' },
];

export const BADGES = [
  {
    id: 'first_report',
    name: 'First Step',
    desc: 'Submitted your first report',
    icon: 'flag',
    color: 'blue',
    check: (c) => c.length >= 1,
  },
  {
    id: 'five_reports',
    name: 'On a Roll',
    desc: 'Submitted 5 reports',
    icon: 'stack',
    color: 'green',
    check: (c) => c.length >= 5,
  },
  {
    id: 'ten_reports',
    name: 'Dedicated',
    desc: 'Submitted 10 reports',
    icon: 'target',
    color: 'amber',
    check: (c) => c.length >= 10,
  },
  {
    id: 'first_resolved',
    name: 'Impact Maker',
    desc: 'Got your first complaint resolved',
    icon: 'check',
    color: 'green',
    check: (c) => c.some(x => x.status === 'resolved'),
  },
  {
    id: 'five_resolved',
    name: 'City Cleaner',
    desc: '5 complaints resolved',
    icon: 'sparkle',
    color: 'amber',
    check: (c) => c.filter(x => x.status === 'resolved').length >= 5,
  },
  {
    id: 'ten_resolved',
    name: 'Urban Hero',
    desc: '10 complaints resolved',
    icon: 'shield',
    color: 'orange',
    check: (c) => c.filter(x => x.status === 'resolved').length >= 10,
  },
  {
    id: 'streak_3',
    name: 'Consistent',
    desc: 'Reported on 3 different days',
    icon: 'lightning',
    color: 'yellow',
    check: (c) => {
      const days = new Set(c.map(x => new Date(x.createdAt).toDateString()));
      return days.size >= 3;
    },
  },
  {
    id: 'all_statuses',
    name: 'Full Cycle',
    desc: 'Have reports in all 3 statuses',
    icon: 'cycle',
    color: 'purple',
    check: (c) => {
      const statuses = new Set(c.map(x => x.status));
      return statuses.has('open') && statuses.has('assigned') && statuses.has('resolved');
    },
  },
];

/**
 * Calculate total points from an array of complaints
 */
export function calcPoints(complaints) {
  return complaints.reduce((sum, c) => sum + (POINTS[c.status] || 0), 0);
}

/**
 * Get the current level object for a points total
 */
export function getLevel(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return { ...LEVELS[i], index: i };
  }
  return { ...LEVELS[0], index: 0 };
}

/**
 * Get progress to next level (0–100)
 */
export function getLevelProgress(points) {
  const level = getLevel(points);
  if (level.max === Infinity) return 100;
  const range = level.max - level.min;
  const progress = points - level.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

/**
 * Get next level name (or null if max)
 */
export function getNextLevel(points) {
  const level = getLevel(points);
  if (level.index + 1 >= LEVELS.length) return null;
  return LEVELS[level.index + 1];
}

/**
 * Get earned + locked badges
 */
export function getBadges(complaints) {
  return BADGES.map(badge => ({
    ...badge,
    earned: badge.check(complaints),
  }));
}

/**
 * Points needed to reach next level
 */
export function ptsToNextLevel(points) {
  const level = getLevel(points);
  if (level.max === Infinity) return 0;
  return level.max - points + 1;
}