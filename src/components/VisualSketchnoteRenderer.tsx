import React from 'react';
import { VisualSketchnoteData, VisualDiagramType, CardColor } from '../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ArrowDown,
  Wrench,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface VisualSketchnoteRendererProps {
  data: VisualSketchnoteData;
  penColorClass?: string;
  isEditable?: boolean;
  onUpdate?: (updated: VisualSketchnoteData) => void;
}

const CARD_COLOR_MAP: Record<CardColor, { bg: string; border: string; badge: string; accent: string }> = {
  cyan: {
    bg: 'bg-cyan-50/90',
    border: 'border-cyan-500',
    badge: 'bg-cyan-200/80 text-cyan-900 border-cyan-400',
    accent: '#06b6d4',
  },
  yellow: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-500',
    badge: 'bg-amber-200/80 text-amber-900 border-amber-400',
    accent: '#f59e0b',
  },
  green: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-500',
    badge: 'bg-emerald-200/80 text-emerald-900 border-emerald-400',
    accent: '#10b981',
  },
  pink: {
    bg: 'bg-pink-50/90',
    border: 'border-pink-500',
    badge: 'bg-pink-200/80 text-pink-900 border-pink-400',
    accent: '#ec4899',
  },
  purple: {
    bg: 'bg-purple-50/90',
    border: 'border-purple-500',
    badge: 'bg-purple-200/80 text-purple-900 border-purple-400',
    accent: '#8b5cf6',
  },
  orange: {
    bg: 'bg-orange-50/90',
    border: 'border-orange-500',
    badge: 'bg-orange-200/80 text-orange-900 border-orange-400',
    accent: '#f97316',
  },
  blue: {
    bg: 'bg-sky-50/90',
    border: 'border-sky-500',
    badge: 'bg-sky-200/80 text-sky-900 border-sky-400',
    accent: '#0284c7',
  },
};

// Hand-drawn style SVG illustrations for each visual representation
export const HandDrawnDiagramSvg: React.FC<{ type: VisualDiagramType; color?: CardColor }> = ({
  type,
  color = 'blue',
}) => {
  const accent = CARD_COLOR_MAP[color]?.accent || '#0284c7';

  switch (type) {
    case 'bar_chart':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2.5" stroke="currentColor" fill="none">
          {/* Hand-drawn Axes */}
          <path d="M12 8 L14 62 L112 60" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hand-drawn Bars with hatches */}
          <rect x="22" y="32" width="16" height="28" rx="2" fill={`${accent}30`} stroke={accent} strokeWidth="2.2" />
          <path d="M25 38 L35 34 M25 46 L35 42 M25 54 L35 50" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />

          <rect x="46" y="16" width="16" height="44" rx="2" fill={`${accent}45`} stroke={accent} strokeWidth="2.2" />
          <path d="M49 22 L59 18 M49 32 L59 28 M49 42 L59 38 M49 52 L59 48" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />

          <rect x="70" y="24" width="16" height="36" rx="2" fill={`${accent}30`} stroke={accent} strokeWidth="2.2" />
          <path d="M73 30 L83 26 M73 40 L83 36 M73 50 L83 46" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />

          <rect x="94" y="40" width="16" height="20" rx="2" fill={`${accent}20`} stroke={accent} strokeWidth="2.2" />
        </svg>
      );

    case 'line_chart':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2.5" stroke="currentColor" fill="none">
          {/* Axes */}
          <path d="M12 10 L14 62 L112 61" strokeLinecap="round" strokeLinejoin="round" />
          {/* Subtle grid lines */}
          <path d="M14 44 L110 44 M14 26 L110 26" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
          {/* Shaded area */}
          <path d="M18 52 Q38 42, 52 28 T84 34 T108 14 L108 61 L18 61 Z" fill={`${accent}25`} stroke="none" />
          {/* Trend line */}
          <path d="M18 52 Q38 42, 52 28 T84 34 T108 14" stroke={accent} strokeWidth="2.8" strokeLinecap="round" />
          {/* Data point dots */}
          <circle cx="18" cy="52" r="3.5" fill="#ffffff" stroke={accent} strokeWidth="2" />
          <circle cx="52" cy="28" r="3.5" fill="#ffffff" stroke={accent} strokeWidth="2" />
          <circle cx="84" cy="34" r="3.5" fill="#ffffff" stroke={accent} strokeWidth="2" />
          <circle cx="108" cy="14" r="3.5" fill="#ffffff" stroke={accent} strokeWidth="2" />
        </svg>
      );

    case 'pie_chart':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          {/* Pie Circle Slices */}
          <g transform="translate(48, 38)">
            {/* Slice 1 (45%) */}
            <path d="M0 0 L0 -28 A28 28 0 0 1 27 6 Z" fill={`${accent}40`} stroke={accent} strokeWidth="2" />
            {/* Slice 2 (30%) */}
            <path d="M0 0 L27 6 A28 28 0 0 1 -18 21 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            {/* Slice 3 (25%) */}
            <path d="M0 0 L-18 21 A28 28 0 0 1 0 -28 Z" fill="#86efac" stroke="#16a34a" strokeWidth="2" />
            {/* Center sketch circle */}
            <circle cx="0" cy="0" r="2.5" fill="#1e293b" />
          </g>
          {/* Mini labels on right */}
          <path d="M78 22 L94 22" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="22" r="2" fill={accent} />
          <path d="M78 38 L94 38" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="38" r="2" fill="#ca8a04" />
          <path d="M78 54 L94 54" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="54" r="2" fill="#16a34a" />
        </svg>
      );

    case 'scatter_plot':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          {/* Axes */}
          <path d="M12 10 L14 62 L112 60" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          {/* Linear correlation cloud */}
          <ellipse cx="64" cy="36" rx="38" ry="14" transform="rotate(-20 64 36)" fill={`${accent}15`} stroke={accent} strokeWidth="1" strokeDasharray="3 3" />
          {/* Scatter dots */}
          {[
            [24, 52], [32, 46], [38, 54], [44, 40], [50, 48],
            [56, 34], [64, 38], [72, 30], [78, 26], [84, 32],
            [90, 22], [96, 18], [102, 24]
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.8" fill={accent} stroke="#1e293b" strokeWidth="1.2" />
          ))}
          {/* Arrow indicating correlation */}
          <path d="M26 56 L102 18" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" />
        </svg>
      );

    case 'heatmap':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="1.5" stroke="currentColor" fill="none">
          {/* 4x3 Heatmap Grid */}
          <g transform="translate(18, 12)">
            {[
              [0.2, 0.5, 0.8, 0.3],
              [0.4, 0.9, 0.6, 0.7],
              [0.8, 0.3, 0.95, 0.5],
            ].map((row, r) =>
              row.map((val, c) => (
                <g key={`${r}-${c}`} transform={`translate(${c * 22}, ${r * 18})`}>
                  <rect
                    width="20"
                    height="16"
                    rx="3"
                    fill={accent}
                    fillOpacity={val}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <text
                    x="10"
                    y="11"
                    textAnchor="middle"
                    fontSize="7"
                    fontFamily="monospace"
                    fill={val > 0.6 ? '#ffffff' : '#0f172a'}
                    stroke="none"
                    fontWeight="bold"
                  >
                    {Math.round(val * 100)}
                  </text>
                </g>
              ))
            )}
          </g>
        </svg>
      );

    case 'hierarchy_tree':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          {/* Root Node */}
          <rect x="44" y="6" width="32" height="16" rx="4" fill={`${accent}35`} stroke={accent} strokeWidth="2" />
          <text x="60" y="17" textAnchor="middle" fontSize="8" fill="#0f172a" stroke="none" fontWeight="bold">Root</text>

          {/* Connectors */}
          <path d="M60 22 L60 32 M60 32 L26 32 M60 32 L94 32 M26 32 L26 42 M60 32 L60 42 M94 32 L94 42" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />

          {/* Child Nodes */}
          <rect x="12" y="42" width="28" height="15" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.8" />
          <text x="26" y="52" textAnchor="middle" fontSize="7" fill="#0f172a" stroke="none">Child A</text>

          <rect x="46" y="42" width="28" height="15" rx="3" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.8" />
          <text x="60" y="52" textAnchor="middle" fontSize="7" fill="#0f172a" stroke="none">Child B</text>

          <rect x="80" y="42" width="28" height="15" rx="3" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.8" />
          <text x="94" y="52" textAnchor="middle" fontSize="7" fill="#0f172a" stroke="none">Child C</text>
        </svg>
      );

    case 'flowchart':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          {/* Start Pill */}
          <rect x="8" y="28" width="24" height="18" rx="9" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2" />
          <text x="20" y="39" textAnchor="middle" fontSize="7" fill="#065f46" stroke="none" fontWeight="bold">Start</text>

          {/* Arrow */}
          <path d="M32 37 L44 37" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

          {/* Decision Diamond */}
          <g transform="translate(56, 37)">
            <polygon points="0,-16 16,0 0,16 -16,0" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <text x="0" y="3" textAnchor="middle" fontSize="6.5" fill="#854d0e" stroke="none" fontWeight="bold">Rule?</text>
          </g>

          {/* Arrow Yes / No */}
          <path d="M72 37 L86 37" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          {/* End Box */}
          <rect x="86" y="28" width="26" height="18" rx="3" fill={`${accent}35`} stroke={accent} strokeWidth="2" />
          <text x="99" y="39" textAnchor="middle" fontSize="7" fill="#0f172a" stroke="none" fontWeight="bold">Output</text>
        </svg>
      );

    case 'radar_chart':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="1.5" stroke="currentColor" fill="none">
          <g transform="translate(60, 38)">
            {/* Concentric Polygons */}
            <polygon points="0,-28 26,-8 16,24 -16,24 -26,-8" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="0,-18 17,-5 10,15 -10,15 -17,-5" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            {/* Axis spokes */}
            <line x1="0" y1="0" x2="0" y2="-28" stroke="#64748b" strokeWidth="1" />
            <line x1="0" y1="0" x2="26" y2="-8" stroke="#64748b" strokeWidth="1" />
            <line x1="0" y1="0" x2="16" y2="24" stroke="#64748b" strokeWidth="1" />
            <line x1="0" y1="0" x2="-16" y2="24" stroke="#64748b" strokeWidth="1" />
            <line x1="0" y1="0" x2="-26" y2="-8" stroke="#64748b" strokeWidth="1" />
            {/* Data shape */}
            <polygon points="0,-24 20,-6 8,18 -12,10 -18,-6" fill={`${accent}40`} stroke={accent} strokeWidth="2.2" />
            <circle cx="0" cy="-24" r="2.5" fill={accent} />
            <circle cx="20" cy="-6" r="2.5" fill={accent} />
            <circle cx="8" cy="18" r="2.5" fill={accent} />
            <circle cx="-12" cy="10" r="2.5" fill={accent} />
            <circle cx="-18" cy="-6" r="2.5" fill={accent} />
          </g>
        </svg>
      );

    case 'funnel':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="1.8" stroke="currentColor" fill="none">
          {/* Top Wide Tier */}
          <polygon points="14,10 106,10 94,28 26,28" fill={`${accent}35`} stroke={accent} />
          <text x="60" y="21" textAnchor="middle" fontSize="7.5" fill="#0f172a" stroke="none" fontWeight="bold">Top (100%)</text>

          {/* Middle Tier */}
          <polygon points="28,32 92,32 80,48 40,48" fill="#fde047" stroke="#ca8a04" />
          <text x="60" y="42" textAnchor="middle" fontSize="7" fill="#713f12" stroke="none" fontWeight="bold">Engaged (40%)</text>

          {/* Bottom Narrow Tier */}
          <polygon points="42,52 78,52 68,68 52,68" fill="#86efac" stroke="#16a34a" />
          <text x="60" y="62" textAnchor="middle" fontSize="6.5" fill="#14532d" stroke="none" fontWeight="bold">Done (12%)</text>
        </svg>
      );

    case 'gauge':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          <g transform="translate(60, 56)">
            {/* Arc Background */}
            <path d="M-42 0 A42 42 0 0 1 42 0" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
            {/* Green / Amber / Red sections */}
            <path d="M-42 0 A42 42 0 0 1 -14 -39" stroke="#86efac" strokeWidth="8" />
            <path d="M-14 -39 A42 42 0 0 1 18 -38" stroke="#fde047" strokeWidth="8" />
            <path d="M18 -38 A42 42 0 0 1 42 0" stroke="#fca5a5" strokeWidth="8" />
            {/* Pointer needle */}
            <path d="M0 0 L16 -28" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="5" fill="#1e293b" />
          </g>
        </svg>
      );

    case 'matrix':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="1.8" stroke="currentColor" fill="none">
          {/* 2x2 Matrix */}
          <g transform="translate(20, 10)">
            <rect x="0" y="0" width="38" height="24" fill="#dbeafe" stroke="#3b82f6" rx="2" />
            <text x="19" y="14" textAnchor="middle" fontSize="6.5" fill="#1e3a8a" stroke="none" fontWeight="bold">Quick Wins</text>

            <rect x="42" y="0" width="38" height="24" fill="#dcfce7" stroke="#22c55e" rx="2" />
            <text x="61" y="14" textAnchor="middle" fontSize="6.5" fill="#14532d" stroke="none" fontWeight="bold">Major Projects</text>

            <rect x="0" y="28" width="38" height="24" fill="#fef3c7" stroke="#f59e0b" rx="2" />
            <text x="19" y="42" textAnchor="middle" fontSize="6.5" fill="#78350f" stroke="none" fontWeight="bold">Fill-Ins</text>

            <rect x="42" y="28" width="38" height="24" fill="#fee2e2" stroke="#ef4444" rx="2" />
            <text x="61" y="42" textAnchor="middle" fontSize="6.5" fill="#7f1d1d" stroke="none" fontWeight="bold">Avoid / Defer</text>
          </g>
        </svg>
      );

    case 'timeline':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          {/* Main Track */}
          <line x1="12" y1="38" x2="108" y2="38" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Milestones */}
          {[
            { x: 24, label: 'Phase 1', up: true, col: '#3b82f6' },
            { x: 50, label: 'Phase 2', up: false, col: '#10b981' },
            { x: 76, label: 'Phase 3', up: true, col: '#f59e0b' },
            { x: 98, label: 'Launch', up: false, col: '#ec4899' },
          ].map((m, idx) => (
            <g key={idx}>
              <circle cx={m.x} cy="38" r="4.5" fill="#ffffff" stroke={m.col} strokeWidth="2.5" />
              <line x1={m.x} y1="38" x2={m.x} y2={m.up ? 22 : 54} stroke={m.col} strokeWidth="1.5" />
              <rect
                x={m.x - 14}
                y={m.up ? 10 : 54}
                width="28"
                height="12"
                rx="2"
                fill={`${m.col}20`}
                stroke={m.col}
                strokeWidth="1"
              />
              <text
                x={m.x}
                y={m.up ? 18 : 62}
                textAnchor="middle"
                fontSize="6"
                fill="#0f172a"
                stroke="none"
                fontWeight="bold"
              >
                {m.label}
              </text>
            </g>
          ))}
        </svg>
      );

    case 'cycle':
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          <g transform="translate(60, 38)">
            {/* 3 Curved rotating arrows */}
            <path d="M-4 -24 A26 26 0 0 1 24 -4" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="24,-10 28,-2 20,-2" fill={accent} stroke="none" />

            <path d="M22 6 A26 26 0 0 1 -4 24" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="-4,20 -10,26 -2,28" fill="#ca8a04" stroke="none" />

            <path d="M-18 18 A26 26 0 0 1 -18 -18" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="-22,-14 -16,-22 -14,-14" fill="#16a34a" stroke="none" />

            <text x="0" y="3" textAnchor="middle" fontSize="6.5" fill="#0f172a" stroke="none" fontWeight="bold">Cycle</text>
          </g>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 120 75" className="w-full h-18 text-stone-800" strokeWidth="2" stroke="currentColor" fill="none">
          <rect x="18" y="14" width="84" height="48" rx="6" fill={`${accent}20`} stroke={accent} strokeWidth="2" />
          <path d="M24 24 L50 24 M24 34 L76 34 M24 44 L60 44" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <circle cx="84" cy="38" r="10" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
        </svg>
      );
  }
};

export const VisualSketchnoteRenderer: React.FC<VisualSketchnoteRendererProps> = ({
  data,
  penColorClass = 'text-blue-900',
  isEditable = false,
  onUpdate,
}) => {
  return (
    <div className="my-4 space-y-4">
      {/* 1. Sketchnote Header Banner (Hand-drawn look with washi tape) */}
      <div className="relative text-center my-3">
        {/* Washi tape stickers at top corners */}
        <div className="absolute -top-3 left-4 sm:left-12 w-16 h-5 washi-tape -rotate-6 z-10 pointer-events-none rounded-xs" />
        <div className="absolute -top-3 right-4 sm:right-12 w-16 h-5 washi-tape-pink rotate-6 z-10 pointer-events-none rounded-xs" />

        <div className="inline-block relative max-w-full px-4 sm:px-8 py-2.5 rounded-lg border-2 border-dashed border-stone-800 bg-amber-50/95 shadow-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-purple-200 text-purple-900 border border-purple-400">
              {data.badge || '🎨 VISUAL SKETCHNOTES'}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-xs text-stone-600 font-semibold italic">
              {data.subtitle || 'Hand-drawn Concept & Diagram Taxonomy'}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-wide uppercase text-stone-900 break-words font-kalam">
            {data.title}
          </h2>
        </div>
      </div>

      {/* 2. Visual Representation Grid (2x5 / 2x4 Visual Taxonomy Cards) */}
      {data.visualCards && data.visualCards.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-dashed border-stone-300">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Visual Models & Charts
              </span>
              <span className="text-xs text-stone-500 hidden sm:inline">
                Tap or view each diagrammatic mental model
              </span>
            </div>
            <span className="text-xs font-bold text-stone-600">
              {data.visualCards.length} Types
            </span>
          </div>

          {/* Responsive Grid: 1 col on mobile, 2 on sm, 3 on md, up to 5 on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Array.isArray(data.visualCards) ? data.visualCards : []).map((card, idx) => {
              const colorKey: CardColor = card.color || (['blue', 'green', 'yellow', 'pink', 'purple', 'cyan', 'orange'][idx % 7] as CardColor);
              const style = CARD_COLOR_MAP[colorKey] || CARD_COLOR_MAP.blue;

              return (
                <div
                  key={card.id || idx}
                  className={`rounded-xl border-2 p-2.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between ${style.bg} ${style.border}`}
                >
                  <div>
                    {/* Header: Name & Category Badge */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="font-bold text-xs sm:text-sm text-stone-900 leading-tight">
                        {card.name}
                      </div>
                      {card.category && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 border ${style.badge}`}>
                          {card.category}
                        </span>
                      )}
                    </div>

                    {/* Hand-Drawn SVG Visual Representation */}
                    <div className="my-1.5 p-1 rounded-lg bg-white/80 border border-black/10 shadow-inner flex items-center justify-center">
                      <HandDrawnDiagramSvg type={card.visualType} color={colorKey} />
                    </div>

                    {/* When To Use */}
                    <div className="mt-2 text-[11px] text-stone-800 leading-snug">
                      <span className="font-bold text-stone-900 block text-[10px] uppercase text-purple-900">
                        📌 When To Use :
                      </span>
                      {card.whenToUse}
                    </div>
                  </div>

                  {/* Golden Rule / Pro Tip if present */}
                  {card.keyRuleOrTip && (
                    <div className="mt-2 pt-1.5 border-t border-dashed border-black/15 text-[10px] font-semibold text-stone-700 italic flex items-start gap-1">
                      <span className="text-amber-600 shrink-0">💡</span>
                      <span>{card.keyRuleOrTip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Visual Execution Pipeline / Step Flowchart */}
      {data.pipelineSteps && data.pipelineSteps.length > 0 && (
        <div className="my-4 p-3.5 rounded-xl border-2 border-dashed border-stone-400 bg-white/85 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-1 border-b border-stone-200">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs border border-blue-300">
              FLOWCHART
            </span>
            <span className="font-bold text-xs sm:text-sm text-stone-800">
              Step-by-Step Execution Pipeline / Workflow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-center">
            {(Array.isArray(data.pipelineSteps) ? data.pipelineSteps : []).map((step, sIdx) => {
              const colorKey: CardColor = step.color || (['blue', 'green', 'purple', 'cyan'][sIdx % 4] as CardColor);
              const style = CARD_COLOR_MAP[colorKey] || CARD_COLOR_MAP.blue;

              return (
                <React.Fragment key={sIdx}>
                  <div
                    className={`relative p-3 rounded-lg border-2 shadow-xs text-center ${style.bg} ${style.border}`}
                  >
                    <div className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-stone-900 text-white rounded text-[9px] font-bold">
                      Step {step.stepNumber || sIdx + 1}
                    </div>

                    <div className="text-2xl mb-1">{step.icon || '⚙️'}</div>
                    <div className="font-bold text-xs text-stone-900">
                      {step.title}
                    </div>
                    <div className="text-[11px] text-stone-700 mt-1 leading-tight">
                      {step.desc}
                    </div>
                  </div>

                  {/* Connectors */}
                  {sIdx < data.pipelineSteps!.length - 1 && (
                    <div className="flex md:hidden items-center justify-center my-0.5 text-stone-400">
                      <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    </div>
                  )}
                  {sIdx < data.pipelineSteps!.length - 1 && (
                    <div className="hidden md:flex items-center justify-center -mx-1 text-stone-500">
                      <ArrowRight className="w-4 h-4 animate-pulse" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Do's & Don'ts Checklist (Golden Rules) */}
      {data.dosAndDonts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
          {/* DO */}
          <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/80 shadow-xs">
            <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide">
                Best Practices & Do's (सफल नियम)
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800">
              {(Array.isArray(data.dosAndDonts.dos) ? data.dosAndDonts.dos : []).map((item, dIdx) => (
                <li key={dIdx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DON'T */}
          <div className="p-3.5 rounded-xl border-2 border-rose-500 bg-rose-50/80 shadow-xs">
            <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-rose-200">
              <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-rose-950 uppercase tracking-wide">
                Common Pitfalls & Don'ts (बचने योग्य गलतियाँ)
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800">
              {(Array.isArray(data.dosAndDonts.donts) ? data.dosAndDonts.donts : []).map((item, dIdx) => (
                <li key={dIdx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-rose-600 font-bold shrink-0">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. Tools & Ecosystem Tags */}
      {data.toolsAndStack && data.toolsAndStack.length > 0 && (
        <div className="p-3 rounded-xl border border-stone-300 bg-stone-50/80 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <Wrench className="w-3.5 h-3.5 text-stone-600" />
            <span className="font-bold text-xs text-stone-800 uppercase tracking-wider">
              Tools, Libraries & Standards Ecosystem:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(data.toolsAndStack) ? data.toolsAndStack : []).map((tool, tIdx) => (
              <div
                key={tIdx}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border-2 border-stone-700 text-stone-900 text-xs font-bold shadow-xs hover:scale-105 transition-transform"
              >
                <span>🏷️</span>
                <span>{tool.name}</span>
                {tool.category && (
                  <span className="text-[10px] text-stone-500 font-normal">
                    ({tool.category})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Pro Tip / Key Takeaway Cloud */}
      {data.proTipOrCloud && (
        <div className="relative mt-4">
          <div className="p-3.5 rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-100 shadow-md text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-xs mb-1.5 shadow-xs">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>CORE TAKEAWAY & VISUAL INSIGHT</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-stone-900 leading-relaxed font-kalam">
              "{data.proTipOrCloud}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
