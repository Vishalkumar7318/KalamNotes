import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  Plus,
  Trash2,
  Copy,
  Layers,
  StickyNote as StickyIcon,
  Sliders,
  Check,
  ChevronDown,
  History as HistoryIcon,
  Download,
  FileDown,
  Image as ImageIcon,
  Loader2,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { NotebookDocument, NotePage, PaperPattern, FontFamily, PenColor, UserProfile } from '../types';
import { downloadPageAsImage, downloadNotesAsText } from '../utils/exportUtils';

interface ToolbarProps {
  document: NotebookDocument;
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDeleteCurrentPage: () => void;
  onOpenGenerateModal: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  viewMode: 'single' | 'all';
  onToggleViewMode: (mode: 'single' | 'all') => void;
  onUpdateCurrentPageSettings: (settings: {
    paperPattern?: PaperPattern;
    fontFamily?: FontFamily;
    penColor?: PenColor;
    showSpiral?: boolean;
  }) => void;
  onAddStickyNote: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  document,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onDeleteCurrentPage,
  onOpenGenerateModal,
  onOpenHistory,
  historyCount,
  viewMode,
  onToggleViewMode,
  onUpdateCurrentPageSettings,
  onAddStickyNote,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentPage = document.pages[currentPageIndex] || document.pages[0];

  const handlePrint = () => {
    window.print();
  };

  const getFullNotesText = () => {
    let fullText = `${document.title}\n==============================\n\n`;
    document.pages.forEach((page, pIdx) => {
      fullText += `--- PAGE ${pIdx + 1}: ${page.headerTitle} ---\n`;
      if (page.headerSubtitle) fullText += `${page.headerSubtitle}\n\n`;
      page.sections.forEach((sec) => {
        fullText += `[${sec.qBadge || 'Section'}] ${sec.qTitle}\n`;
        if (sec.cards) {
          sec.cards.forEach((c) => {
            fullText += `* ${c.title}\n  ${c.items.join('\n  ')}\n`;
            if (c.example) fullText += `  (${c.example})\n`;
          });
        }
        if (sec.bullets) {
          sec.bullets.forEach((b) => {
            fullText += `  ${b.text}\n`;
          });
        }
        if (sec.memoryAidText) {
          fullText += `Memory Aid: ${sec.memoryAidText}\n`;
        }
        fullText += '\n';
      });
      if (page.bottomMemoryAid) {
        fullText += `Page Memory Aid: ${page.bottomMemoryAid}\n\n`;
      }
    });
    return fullText;
  };

  const handleCopyNotesText = () => {
    navigator.clipboard.writeText(getFullNotesText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCurrentPageImage = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    await downloadPageAsImage(
      `notebook-page-${currentPage.id}`,
      `${document.title || 'notes'}-page-${currentPage.pageNumber}`
    );
    setIsExporting(false);
  };

  const handleDownloadAllPagesImages = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    for (let i = 0; i < document.pages.length; i++) {
      const p = document.pages[i];
      await downloadPageAsImage(
        `notebook-page-${p.id}`,
        `${document.title || 'notes'}-page-${p.pageNumber}`
      );
      // Small pause between downloads to avoid browser throttle
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    setIsExporting(false);
  };

  const handleDownloadTextFile = () => {
    setShowDownloadMenu(false);
    downloadNotesAsText(document.title || 'handwritten_notes', getFullNotesText());
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md no-print">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">
                KalamNotes
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                Handwritten
              </span>
            </div>
            <div className="text-[11px] text-stone-400 truncate max-w-[200px] sm:max-w-xs">
              {document.title}
            </div>
          </div>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Generator Button */}
          <button
            type="button"
            onClick={onOpenGenerateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs rounded-lg shadow-sm shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Notes Generator
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition-colors cursor-pointer"
            title="View Search & Notes History"
          >
            <HistoryIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Add Sticky Note Shortcut */}
          <button
            type="button"
            onClick={onAddStickyNote}
            title="Add a Sticky Note to Current Page"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <StickyIcon className="w-3.5 h-3.5 text-amber-400" />
            + Sticky
          </button>

          {/* Style Customizer Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition-colors cursor-pointer"
              title="Change Paper Pattern, Font & Pen"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Paper & Pen
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-700 rounded-xl shadow-xl p-3 z-50 space-y-3">
                <div className="text-xs font-bold text-stone-300 border-b border-stone-800 pb-1.5">
                  Page Styling Settings
                </div>

                {/* Paper Pattern */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Notebook Background:
                  </label>
                  <select
                    value={currentPage?.paperPattern || 'ruled'}
                    onChange={(e) =>
                      onUpdateCurrentPageSettings({
                        paperPattern: e.target.value as PaperPattern,
                      })
                    }
                    className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200"
                  >
                    <option value="ruled">Ruled Blue Lines + Red Margin</option>
                    <option value="legal">Yellow Legal Pad</option>
                    <option value="grid">Engineering Graph Grid</option>
                    <option value="dot">Bullet Journal Dot Grid</option>
                    <option value="parchment">Vintage Warm Parchment</option>
                    <option value="clean">Clean White Paper</option>
                  </select>
                </div>

                {/* Handwriting Font */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Handwriting Style:
                  </label>
                  <select
                    value={currentPage?.fontFamily || 'font-kalam'}
                    onChange={(e) =>
                      onUpdateCurrentPageSettings({
                        fontFamily: e.target.value as FontFamily,
                      })
                    }
                    className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200"
                  >
                    <option value="font-kalam">Kalam (Natural Hindi/Eng)</option>
                    <option value="font-caveat">Caveat (Flowing Cursive)</option>
                    <option value="font-patrick">Patrick Hand (Neat School)</option>
                    <option value="font-gochi">Gochi Hand (Marker Style)</option>
                    <option value="font-indie">Indie Flower (Artistic Pen)</option>
                  </select>
                </div>

                {/* Pen Ink */}
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Pen Ink Color:
                  </label>
                  <select
                    value={currentPage?.penColor || 'darkblue'}
                    onChange={(e) =>
                      onUpdateCurrentPageSettings({
                        penColor: e.target.value as PenColor,
                      })
                    }
                    className="w-full bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200"
                  >
                    <option value="darkblue">Royal Blue Ink</option>
                    <option value="blue">Gel Pen Blue</option>
                    <option value="black">Ballpoint Black</option>
                    <option value="purple">Violet / Purple Gel</option>
                    <option value="green">Emerald Green</option>
                  </select>
                </div>

                {/* Spiral Ring Toggle */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                  <span className="text-xs text-stone-300">Left Spiral Rings</span>
                  <input
                    type="checkbox"
                    checked={currentPage?.showSpiral}
                    onChange={(e) =>
                      onUpdateCurrentPageSettings({ showSpiral: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle: Single vs All Pages */}
          <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700">
            <button
              type="button"
              onClick={() => onToggleViewMode('single')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Single Page Focus"
            >
              1 Page
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('all')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Booklet View (All Pages)"
            >
              All ({document.pages.length})
            </button>
          </div>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-105 cursor-pointer"
              title="Download Notes (PNG, PDF, Text)"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </>
              )}
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[11px] font-bold text-stone-400 px-2 py-1 uppercase tracking-wider border-b border-stone-800">
                  Save & Export Options
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCurrentPageImage}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Download Current Page (PNG)</div>
                    <div className="text-[10px] text-stone-400">Save Page {currentPage.pageNumber} as image</div>
                  </div>
                </button>

                {document.pages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllPagesImages}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">Download All {document.pages.length} Pages (PNG)</div>
                      <div className="text-[10px] text-stone-400">High-resolution image per page</div>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <Printer className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Print / Save as PDF</div>
                    <div className="text-[10px] text-stone-400">Standard printable A4 notebook pages</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTextFile}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-left border-t border-stone-800/80 mt-1"
                >
                  <FileDown className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Download Plain Text (.txt)</div>
                    <div className="text-[10px] text-stone-400">Formatted text for easy reading</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
                title="Account & Profile"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                  style={{ backgroundColor: currentUser.avatarColor || '#f59e0b' }}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-3 z-50 space-y-2.5 text-stone-200">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-800">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0"
                      style={{ backgroundColor: currentUser.avatarColor || '#f59e0b' }}
                    >
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono truncate">{currentUser.identifier}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-stone-400">
                    <div className="flex items-center justify-between py-0.5">
                      <span className="flex items-center gap-1 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Status:
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                        OTP Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-[11px]">Saved Notebooks:</span>
                      <span className="font-bold text-stone-200">{historyCount}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 text-xs font-bold transition-colors cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (लॉगआउट)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-xs"
              title="Sign in with Mobile Number or Gmail"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Login (OTP)</span>
            </button>
          )}

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopyNotesText}
            title="Copy all notes text"
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg border border-stone-700 transition-colors cursor-pointer hidden sm:flex"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Sub-Bar: Page Navigation Tabs */}
      <div className="bg-stone-950/80 border-t border-stone-800/80 px-4 py-1.5 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
            Pages ({document.pages.length}):
          </span>

          {document.pages.map((page, idx) => (
            <button
              key={page.id || idx}
              type="button"
              onClick={() => onSelectPage(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentPageIndex === idx && viewMode === 'single'
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <span>Page {idx + 1}</span>
              {page.stickyNotes && page.stickyNotes.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}

          {/* Add Page Button */}
          <button
            type="button"
            onClick={onAddPage}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-md text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
            title="Add blank page to notebook"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Page
          </button>
        </div>

        {/* Current page delete control if multiple pages */}
        {document.pages.length > 1 && viewMode === 'single' && (
          <button
            type="button"
            onClick={onDeleteCurrentPage}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
            title="Delete current page"
          >
            <Trash2 className="w-3 h-3" />
            Delete Page {currentPageIndex + 1}
          </button>
        )}
      </div>
    </header>
  );
};
