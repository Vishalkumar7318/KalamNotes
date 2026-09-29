import React, { useState } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  FileText,
  Layers,
  Languages,
  Palette,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { PaperPattern, FontFamily, PenColor, HistoryItem } from '../types';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  history?: HistoryItem[];
}

export const GenerateModal: React.FC<GenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  history = [],
}) => {
  const [topic, setTopic] = useState('');
  const [targetPages, setTargetPages] = useState<number>(2);
  const [style, setStyle] = useState<string>('exam_10_marks');
  const [language, setLanguage] = useState<string>('en');
  const [paperPattern, setPaperPattern] = useState<PaperPattern>('ruled');
  const [fontFamily, setFontFamily] = useState<FontFamily>('font-kalam');
  const [penColor, setPenColor] = useState<PenColor>('darkblue');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onGenerate({
      topic,
      targetPages,
      style,
      language,
      paperPattern,
      fontFamily,
      penColor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-100 my-8">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Generate Handwritten Study Notes
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AI Powered
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Create authentic ruled-page notebook notes with boxes, tables, flowcharts & sticky notes
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              1. What topic or syllabus do you want notes for?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cloud Computing 10 marks notes with NIST characteristics, virtualization diagram, and deployment models..."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 bg-stone-950/70 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
            />

            {/* Recent Searches from History */}
            {history && history.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-stone-500 py-1">Recent Searches:</span>
                {history.slice(0, 4).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setTopic(h.topic)}
                    className="text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-full border border-stone-700 transition-colors cursor-pointer truncate max-w-[200px]"
                    title={h.topic}
                  >
                    {h.title || h.topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Number of Pages Selector ("hmko jetne page me generate krana h utne me kra saku") */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                2. Target Page Count (How many notebook pages?)
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400 text-stone-950">
                {targetPages} {targetPages === 1 ? 'Page' : 'Pages'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetPages(num)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    targetPages === num
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-xs'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <div className="text-sm font-bold">{num}</div>
                  <div className="text-[10px] text-stone-400">
                    {num === 1 ? 'Page' : 'Pages'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              The AI will systematically divide and organize the curriculum across exactly {targetPages} full page(s).
            </p>
          </div>

          {/* Note Style & Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Style */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                3. Note Format & Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="exam_10_marks">10-Marks Semester Exam Format (Q1-Q5 + Diagrams)</option>
                <option value="visual_sketchnotes">🎨 Visual Sketchnotes (विजुअलाइज़ेशन नोट्स & Diagrams)</option>
                <option value="cheat_sheet">Quick Revision & 2-Min Cheat Sheet</option>
                <option value="interview_prep">Campus Technical Interview & Viva Guide</option>
                <option value="concept_deep_dive">Concept Deep Dive with Real Examples</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                4. Language Preference
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="en">English (Standard Academic)</option>
                <option value="hinglish">Hinglish (Hindi-English mix, Indian student style)</option>
                <option value="hi">Hindi (हिन्दी नोट्स)</option>
              </select>
            </div>
          </div>

          {/* Paper Pattern & Pen Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-800">
            {/* Paper */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Paper Background
              </label>
              <select
                value={paperPattern}
                onChange={(e) => setPaperPattern(e.target.value as PaperPattern)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="ruled">Ruled Notebook (Blue Lines + Red Margin)</option>
                <option value="legal">Yellow Legal Pad</option>
                <option value="grid">Engineering Graph Grid</option>
                <option value="dot">Bullet Journal Dot Grid</option>
                <option value="parchment">Vintage Warm Parchment</option>
                <option value="clean">Clean White Paper</option>
              </select>
            </div>

            {/* Font */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Handwriting Font
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="font-kalam">Kalam (Natural Handwritten)</option>
                <option value="font-caveat">Caveat (Casual Cursive)</option>
                <option value="font-patrick">Patrick Hand (Neat School Notes)</option>
                <option value="font-gochi">Gochi Hand (Marker Style)</option>
                <option value="font-indie">Indie Flower (Artistic Pen)</option>
              </select>
            </div>

            {/* Ink */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Pen Ink Color
              </label>
              <select
                value={penColor}
                onChange={(e) => setPenColor(e.target.value as PenColor)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="darkblue">Royal Blue Ink (Fountain Pen)</option>
                <option value="blue">Vibrant Blue Gel Pen</option>
                <option value="black">Ballpoint Black Ink</option>
                <option value="purple">Violet / Purple Gel Pen</option>
                <option value="green">Emerald Green Ink</option>
              </select>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-stone-400 hover:text-stone-200 text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating {targetPages} Pages...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate {targetPages}-Page Notes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
