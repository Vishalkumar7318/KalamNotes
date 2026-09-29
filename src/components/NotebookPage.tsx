import React, { useState } from 'react';
import {
  NotePage,
  NoteSection,
  ConceptCard,
  StickyNoteItem,
  CardColor,
  StickyColor,
} from '../types';
import { StickyNote } from './StickyNote';
import { DiagramRenderer } from './DiagramRenderer';
import { VisualSketchnoteRenderer } from './VisualSketchnoteRenderer';
import { downloadPageAsImage } from '../utils/exportUtils';
import {
  Plus,
  Trash2,
  StickyNote as StickyIcon,
  HelpCircle,
  Table as TableIcon,
  Share2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Download,
  Loader2,
} from 'lucide-react';

interface NotebookPageProps {
  page: NotePage;
  totalPages: number;
  onUpdatePage: (updated: NotePage) => void;
  onDeletePage?: (pageId: string) => void;
  isEditable?: boolean;
}

const PEN_COLOR_CLASSES = {
  blue: 'text-blue-800',
  darkblue: 'text-blue-900',
  black: 'text-stone-900',
  purple: 'text-purple-900',
  green: 'text-emerald-900',
};

const CARD_BG_CLASSES: Record<CardColor, { bg: string; border: string; title: string }> = {
  cyan: {
    bg: 'bg-cyan-50/90',
    border: 'border-cyan-400',
    title: 'text-cyan-900 bg-cyan-100/70',
  },
  yellow: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-400',
    title: 'text-amber-900 bg-amber-100/70',
  },
  green: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-400',
    title: 'text-emerald-900 bg-emerald-100/70',
  },
  pink: {
    bg: 'bg-pink-50/90',
    border: 'border-pink-400',
    title: 'text-pink-900 bg-pink-100/70',
  },
  purple: {
    bg: 'bg-purple-50/90',
    border: 'border-purple-400',
    title: 'text-purple-900 bg-purple-100/70',
  },
  orange: {
    bg: 'bg-orange-50/90',
    border: 'border-orange-400',
    title: 'text-orange-900 bg-orange-100/70',
  },
  blue: {
    bg: 'bg-sky-50/90',
    border: 'border-sky-400',
    title: 'text-sky-900 bg-sky-100/70',
  },
};

export const NotebookPage: React.FC<NotebookPageProps> = ({
  page,
  totalPages,
  onUpdatePage,
  onDeletePage,
  isEditable = true,
}) => {
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const handleDownloadThisPage = async () => {
    setIsExportingImage(true);
    const success = await downloadPageAsImage(
      `notebook-page-${page.id}`,
      `${page.headerTitle || 'note'}-page-${page.pageNumber}`
    );
    setIsExportingImage(false);
  };

  // Background pattern selector
  const patternClass =
    page.paperPattern === 'legal' ? 'bg-notebook-ruled-legal' :
    page.paperPattern === 'grid' ? 'bg-notebook-grid' :
    page.paperPattern === 'dot' ? 'bg-notebook-dot' :
    page.paperPattern === 'parchment' ? 'bg-notebook-parchment' :
    page.paperPattern === 'clean' ? 'bg-notebook-clean' :
    'bg-notebook-ruled';

  const penClass = PEN_COLOR_CLASSES[page.penColor] || 'text-blue-900';
  const fontClass = page.fontFamily || 'font-kalam';

  // Section updaters
  const handleUpdateSection = (idx: number, updated: NoteSection) => {
    const newSections = [...page.sections];
    newSections[idx] = updated;
    onUpdatePage({ ...page, sections: newSections });
  };

  const handleDeleteSection = (idx: number) => {
    const newSections = page.sections.filter((_, i) => i !== idx);
    onUpdatePage({ ...page, sections: newSections });
  };

  // Sticky notes updaters
  const handleUpdateSticky = (updated: StickyNoteItem) => {
    const newStickies = page.stickyNotes.map((s) => (s.id === updated.id ? updated : s));
    onUpdatePage({ ...page, stickyNotes: newStickies });
  };

  const handleDeleteSticky = (id: string) => {
    const newStickies = page.stickyNotes.filter((s) => s.id !== id);
    onUpdatePage({ ...page, stickyNotes: newStickies });
  };

  const handleAddSticky = (color: StickyColor = 'yellow') => {
    const newSticky: StickyNoteItem = {
      id: 'sticky-' + Date.now(),
      title: '📌 Exam Note',
      content: 'Write an important formula, quick trick or reminder here...',
      color,
      rotation: Math.floor(Math.random() * 6) - 3,
      x: 70,
      y: 15,
    };
    onUpdatePage({ ...page, stickyNotes: [...page.stickyNotes, newSticky] });
  };

  // Add new section helpers
  const handleAddSection = (type: NoteSection['type']) => {
    setShowAddSectionMenu(false);
    const nextQNum = page.sections.length + 1;
    let newSec: NoteSection;

    if (type === 'question_cards') {
      newSec = {
        id: 'sec-' + Date.now(),
        type: 'question_cards',
        qBadge: `Q${nextQNum}`,
        qTitle: 'Explain the Core Concepts, Key Features & Practical Implementation',
        layout: 'grid-4',
        cards: [
          {
            id: 'c1-' + Date.now(),
            title: 'Definition :',
            color: 'cyan',
            items: ['Write core definition and fundamental concept clearly in 2-3 sentences.'],
          },
          {
            id: 'c2-' + Date.now(),
            title: 'Essential Features :',
            color: 'yellow',
            items: ['① Key point one', '② Key point two', '③ Key point three'],
          },
          {
            id: 'c3-' + Date.now(),
            title: 'Advantages :',
            color: 'green',
            items: ['• Scalable & reliable', '• High performance', '• Cost efficient'],
          },
          {
            id: 'c4-' + Date.now(),
            title: 'Limitations :',
            color: 'pink',
            items: ['• Dependency on infrastructure', '• Initial setup complexity'],
          },
        ],
      };
    } else if (type === 'comparison_table') {
      newSec = {
        id: 'sec-' + Date.now(),
        type: 'comparison_table',
        qBadge: `Q${nextQNum}`,
        qTitle: 'Detailed Comparison Table : Explain Differences and Trade-offs',
        table: {
          headers: [
            { text: 'Category / Type A', color: 'blue' },
            { text: 'Category / Type B', color: 'green' },
            { text: 'Category / Type C', color: 'purple' },
          ],
          rows: [
            {
              label: 'Core Working',
              cells: [
                'Direct point on approach A',
                'Direct point on approach B',
                'Direct point on approach C',
              ],
            },
            {
              label: 'Real Examples',
              cells: ['Example A (e.g. AWS)', 'Example B (e.g. Private)', 'Example C (e.g. Hybrid)'],
            },
          ],
        },
      };
    } else if (type === 'diagram_flow') {
      newSec = {
        id: 'sec-' + Date.now(),
        type: 'diagram_flow',
        qBadge: `Q${nextQNum}`,
        qTitle: 'Architecture & Step-by-Step Flowchart Diagram',
        diagram: {
          title: 'System Architecture (Simplified)',
          diagramType: 'horizontal_flow',
          steps: [
            { step: '1', title: 'Input / Client', desc: 'User Request', color: 'green', icon: '💻' },
            { step: '2', title: 'Network / Gateway', desc: 'Secure Proxy', color: 'blue', icon: '🌐' },
            { step: '3', title: 'Processing Server', desc: 'Business Logic', color: 'purple', icon: '⚙️' },
            { step: '4', title: 'Storage Layer', desc: 'Database & Cache', color: 'cyan', icon: '💾' },
          ],
        },
      };
    } else if (type === 'interview_qa') {
      newSec = {
        id: 'sec-' + Date.now(),
        type: 'interview_qa',
        qBadge: 'TARGET',
        qTitle: 'Top Technical Interview & Viva Questions',
        interview: [
          {
            id: 'int-' + Date.now(),
            question: 'Q: What is the most critical difference and common mistake here?',
            answer: 'Explain the core distinction concisely with keywords and a real-world scenario.',
            expectedKeywords: ['Keywords to highlight', 'Viva trick'],
            importance: 'high',
          },
        ],
      };
    } else if (type === 'visual_sketchnotes') {
      newSec = {
        id: 'sec-' + Date.now(),
        type: 'visual_sketchnotes',
        qBadge: 'VISUAL',
        qTitle: 'Visual Sketchnotes & Concept Taxonomy Grid',
        visualSketchnote: {
          title: 'DATA & CONCEPT VISUALIZATION SKETCHNOTES',
          subtitle: 'Hand-drawn Concept & Diagrammatic Mental Models',
          badge: '🎨 VISUAL SKETCHNOTES',
          visualCards: [
            {
              id: 'vc-1',
              name: 'Bar Chart',
              category: 'Comparison',
              visualType: 'bar_chart',
              whenToUse: 'Discrete categories comparison over a common baseline (e.g. Sales by Region).',
              keyRuleOrTip: 'Always start Y-axis from 0 to avoid misleading scaling!',
              color: 'blue',
            },
            {
              id: 'vc-2',
              name: 'Line Chart',
              category: 'Trend over Time',
              visualType: 'line_chart',
              whenToUse: 'Continuous time-series tracking (e.g. Daily active users, stock prices).',
              keyRuleOrTip: 'Limit to 3-4 series per chart to prevent spaghetti lines.',
              color: 'green',
            },
            {
              id: 'vc-3',
              name: 'Pie / Donut',
              category: 'Composition',
              visualType: 'pie_chart',
              whenToUse: 'Showing share of total (percentages summing to 100%).',
              keyRuleOrTip: 'Max 5 slices; sort clockwise from largest to smallest.',
              color: 'yellow',
            },
            {
              id: 'vc-4',
              name: 'Scatter Plot',
              category: 'Correlation',
              visualType: 'scatter_plot',
              whenToUse: 'Detecting relationship/clustering between two numerical variables.',
              keyRuleOrTip: 'Look for linear trend, clusters, or extreme outliers.',
              color: 'pink',
            },
            {
              id: 'vc-5',
              name: 'Heatmap',
              category: 'Matrix Intensity',
              visualType: 'heatmap',
              whenToUse: '2D matrix comparison with color density (e.g. User activity by hour vs day).',
              keyRuleOrTip: 'Use monochromatic gradient or diverging scale with neutral midpoint.',
              color: 'purple',
            },
            {
              id: 'vc-6',
              name: 'Hierarchy Tree',
              category: 'Structure',
              visualType: 'hierarchy_tree',
              whenToUse: 'Parent-child relationships, taxonomies, organizational breakdowns.',
              keyRuleOrTip: 'Keep tree depth balanced (max 3-4 levels visible at once).',
              color: 'cyan',
            },
            {
              id: 'vc-7',
              name: 'Flowchart / Logic',
              category: 'Workflow',
              visualType: 'flowchart',
              whenToUse: 'Algorithmic decision trees, business processes, lifecycle pipelines.',
              keyRuleOrTip: 'Clearly label every decision branch (Yes/No, True/False).',
              color: 'orange',
            },
            {
              id: 'vc-8',
              name: 'Radar / Spider',
              category: 'Multi-Attribute',
              visualType: 'radar_chart',
              whenToUse: 'Benchmarking performance across 5-6 diverse skill or feature metrics.',
              keyRuleOrTip: 'Normalize scales across all spokes before plotting.',
              color: 'blue',
            },
          ],
          pipelineSteps: [
            { stepNumber: 1, title: 'Understand & Define', desc: 'Identify the core question and audience goal.', icon: '🎯', color: 'blue' },
            { stepNumber: 2, title: 'Clean & Structure', desc: 'Verify data integrity and eliminate noise.', icon: '🧹', color: 'green' },
            { stepNumber: 3, title: 'Select Visual Model', desc: 'Choose the exact chart/diagram matching the data shape.', icon: '📊', color: 'purple' },
            { stepNumber: 4, title: 'Design & Iterate', desc: 'Apply high-contrast colors, clear labels, and callouts.', icon: '✨', color: 'cyan' },
          ],
          dosAndDonts: {
            dos: [
              'Start bar chart axes at zero (0) for truthful proportion.',
              'Use color with purpose: highlight only the primary insight.',
              'Include concise titles that state the takeaway, not just the metric.',
              'Ensure typography is legible and accessible on both desktop and mobile.',
            ],
            donts: [
              'Never use 3D effects or decorative shadows that distort data angles.',
              'Avoid overwhelming charts with rainbow colors and unnecessary legends.',
              'Do not clutter with excessive grid lines that drown the signal.',
              'Never truncate axes without an explicit visual break indicator.',
            ],
          },
          toolsAndStack: [
            { name: 'Tableau', category: 'BI Dashboard', badgeColor: 'blue' },
            { name: 'Power BI', category: 'Enterprise Analytics', badgeColor: 'yellow' },
            { name: 'Python (Matplotlib/Seaborn)', category: 'Data Science', badgeColor: 'green' },
            { name: 'D3.js', category: 'Custom Web Viz', badgeColor: 'orange' },
            { name: 'Figma / Canva', category: 'Infographic Layout', badgeColor: 'purple' },
          ],
          proTipOrCloud: 'The goal of visualization is INSIGHT, not pictures. Pick the simplest chart that directly answers the user’s key question!',
        },
      };
    } else {
      newSec = {
        id: 'sec-' + Date.now(),
        type: 'exam_tips',
        qBadge: 'EXAM',
        qTitle: '⚡ 2-Minute Quick Revision & 10-Marks Scoring Checklist',
        examTips: {
          title: 'Exam Hall Revision Checklist',
          weightage: '10 Marks Question Breakdown',
          keyFormulasOrPoints: [
            '1. Always start with formal standard definition.',
            '2. Draw neat labelled diagram for guaranteed top marks.',
            '3. Write at least 2 real-world company examples.',
          ],
          mustRememberTip: 'Golden Rule: Neat headings + diagram + comparison = 10/10 marks!',
        },
      };
    }

    onUpdatePage({ ...page, sections: [...page.sections, newSec] });
  };

  return (
    <div className="relative my-4 sm:my-6 mx-auto w-full max-w-5xl transition-all">
      {/* Notebook Sheet Container */}
      <div
        id={`notebook-page-${page.id}`}
        className={`print-page relative rounded-xl shadow-2xl border border-stone-300 overflow-hidden ${patternClass} ${fontClass} ${penClass} p-2.5 sm:p-6 md:p-10`}
        style={{ minHeight: '900px' }}
      >
        {/* Left Spiral Binding Rings (if enabled) */}
        {page.showSpiral && (
          <div className="absolute left-0.5 sm:left-1.5 top-0 bottom-0 flex flex-col justify-around py-6 pointer-events-none select-none z-10">
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} className="flex items-center">
                {/* Hole */}
                <div className="w-2 sm:w-3.5 h-2 sm:h-3.5 rounded-full bg-stone-800 shadow-inner border border-stone-900" />
                {/* Metal coil loop */}
                <div className="w-2 sm:w-4 h-1 sm:h-2 -ml-0.5 sm:-ml-1.5 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-500 rounded-r-full shadow-md" />
              </div>
            ))}
          </div>
        )}

        {/* Notebook Top Header Bar: Date & Page No. & Download Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-dashed border-red-300 pl-4 sm:pl-8">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-600 bg-red-100/60 px-2 py-0.5 rounded truncate max-w-[140px] sm:max-w-xs">
              {page.subject || 'HANDWRITTEN REVISION NOTES'}
            </span>
            {page.headerSubtitle && (
              <span className="text-xs text-stone-600 italic hidden md:inline truncate max-w-xs">
                • {page.headerSubtitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Download This Page Button */}
            <button
              type="button"
              onClick={handleDownloadThisPage}
              disabled={isExportingImage}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-900 border border-emerald-500/50 rounded-lg text-[11px] sm:text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer no-print"
              title="Download this page as high-res PNG image"
            >
              {isExportingImage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download Page {page.pageNumber}</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-white/80 px-2 sm:px-3 py-1 rounded-md border border-stone-300 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="text-stone-500 hidden sm:inline">Date:</span>
                {isEditable ? (
                  <input
                    type="text"
                    value={page.date || ''}
                    onChange={(e) => onUpdatePage({ ...page, date: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-16 sm:w-24 bg-transparent border-b border-stone-400 focus:outline-none focus:border-red-500 text-[10px] sm:text-xs px-0.5"
                  />
                ) : (
                  <span className="text-[10px] sm:text-xs">{page.date}</span>
                )}
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1">
                <span className="text-stone-500 hidden sm:inline">Page:</span>
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded border border-amber-300 text-[10px] sm:text-xs">
                  {page.pageNumber} / {totalPages}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Title Banner with Yellow Highlighter Effect */}
        <div className="text-center my-3 pl-4 sm:pl-8">
          <div className="inline-block relative max-w-full">
            <div className="px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-sm highlighter-yellow border-2 border-stone-800 shadow-sm transition-transform hover:scale-[1.01]">
              {isEditable ? (
                <input
                  type="text"
                  value={page.headerTitle}
                  onChange={(e) => onUpdatePage({ ...page, headerTitle: e.target.value })}
                  className="w-full text-center font-bold text-sm sm:text-xl md:text-2xl lg:text-3xl tracking-wide bg-transparent focus:outline-none uppercase text-stone-900"
                  placeholder="MAIN TITLE - 10 MARKS NOTES"
                />
              ) : (
                <h1 className="font-bold text-sm sm:text-xl md:text-2xl lg:text-3xl tracking-wide uppercase text-stone-900 break-words">
                  {page.headerTitle}
                </h1>
              )}
            </div>
          </div>
        </div>

        {/* Floating / Pinned Sticky Notes for this page */}
        {page.stickyNotes && page.stickyNotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 my-3 sm:my-4 pl-4 sm:pl-8">
            {page.stickyNotes.map((sticky) => (
              <StickyNote
                key={sticky.id}
                note={sticky}
                onUpdate={handleUpdateSticky}
                onDelete={handleDeleteSticky}
                editable={isEditable}
              />
            ))}
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-4 sm:space-y-6 mt-4 pl-6 sm:pl-8">
          {page.sections.map((section, sIdx) => (
            <div
              key={section.id}
              className="relative p-3.5 sm:p-4 rounded-lg bg-white/75 backdrop-blur-xs border border-stone-300/80 shadow-xs transition-shadow hover:shadow-md group"
            >
              {/* Delete section button */}
              {isEditable && (
                <button
                  type="button"
                  onClick={() => handleDeleteSection(sIdx)}
                  title="Remove this question section"
                  className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity no-print"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Question / Heading Header Bar */}
              <div className="flex items-start gap-2.5 mb-3">
                {/* Badge [Q1], [Q2], etc. */}
                <div className="shrink-0 px-2.5 py-0.5 rounded font-bold text-sm bg-purple-100 text-purple-900 border-2 border-purple-800 shadow-xs">
                  {section.qBadge || `Q${sIdx + 1}`}
                </div>

                {/* Question title */}
                <div className="flex-1">
                  {isEditable ? (
                    <input
                      type="text"
                      value={section.qTitle || (section as any).title || (section as any).heading || 'Key Concepts and Important Details'}
                      onChange={(e) => {
                        handleUpdateSection(sIdx, { ...section, qTitle: e.target.value });
                      }}
                      className="w-full font-bold text-base sm:text-lg text-stone-900 bg-transparent border-b border-dashed border-stone-400 focus:outline-none focus:border-blue-600"
                    />
                  ) : (
                    <h2 className="font-bold text-base sm:text-lg text-stone-900 leading-snug">
                      {section.qTitle || (section as any).title || (section as any).heading || 'Key Concepts and Important Details'}
                    </h2>
                  )}
                </div>
              </div>

              {/* TYPE: Question Cards (Def, Char, Adv, Lim) */}
              {section.type === 'question_cards' && section.cards && (
                <div>
                  <div
                    className={`grid gap-3 ${
                      section.cards.length === 5
                        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                        : section.cards.length === 4
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : section.cards.length === 3
                        ? 'grid-cols-1 md:grid-cols-3'
                        : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    {(Array.isArray(section.cards) ? section.cards : []).map((card, cIdx) => {
                      const cardStyle = CARD_BG_CLASSES[card.color] || CARD_BG_CLASSES.yellow;
                      return (
                        <div
                          key={card.id || cIdx}
                          className={`rounded-md border-2 p-2.5 shadow-xs flex flex-col justify-between ${cardStyle.bg} ${cardStyle.border}`}
                        >
                          <div>
                            {/* Card title */}
                            <div
                              className={`font-bold text-xs uppercase tracking-wide px-2 py-0.5 rounded mb-1.5 border border-black/10 ${cardStyle.title}`}
                            >
                              {card.title}
                            </div>

                            {/* Card items */}
                            <ul className="text-xs leading-relaxed space-y-1 text-stone-800">
                              {(Array.isArray(card.items)
                                ? card.items
                                : [(card as any).content || (card as any).text || (card as any).description].filter(Boolean)
                              ).map((item, iIdx) => (
                                <li key={iIdx} className="whitespace-pre-wrap">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Example snippet if present */}
                          {card.example && (
                            <div className="mt-2 pt-1.5 border-t border-dashed border-black/15 text-[11px] font-semibold text-stone-700 italic">
                              {card.example}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bullets under the cards (e.g. Major Applications with examples) */}
                  {section.bullets && section.bullets.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-dashed border-stone-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-800">
                        {(Array.isArray(section.bullets) ? section.bullets : []).map((b, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-1.5">
                            {b.boldPrefix && (
                              <span className="font-bold text-purple-900">
                                {b.boldPrefix}
                              </span>
                            )}
                            <span>{b.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TYPE: Comparison Table */}
              {section.type === 'comparison_table' && section.table && (
                <div className="my-2">
                  <div className="sm:hidden text-[11px] text-stone-500 mb-1 flex items-center gap-1 font-sans">
                    <span>👉 Swipe table sideways to view full comparison</span>
                  </div>
                  <div className="overflow-x-auto pb-1.5 scrollbar-thin">
                    <table className="w-full text-left border-collapse border-2 border-stone-800 text-xs bg-white/95 min-w-[500px]">
                      <thead>
                        <tr className="border-b-2 border-stone-800">
                          <th className="p-2 border-r-2 border-stone-800 font-bold bg-stone-100 text-stone-800 w-28">
                            Parameter
                          </th>
                        {(Array.isArray(section.table.headers) ? section.table.headers : []).map((hdr, hIdx) => (
                          <th
                            key={hIdx}
                            className={`p-2 border-r-2 last:border-r-0 border-stone-800 font-bold text-center ${
                              hdr.color === 'blue' ? 'bg-sky-100 text-sky-950' :
                              hdr.color === 'green' ? 'bg-emerald-100 text-emerald-950' :
                              hdr.color === 'purple' ? 'bg-purple-100 text-purple-950' :
                              hdr.color === 'orange' ? 'bg-orange-100 text-orange-950' :
                              'bg-amber-100 text-amber-950'
                            }`}
                          >
                            {hdr.text}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(section.table.rows) ? section.table.rows : []).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-stone-300 last:border-b-0 hover:bg-stone-50/50"
                        >
                          <td className="p-2 border-r-2 border-stone-800 font-bold bg-stone-50 text-stone-700">
                            {row.label || `Point ${rIdx + 1}`}
                          </td>
                          {(Array.isArray(row.cells) ? row.cells : []).map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="p-2 border-r-2 last:border-r-0 border-stone-800 text-stone-800 whitespace-pre-line leading-relaxed"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              {/* TYPE: Diagram & Flow */}
              {section.type === 'diagram_flow' && (
                <div>
                  {section.bullets && section.bullets.length > 0 && (
                    <div className="space-y-1 mb-2 text-xs text-stone-800">
                      {(Array.isArray(section.bullets) ? section.bullets : []).map((b, bIdx) => (
                        <div key={bIdx} className="leading-snug">
                          {b.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.diagram && (
                    <DiagramRenderer
                      diagram={section.diagram}
                      penColorClass={penClass}
                    />
                  )}
                </div>
              )}

              {section.type === 'bullet_list' && (
                <ul className="space-y-1.5 text-xs leading-relaxed text-stone-800">
                  {(Array.isArray(section.bullets) ? section.bullets : []).map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start gap-2">
                      <span className="font-bold text-amber-700">•</span>
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.type === 'memory_aid' && section.memoryAidText && (
                <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-3 text-sm font-semibold leading-relaxed text-amber-950">
                  {section.memoryAidText}
                </div>
              )}

              {/* TYPE: Interview Q&A */}
              {section.type === 'interview_qa' && section.interview && (
                <div className="space-y-2.5">
                  {(Array.isArray(section.interview) ? section.interview : []).map((qa, qIdx) => (
                    <div
                      key={qa.id || qIdx}
                      className="p-2.5 rounded border border-purple-300 bg-purple-50/40 text-xs"
                    >
                      <div className="font-bold text-purple-950 flex items-center justify-between mb-1">
                        <span>{qa.question}</span>
                        {qa.importance && (
                          <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded text-[10px] uppercase font-bold shrink-0">
                            {qa.importance.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-stone-800 whitespace-pre-line pl-2 border-l-2 border-purple-400">
                        {qa.answer}
                      </div>
                      {qa.expectedKeywords && (
                        <div className="mt-1.5 pt-1 border-t border-purple-200 text-[11px] text-purple-800 flex items-center gap-1">
                          <span className="font-bold">Keywords:</span>
                          {qa.expectedKeywords.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TYPE: Exam Revision Tips */}
              {section.type === 'exam_tips' && section.examTips && (
                <div className="p-3 rounded-lg border-2 border-amber-400 bg-amber-50/80 text-xs shadow-xs">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-amber-300">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      {section.examTips.title}
                    </span>
                    {section.examTips.weightage && (
                      <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold text-[11px]">
                        {section.examTips.weightage}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1 text-stone-800">
                    {(Array.isArray(section.examTips.keyFormulasOrPoints) ? section.examTips.keyFormulasOrPoints : []).map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  {section.examTips.mustRememberTip && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-amber-400 text-amber-950 font-bold bg-amber-100/60 p-1.5 rounded">
                      ⭐ {section.examTips.mustRememberTip}
                    </div>
                  )}
                </div>
              )}

              {/* TYPE: Visual Sketchnotes (Data Visualization & Concept Taxonomy) */}
              {section.type === 'visual_sketchnotes' && section.visualSketchnote && (
                <VisualSketchnoteRenderer
                  data={section.visualSketchnote}
                  penColorClass={penClass}
                  isEditable={isEditable}
                  onUpdate={(updatedData) => {
                    handleUpdateSection(sIdx, { ...section, visualSketchnote: updatedData });
                  }}
                />
              )}

              {![
                'question_cards',
                'comparison_table',
                'diagram_flow',
                'bullet_list',
                'interview_qa',
                'exam_tips',
                'memory_aid',
                'visual_sketchnotes',
              ].includes(section.type) && (
                <pre className="whitespace-pre-wrap break-words rounded border border-amber-300 bg-amber-50/70 p-3 text-xs leading-relaxed text-stone-800">
                  {JSON.stringify(section, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Add Section Controls (In-Notebook Button) */}
        {isEditable && (
          <div className="mt-6 mb-4 text-center pl-6 sm:pl-8 no-print">
            <div className="inline-block relative">
              <button
                type="button"
                onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-stone-100 rounded-lg text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Section to Page {page.pageNumber}
              </button>

              {showAddSectionMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border border-stone-200 p-2 text-left z-30 space-y-1">
                  <div className="text-[11px] font-bold text-stone-400 px-2 py-1 uppercase tracking-wider">
                    Insert Component
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSection('question_cards')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-800 hover:bg-stone-100 rounded cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Question + Concept Boxes (4 Cards)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSection('comparison_table')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-800 hover:bg-stone-100 rounded cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Comparison Table (Multi-Column)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSection('diagram_flow')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-800 hover:bg-stone-100 rounded cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-purple-600" />
                    Architecture / Flowchart Diagram
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSection('interview_qa')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-800 hover:bg-stone-100 rounded cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    Interview & Viva Q&A
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSection('exam_tips')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-stone-800 hover:bg-stone-100 rounded cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    Exam Revision & Scoring Checklist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSection('visual_sketchnotes')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 rounded cursor-pointer font-bold border border-amber-300"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    🎨 Visual Sketchnotes (विजुअलाइज़ेशन नोट्स)
                  </button>
                  <div className="border-t border-stone-200 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSticky('yellow');
                      setShowAddSectionMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-amber-800 hover:bg-amber-50 rounded cursor-pointer font-semibold"
                  >
                    <StickyIcon className="w-3.5 h-3.5 text-amber-500" />
                    📌 Add Sticky Note to Page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Memory Aid / Mnemonic Bar (Just like the user's uploaded image!) */}
        {page.bottomMemoryAid && (
          <div className="mt-8 pt-2 pl-6 sm:pl-8 border-t-2 border-dashed border-stone-400/80">
            <div className="highlighter-yellow px-3 sm:px-4 py-2 rounded border-2 border-stone-800 text-stone-950 font-bold text-center text-xs sm:text-sm tracking-wide shadow-xs flex items-center justify-center gap-2">
              <span className="text-base shrink-0">🧠</span>
              {isEditable ? (
                <input
                  type="text"
                  value={page.bottomMemoryAid}
                  onChange={(e) => onUpdatePage({ ...page, bottomMemoryAid: e.target.value })}
                  className="w-full bg-transparent text-center focus:outline-none font-bold text-xs sm:text-sm"
                />
              ) : (
                <span className="text-xs sm:text-sm">{page.bottomMemoryAid}</span>
              )}
            </div>
          </div>
        )}

        {/* Notebook Bottom Edge Details */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 mt-6 pt-2 pl-6 sm:pl-8 border-t border-stone-200 font-sans">
          <span>KalamNotes • Handwritten Study Notebook</span>
          <span>Page {page.pageNumber} of {totalPages}</span>
        </div>
      </div>
    </div>
  );
};
