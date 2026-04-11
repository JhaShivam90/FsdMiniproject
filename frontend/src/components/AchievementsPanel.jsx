/**
 * components/AchievementsPanel.jsx
 * Shows the user's points total, current level, XP progress bar, and badge collection.
 * Pure frontend — derives everything from the complaints array.
 */

import { calcPoints, getLevel, getLevelProgress, getNextLevel, getBadges, ptsToNextLevel, POINTS } from '../utils/rewards';
import { useTheme } from '../context/ThemeContext';

// ── SVG badge icons ──────────────────────────────────────────────────────────
const BadgeIcons = {
  flag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  stack: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  lightning: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  cycle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  ),
  crown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zM5 20h14"/>
    </svg>
  ),
  seed: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12M12 12C12 12 7 9 7 5a5 5 0 0110 0c0 4-5 7-5 7z"/>
    </svg>
  ),
  star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
    </svg>
  ),
};

// ── Level icon ───────────────────────────────────────────────────────────────
const LevelIcon = ({ icon }) => {
  const Icon = BadgeIcons[icon] || BadgeIcons.seed;
  return <Icon />;
};

// ── Color configs ────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  blue:   { dark: { bg: 'bg-blue-500/15',   icon: 'text-blue-400',   ring: 'ring-blue-500/30'   }, light: { bg: 'bg-blue-50',   icon: 'text-blue-500',   ring: 'ring-blue-200'   } },
  green:  { dark: { bg: 'bg-green-500/15',  icon: 'text-green-400',  ring: 'ring-green-500/30'  }, light: { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'ring-green-200'  } },
  amber:  { dark: { bg: 'bg-amber-500/15',  icon: 'text-amber-400',  ring: 'ring-amber-500/30'  }, light: { bg: 'bg-amber-50',  icon: 'text-amber-600',  ring: 'ring-amber-200'  } },
  orange: { dark: { bg: 'bg-orange-500/15', icon: 'text-orange-400', ring: 'ring-orange-500/30' }, light: { bg: 'bg-orange-50', icon: 'text-orange-600', ring: 'ring-orange-200' } },
  yellow: { dark: { bg: 'bg-yellow-500/15', icon: 'text-yellow-400', ring: 'ring-yellow-500/30' }, light: { bg: 'bg-yellow-50', icon: 'text-yellow-600', ring: 'ring-yellow-200' } },
  purple: { dark: { bg: 'bg-purple-500/15', icon: 'text-purple-400', ring: 'ring-purple-500/30' }, light: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-200' } },
  gray:   { dark: { bg: 'bg-gray-700/40',   icon: 'text-gray-500',   ring: 'ring-gray-600/30'   }, light: { bg: 'bg-gray-100',  icon: 'text-gray-400',   ring: 'ring-gray-200'   } },
};

const LEVEL_BAR_COLORS = {
  gray:   'from-gray-400 to-gray-500',
  blue:   'from-blue-400 to-blue-600',
  green:  'from-green-400 to-green-600',
  amber:  'from-amber-400 to-amber-500',
  orange: 'from-orange-400 to-orange-500',
  purple: 'from-purple-400 to-purple-600',
};

export default function AchievementsPanel({ complaints }) {
  const { isDark } = useTheme();
  const mode = isDark ? 'dark' : 'light';

  const points   = calcPoints(complaints);
  const level    = getLevel(points);
  const progress = getLevelProgress(points);
  const nextLvl  = getNextLevel(points);
  const ptsLeft  = ptsToNextLevel(points);
  const badges   = getBadges(complaints);
  const earned   = badges.filter(b => b.earned);
  const locked   = badges.filter(b => !b.earned);

  const lvlColors = BADGE_COLORS[level.color] || BADGE_COLORS.gray;

  return (
    <div className="space-y-5">

      {/* ── Points + Level card ──────────────────────────── */}
      <div className={`rounded-2xl p-6 border ${
        isDark ? 'bg-dark-800 border-white/5' : 'bg-white border-green-100 shadow-sm'
      }`}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className={`text-xs font-mono uppercase tracking-widest mb-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Your Points
            </p>
            <div className="flex items-end gap-2">
              <span className={`font-display text-5xl font-bold leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {points}
              </span>
              <span className={`text-sm font-mono mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>pts</span>
            </div>
          </div>

          {/* Level badge */}
          <div className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl ring-1 ${lvlColors[mode].bg} ${lvlColors[mode].ring}`}>
            <div className={`w-7 h-7 ${lvlColors[mode].icon}`}>
              <LevelIcon icon={level.icon} />
            </div>
            <span className={`text-xs font-bold font-mono uppercase tracking-wide ${lvlColors[mode].icon}`}>
              {level.name}
            </span>
          </div>
        </div>

        {/* XP progress bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-mono ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              Level progress
            </span>
            {nextLvl ? (
              <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {ptsLeft} pts to <span className={lvlColors[mode].icon}>{nextLvl.name}</span>
              </span>
            ) : (
              <span className={`text-xs font-mono font-bold ${lvlColors[mode].icon}`}>Max level!</span>
            )}
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-600' : 'bg-gray-100'}`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${LEVEL_BAR_COLORS[level.color]} transition-all duration-700`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={`text-xs font-mono mt-1.5 text-right ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
            {progress}%
          </div>
        </div>

        {/* Points breakdown */}
        <div className={`grid grid-cols-3 gap-2 mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
          {[
            { label: 'Per report',  val: `+${POINTS.open}`,     color: isDark ? 'text-gray-400' : 'text-gray-600' },
            { label: 'Assigned',    val: `+${POINTS.assigned}`, color: isDark ? 'text-amber-400' : 'text-amber-600' },
            { label: 'Resolved',    val: `+${POINTS.resolved}`, color: isDark ? 'text-green-400' : 'text-green-600' },
          ].map(({ label, val, color }) => (
            <div key={label} className={`rounded-xl p-2.5 text-center ${isDark ? 'bg-dark-700' : 'bg-gray-50'}`}>
              <div className={`font-display font-bold text-base ${color}`}>{val}</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Earned badges ──────────────────────────────────── */}
      {earned.length > 0 && (
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-dark-800 border-white/5' : 'bg-white border-green-100 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-display font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Earned Badges
            </h3>
            <span className={`text-xs font-mono px-2.5 py-1 rounded-full ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              {earned.length} / {badges.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {earned.map(badge => {
              const bc = BADGE_COLORS[badge.color] || BADGE_COLORS.gray;
              const Icon = BadgeIcons[badge.icon] || BadgeIcons.flag;
              return (
                <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-xl ring-1 ${bc[mode].bg} ${bc[mode].ring}`}>
                  <div className={`w-9 h-9 flex-shrink-0 ${bc[mode].icon}`}>
                    <Icon />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {badge.name}
                    </p>
                    <p className={`text-xs leading-snug mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {badge.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Locked badges ──────────────────────────────────── */}
      {locked.length > 0 && (
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-dark-800 border-white/5' : 'bg-white border-green-100 shadow-sm'}`}>
          <h3 className={`font-display font-semibold text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Locked Badges
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(badge => (
              <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                isDark ? 'border-white/5 opacity-40' : 'border-gray-100 opacity-50'
              }`}>
                <div className={`w-9 h-9 flex-shrink-0 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                  {(() => { const Icon = BadgeIcons[badge.icon] || BadgeIcons.flag; return <Icon />; })()}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {badge.name}
                  </p>
                  <p className={`text-xs leading-snug mt-0.5 ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                    {badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}