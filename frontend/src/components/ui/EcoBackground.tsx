import React from 'react';

const LEAF_PATH =
  'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8z';

type LeafColor = 'green' | 'emerald' | 'teal' | 'lime';
const LEAF_CLASSES: Record<LeafColor, string> = {
  green:   'fill-green-600   dark:fill-green-400',
  emerald: 'fill-emerald-600 dark:fill-emerald-400',
  teal:    'fill-teal-600    dark:fill-teal-400',
  lime:    'fill-lime-600    dark:fill-lime-400',
};

const LEAVES: {
  id: number; left: number; size: number; dur: number; delay: number;
  rotate: number; color: LeafColor; opacity: number;
}[] = [
  { id: 0,  left: 3,  size: 20, dur: 14, delay: 0,   rotate: 20,  color: 'green',   opacity: 0.22 },
  { id: 1,  left: 8,  size: 14, dur: 18, delay: -4,  rotate: -30, color: 'emerald', opacity: 0.18 },
  { id: 2,  left: 14, size: 24, dur: 12, delay: -8,  rotate: 45,  color: 'teal',    opacity: 0.20 },
  { id: 3,  left: 20, size: 16, dur: 20, delay: -12, rotate: -15, color: 'green',   opacity: 0.17 },
  { id: 4,  left: 26, size: 18, dur: 16, delay: -2,  rotate: 60,  color: 'lime',    opacity: 0.20 },
  { id: 5,  left: 32, size: 22, dur: 13, delay: -6,  rotate: -45, color: 'emerald', opacity: 0.22 },
  { id: 6,  left: 38, size: 12, dur: 19, delay: -10, rotate: 30,  color: 'green',   opacity: 0.16 },
  { id: 7,  left: 44, size: 26, dur: 15, delay: -14, rotate: -20, color: 'lime',    opacity: 0.18 },
  { id: 8,  left: 50, size: 16, dur: 17, delay: -3,  rotate: 75,  color: 'teal',    opacity: 0.20 },
  { id: 9,  left: 56, size: 20, dur: 11, delay: -7,  rotate: -60, color: 'green',   opacity: 0.22 },
  { id: 10, left: 62, size: 14, dur: 21, delay: -11, rotate: 15,  color: 'emerald', opacity: 0.17 },
  { id: 11, left: 68, size: 22, dur: 14, delay: -1,  rotate: -35, color: 'green',   opacity: 0.20 },
  { id: 12, left: 74, size: 18, dur: 16, delay: -5,  rotate: 50,  color: 'lime',    opacity: 0.18 },
  { id: 13, left: 80, size: 24, dur: 13, delay: -9,  rotate: -25, color: 'teal',    opacity: 0.22 },
  { id: 14, left: 86, size: 14, dur: 18, delay: -13, rotate: 40,  color: 'emerald', opacity: 0.17 },
  { id: 15, left: 92, size: 20, dur: 15, delay: -4,  rotate: -55, color: 'green',   opacity: 0.20 },
  { id: 16, left: 97, size: 16, dur: 22, delay: -18, rotate: 25,  color: 'lime',    opacity: 0.18 },
  { id: 17, left: 11, size: 18, dur: 17, delay: -16, rotate: -40, color: 'teal',    opacity: 0.20 },
  { id: 18, left: 47, size: 20, dur: 23, delay: -19, rotate: 65,  color: 'green',   opacity: 0.18 },
  { id: 19, left: 83, size: 16, dur: 20, delay: -15, rotate: -10, color: 'emerald', opacity: 0.20 },
];

const CO2_ITEMS = [
  { id: 0, left: 15, dur: 13, delay: -3  },
  { id: 1, left: 38, dur: 16, delay: -9  },
  { id: 2, left: 62, dur: 12, delay: -6  },
  { id: 3, left: 85, dur: 15, delay: -14 },
  { id: 4, left: 28, dur: 18, delay: -17 },
];

const TREES = [
  { id: 0, left: 1,  size: 90,  opacity: 0.08, swayDur: 7 },
  { id: 1, left: 88, size: 110, opacity: 0.07, swayDur: 8 },
  { id: 2, left: 50, size: 68,  opacity: 0.06, swayDur: 6 },
  { id: 3, left: 22, size: 58,  opacity: 0.06, swayDur: 9 },
  { id: 4, left: 72, size: 80,  opacity: 0.07, swayDur: 7 },
];

export const EcoBackground: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 overflow-hidden"
    style={{ zIndex: 1 }}
    aria-hidden="true"
  >
    {/* ── Floating leaves ──────────────────────────────────────── */}
    {LEAVES.map((leaf) => (
      <div
        key={leaf.id}
        className="absolute bottom-0"
        style={{
          left: `${leaf.left}%`,
          animation: `ecoLeafFloat ${leaf.dur}s ${leaf.delay}s linear infinite`,
        }}
      >
        <svg
          width={leaf.size}
          height={leaf.size}
          viewBox="0 0 24 24"
          className={LEAF_CLASSES[leaf.color]}
          style={{
            opacity: leaf.opacity,
            transform: `rotate(${leaf.rotate}deg)`,
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
          }}
        >
          <path d={LEAF_PATH} />
        </svg>
      </div>
    ))}

    {/* ── CO₂ bubble indicators ────────────────────────────────── */}
    {CO2_ITEMS.map((item) => (
      <div
        key={item.id}
        className="absolute bottom-0 select-none"
        style={{
          left: `${item.left}%`,
          animation: `ecoLeafFloat ${item.dur}s ${item.delay}s linear infinite`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full border font-mono font-bold
                     text-green-700 border-green-600/30 bg-green-600/5
                     dark:text-green-300 dark:border-green-400/25 dark:bg-green-400/5"
          style={{ width: 36, height: 36, fontSize: 9, opacity: 0.55 }}
        >
          CO₂
        </div>
      </div>
    ))}

    {/* ── Pine tree silhouettes at viewport bottom ─────────────── */}
    {TREES.map((tree) => (
      <div
        key={tree.id}
        className="absolute bottom-0"
        style={{
          left: `${tree.left}%`,
          opacity: tree.opacity,
          animation: `ecoTreeSway ${tree.swayDur}s ease-in-out infinite`,
          transformOrigin: 'bottom center',
        }}
      >
        <svg
          width={tree.size}
          height={tree.size}
          viewBox="0 0 24 26"
          className="fill-green-800 dark:fill-green-600"
        >
          <polygon points="12,1 0,11 24,11" />
          <polygon points="12,5 1,15 23,15" />
          <polygon points="12,9 2,20 22,20" />
          <rect x="10" y="20" width="4" height="5" />
        </svg>
      </div>
    ))}
  </div>
);
