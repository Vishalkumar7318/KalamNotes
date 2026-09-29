import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  History,
  ArrowRight,
  Trash2,
  BookOpen,
  Search,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { PaperPattern, FontFamily, PenColor, HistoryItem, UserProfile } from '../types';

interface QuickTopicGeneratorProps {
  onGenerate: (params: {
    topic: string;
    targetPages: number;
    style: string;
    language: string;
    paperPattern: PaperPattern;
    fontFamily: FontFamily;
    penColor: PenColor;
  }) => Promise<void>;
  isLoading: boolean;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem?: (id: string) => void;
  onOpenFullHistory: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const QuickTopicGenerator: React.FC<QuickTopicGeneratorProps> = ({
  onGenerate,
  isLoading,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onOpenFullHistory,
  currentUser,
  onOpenLogin,
}) => {
  const [topic, setTopic] = useState('');
  const [targetPages, setTargetPages] = useState<number>(2);
  const [language, setLanguage] = useState<string>('en');
  const [style, setStyle] = useState<string>('exam_10_marks');
  const [showLongTextInput, setShowLongTextInput] = useState(false);
  const [syllabusText, setSyllabusText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = topic.trim()
      ? topic.trim() + (syllabusText.trim() ? `\n\nSyllabus/Chapter details:\n${syllabusText.trim()}` : '')
      : syllabusText.trim();

    if (!finalTopic) return;

    onGenerate({
      topic: finalTopic,
      targetPages,
      style,
      language,
      paperPattern: 'ruled',
      fontFamily: 'font-kalam',
      penColor: 'darkblue',
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-3 sm:my-4 px-2 no-print">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-stone-800 shadow-2xl p-3.5 sm:p-6 text-stone-100">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-stone-800/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Generate Notes for Any Topic or Chapter
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                AI Powered
              </span>
              {currentUser ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  {currentUser.name}
                </span>
              ) : (
                onOpenLogin && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <LogIn className="w-2.5 h-2.5" />
                    <span>Login via Number / Gmail (OTP)</span>
                  </button>
                )
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Gemini se poori detail me authentic ruled notebook notes banwayein — diagrams, tables, formulas aur sticky notes ke saath.
            </p>
          </div>

          {/* Quick Page Count Selectors */}
          <div className="flex items-center gap-1.5 bg-stone-950/90 p-1 rounded-xl border border-stone-800 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="text-[11px] font-semibold text-stone-400 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              Pages:
            </span>
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTargetPages(p)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  targetPages === p
                    ? 'bg-amber-400 text-stone-950 shadow-sm scale-105'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {p}P
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Search or type ANY topic / chapter (e.g. Thermodynamics, Deadlocks in OS, Photosynthesis, Indian Constitution, Organic Chemistry...)"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-stone-950/90 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={isLoading}
                className="px-2.5 py-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer max-w-[130px] sm:max-w-none"
                title="Select Note Style"
              >
                <option value="exam_10_marks">📝 10-Marks Notes</option>
                <option value="visual_sketchnotes">🎨 Visual Sketchnotes (विजुअलाइज़ेशन नोट्स)</option>
                <option value="interview_prep">🎯 Interview & Viva Prep</option>
                <option value="cheat_sheet">⚡ Revision Cheat Sheet</option>
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isLoading}
                className="px-3 py-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                title="Select Language"
              >
                <option value="en">English</option>
                <option value="hinglish">Hinglish (Hindi+Eng)</option>
                <option value="hi">हिन्दी नोट्स</option>
              </select>

              <button
                type="submit"
                disabled={isLoading || (!topic.trim() && !syllabusText.trim())}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating {targetPages}P...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Notes</span>
                  </>
                )}
              </button>

              {/* 1-Click Visual Sketchnotes Button */}
              <button
                type="button"
                onClick={() => {
                  const finalTopic = topic.trim()
                    ? topic.trim() + (syllabusText.trim() ? `\n\nSyllabus/Chapter details:\n${syllabusText.trim()}` : '')
                    : syllabusText.trim() || 'Data Visualization';

                  onGenerate({
                    topic: finalTopic,
                    targetPages,
                    style: 'visual_sketchnotes',
                    language,
                    paperPattern: 'ruled',
                    fontFamily: 'font-kalam',
                    penColor: 'darkblue',
                  });
                }}
                disabled={isLoading}
                className="hidden sm:flex items-center justify-center gap-1.5 px-3.5 py-3 bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 hover:border-purple-400 font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                title="Generate Visual Sketchnote Sheet with diagram taxonomy, pipeline, and best practices"
              >
                <span>🎨 Visual Notes</span>
              </button>
            </div>
          </div>

          {/* Toggle Paste Syllabus or Full Text */}
          <div>
            <button
              type="button"
              onClick={() => setShowLongTextInput(!showLongTextInput)}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {showLongTextInput
                  ? 'Hide extra syllabus / notes text box'
                  : '+ Paste your textbook paragraphs, syllabus bullet points, or lecture slides text'}
              </span>
              {showLongTextInput ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {showLongTextInput && (
              <div className="mt-2">
                <textarea
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  placeholder="Paste lecture notes, syllabus questions, textbook paragraphs or definitions here. Gemini will organize all details into authentic handwritten ruled pages!"
                  rows={4}
                  className="w-full p-3 bg-stone-950/90 border border-stone-700 rounded-xl text-stone-200 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400 resize-none transition-all shadow-inner"
                />
              </div>
            )}
          </div>

          {/* Search History Section (Presets removed as requested) */}
          <div className="pt-3 border-t border-stone-800/80">
            {history && history.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Your Search History ({history.length}):
                  </span>
                  {history.length > 4 && (
                    <button
                      type="button"
                      onClick={onOpenFullHistory}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View All History</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* History Chips Grid */}
                <div className="flex flex-wrap gap-2">
                  {history.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-1.5 bg-stone-800/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/50 rounded-xl px-2.5 py-1.5 transition-all shadow-xs"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectHistoryItem(item)}
                        className="flex items-center gap-1.5 text-left cursor-pointer"
                        title={`Open notes for ${item.title || item.topic}`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 truncate max-w-[140px] sm:max-w-[200px]">
                          {item.title || item.topic}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-900 text-stone-400 font-medium border border-stone-700">
                          {item.targetPages || item.doc?.pages?.length || 1}P
                        </span>
                        <span className="text-[10px] text-stone-500 hidden sm:inline">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </button>

                      {onDeleteHistoryItem && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHistoryItem(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-400 hover:bg-stone-700/50 rounded transition-all cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-stone-400 py-1 bg-stone-950/60 px-3 rounded-xl border border-stone-800/60">
                <History className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  No previous searches yet. Type ANY chapter or topic above to generate notes — it will be automatically saved in your search history!
                </span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
