import React, { useState, useEffect } from 'react';
import {
  NotebookDocument,
  NotePage,
  PaperPattern,
  FontFamily,
  PenColor,
  HistoryItem,
  UserProfile,
} from './types';
import { Toolbar } from './components/Toolbar';
import { NotebookPage } from './components/NotebookPage';
import { GenerateModal } from './components/GenerateModal';
import { QuickTopicGenerator } from './components/QuickTopicGenerator';
import { HistoryModal } from './components/HistoryModal';
import { LoginPage } from './components/LoginPage';
import {
  saveNotebookToFirestore,
  getUserNotebooksFromFirestore,
  deleteNotebookFromFirestore,
  logOutFirebase,
} from './firebase';
import { downloadPageAsImage, downloadNotesAsText } from './utils/exportUtils';
import {
  AlertCircle,
  CheckCircle,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  Printer,
  FileDown,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const EMPTY_INITIAL_NOTEBOOK: NotebookDocument = {
  id: 'doc-starter',
  title: 'My Handwritten Study Notebook',
  topic: 'Enter any topic or chapter above to generate notes',
  targetPages: 1,
  language: 'en',
  style: 'exam_10_marks',
  pages: [
    {
      id: 'page-starter-1',
      pageNumber: 1,
      headerTitle: 'MY STUDY NOTEBOOK — READY FOR ANY TOPIC',
      headerSubtitle: 'Type any chapter or topic name above to generate authentic handwritten notes',
      subject: 'Handwritten Notes Generator',
      date: new Date().toLocaleDateString('en-GB'),
      paperPattern: 'ruled',
      fontFamily: 'font-kalam',
      penColor: 'darkblue',
      showSpiral: true,
      stickyNotes: [
        {
          id: 'sticky-welcome',
          title: '💡 Quick Start',
          content: 'Search ANY topic above (e.g. Thermodynamics, Deadlocks in OS, Photosynthesis, Constitution) to generate comprehensive notes with sticky notes & diagrams!',
          color: 'yellow',
          rotation: -2,
          x: 72,
          y: 8,
        },
      ],
      bottomMemoryAid: 'Memory Aid : Search Any Topic ➔ Gemini Generates Ruled Notes ➔ Download PNG / PDF',
      sections: [
        {
          id: 'sec-welcome-1',
          type: 'question_cards',
          qBadge: 'HOW-TO',
          qTitle: 'How to generate notes for ANY topic or chapter:',
          layout: 'grid-4',
          cards: [
            {
              id: 'c-w1',
              title: '1. Type Any Topic :',
              color: 'cyan',
              items: [
                'Type any subject, chapter name, or question in the search box above (e.g. Computer Science, Physics, Chemistry, Biology, History, Law...).',
              ],
            },
            {
              id: 'c-w2',
              title: '2. Select Page Count :',
              color: 'yellow',
              items: [
                'Choose how many pages you want (1P, 2P, 3P, 4P, 5P). Gemini will distribute the full syllabus across all pages.',
              ],
            },
            {
              id: 'c-w3',
              title: '3. Full Detail & Depth :',
              color: 'green',
              items: [
                'Generates authentic ruled notebook pages with definitions, comparison tables, diagrams, and sticky exam tips.',
              ],
            },
            {
              id: 'c-w4',
              title: '4. Download & Mobile :',
              color: 'pink',
              items: [
                'Download any page as high-res PNG image or save as PDF. View seamlessly on smartphones and tablets.',
              ],
            },
          ],
          bullets: [
            { text: '• Search History: All your searched topics are automatically saved in Search History below for instant 1-click access anytime!', boldPrefix: 'Search History :' },
            { text: '• Visual Sketchnotes: Generate hand-drawn diagrams, chart taxonomy, process pipeline, and Do’s & Don’ts checklist for ANY topic!', boldPrefix: '🎨 Visual Notes :' },
          ],
        },
        {
          id: 'sec-welcome-visual',
          type: 'visual_sketchnotes',
          qBadge: 'VISUAL',
          qTitle: 'Visual Sketchnotes & Concept Taxonomy Grid (विजुअलाइज़ेशन नोट्स):',
          visualSketchnote: {
            title: 'DATA & TOPIC VISUALIZATION SKETCHNOTES',
            subtitle: 'Hand-drawn Concept & Diagrammatic Mental Models for Fast Understanding',
            badge: '🎨 VISUAL SKETCHNOTES',
            visualCards: [
              {
                id: 'vw-1',
                name: 'Bar Chart',
                category: 'Comparison',
                visualType: 'bar_chart',
                whenToUse: 'Discrete categories comparison over a common baseline (e.g. Revenue by Country).',
                keyRuleOrTip: 'Always start baseline at zero (0) to maintain honest proportion!',
                color: 'blue',
              },
              {
                id: 'vw-2',
                name: 'Line Chart',
                category: 'Time Series',
                visualType: 'line_chart',
                whenToUse: 'Tracking continuous evolution, temperature, stocks, or user growth over time.',
                keyRuleOrTip: 'Limit to 3-4 series to prevent visual clutter.',
                color: 'green',
              },
              {
                id: 'vw-3',
                name: 'Pie / Donut',
                category: 'Composition',
                visualType: 'pie_chart',
                whenToUse: 'Showing proportional parts of a whole (must sum up to exactly 100%).',
                keyRuleOrTip: 'Maximum 5 slices; sort clockwise from largest to smallest.',
                color: 'yellow',
              },
              {
                id: 'vw-4',
                name: 'Scatter Plot',
                category: 'Correlation',
                visualType: 'scatter_plot',
                whenToUse: 'Detecting relationship, clusters, and regression between two numerical variables.',
                keyRuleOrTip: 'Look for clustering, linear direction, and extreme outlier data points.',
                color: 'pink',
              },
              {
                id: 'vw-5',
                name: 'Density Heatmap',
                category: 'Matrix 2D',
                visualType: 'heatmap',
                whenToUse: '2D matrix intensity mapping (e.g. server CPU usage by hour vs day of week).',
                keyRuleOrTip: 'Use monochromatic gradient or diverging color scale with neutral midpoint.',
                color: 'purple',
              },
              {
                id: 'vw-6',
                name: 'Hierarchy Tree',
                category: 'Structure',
                visualType: 'hierarchy_tree',
                whenToUse: 'Parent-child taxonomies, file systems, organizational trees, and decision trees.',
                keyRuleOrTip: 'Keep tree depth balanced (max 3-4 levels visible at once).',
                color: 'cyan',
              },
              {
                id: 'vw-7',
                name: 'Execution Flowchart',
                category: 'Workflow',
                visualType: 'flowchart',
                whenToUse: 'Business pipelines, algorithms, lifecycle states, and decision rules.',
                keyRuleOrTip: 'Clearly label every decision branch (Yes/No, True/False).',
                color: 'orange',
              },
              {
                id: 'vw-8',
                name: 'Spider / Radar Chart',
                category: 'Benchmarking',
                visualType: 'radar_chart',
                whenToUse: 'Evaluating a system or candidate across 5-6 diverse performance dimensions.',
                keyRuleOrTip: 'Normalize scales across all spokes before comparative plotting.',
                color: 'blue',
              },
            ],
            pipelineSteps: [
              { stepNumber: 1, title: 'Understand & Define', desc: 'Identify core question, audience context, and goal.', icon: '🎯', color: 'blue' },
              { stepNumber: 2, title: 'Clean & Structure', desc: 'Verify data integrity and eliminate background noise.', icon: '🧹', color: 'green' },
              { stepNumber: 3, title: 'Choose Visual Model', desc: 'Select chart or diagram matching data dimensionality.', icon: '📊', color: 'purple' },
              { stepNumber: 4, title: 'Design & Iterate', desc: 'Apply high-contrast ink, bold titles, and direct labels.', icon: '✨', color: 'cyan' },
            ],
            dosAndDonts: {
              dos: [
                'Start bar chart axes at zero (0) for truthful, honest proportions.',
                'Use color with purpose: highlight only the primary insight or takeaway.',
                'Include clear titles that state the core takeaway, not just the metric.',
                'Ensure legible typography and responsive layout on both phones and laptops.',
              ],
              donts: [
                'Never use 3D effects, pie tilt, or faux shadows that distort true angles.',
                'Avoid rainbow color palettes that create visual fatigue and confuse readers.',
                'Do not clutter canvas with heavy gridlines that drown the actual signal.',
                'Never truncate axes without an explicit, bold visual break symbol.',
              ],
            },
            toolsAndStack: [
              { name: 'Tableau', category: 'BI Dashboards', badgeColor: 'blue' },
              { name: 'Power BI', category: 'Enterprise Analytics', badgeColor: 'yellow' },
              { name: 'Python (Matplotlib/Seaborn)', category: 'Data Science', badgeColor: 'green' },
              { name: 'D3.js', category: 'Web Interactive Viz', badgeColor: 'orange' },
              { name: 'Excel / Sheets', category: 'Quick Analysis', badgeColor: 'purple' },
            ],
            proTipOrCloud: 'The goal of visualization is INSIGHT, not pictures. Pick the simplest diagram that directly answers the user’s question!',
          },
        },
      ],
    },
  ],
};

export default function App() {
  // History state loaded from localStorage (No default presets!)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kalamnotes_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
    return [];
  });

  // Load latest searched document from history or starter document
  const [doc, setDoc] = useState<NotebookDocument>(() => {
    if (history.length > 0 && history[0].doc) {
      return history[0].doc;
    }
    return EMPTY_INITIAL_NOTEBOOK;
  });

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('kalamnotes_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {}
    return null;
  });
  const [showMobileDownloadSheet, setShowMobileDownloadSheet] = useState<boolean>(false);
  const [isExportingMobile, setIsExportingMobile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [showGeneratorHero, setShowGeneratorHero] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kalamnotes_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Update a single page
  const handleUpdatePage = (updatedPage: NotePage) => {
    const updatedPages = doc.pages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    setDoc({ ...doc, pages: updatedPages });
  };

  // Add a new blank page
  const handleAddPage = () => {
    const nextNum = doc.pages.length + 1;
    const basePage = doc.pages[doc.pages.length - 1] || doc.pages[0];

    const newPage: NotePage = {
      id: 'page-' + Date.now(),
      pageNumber: nextNum,
      headerTitle: `${doc.title.toUpperCase()} — PAGE ${nextNum}`,
      headerSubtitle: 'Unit Continuation & Detailed Concepts',
      subject: basePage.subject || 'Handwritten Revision Notes',
      date: new Date().toLocaleDateString('en-GB'),
      paperPattern: basePage.paperPattern || 'ruled',
      fontFamily: basePage.fontFamily || 'font-kalam',
      penColor: basePage.penColor || 'darkblue',
      showSpiral: basePage.showSpiral !== undefined ? basePage.showSpiral : true,
      stickyNotes: [
        {
          id: 's-' + Date.now(),
          title: '📌 Page Note',
          content: 'Add memory tricks or key formulas for this section...',
          color: 'yellow',
          rotation: -1,
          x: 75,
          y: 8,
        },
      ],
      bottomMemoryAid: `Memory Aid : Page ${nextNum} Key Takeaway Points`,
      sections: [
        {
          id: 'sec-' + Date.now(),
          type: 'question_cards',
          qBadge: `Q${nextNum}`,
          qTitle: 'Explain Key Principles, Implementation Details and Applications',
          layout: 'grid-4',
          cards: [
            {
              id: 'c1-' + Date.now(),
              title: 'Definition :',
              color: 'cyan',
              items: ['Define the core concept clearly and concisely.'],
            },
            {
              id: 'c2-' + Date.now(),
              title: 'Essential Features :',
              color: 'yellow',
              items: ['① Point 1', '② Point 2', '③ Point 3'],
            },
            {
              id: 'c3-' + Date.now(),
              title: 'Advantages :',
              color: 'green',
              items: ['• Scalable & robust', '• High efficiency'],
            },
            {
              id: 'c4-' + Date.now(),
              title: 'Limitations :',
              color: 'pink',
              items: ['• Initial overhead', '• Specialized maintenance'],
            },
          ],
        },
      ],
    };

    const newPages = [...doc.pages, newPage];
    setDoc({ ...doc, pages: newPages, targetPages: newPages.length });
    setCurrentPageIndex(newPages.length - 1);
    showToast(`Added Page ${nextNum} to notebook!`, 'success');
  };

  // Delete current page
  const handleDeleteCurrentPage = () => {
    if (doc.pages.length <= 1) {
      showToast('Notebook must have at least one page', 'info');
      return;
    }

    const filtered = doc.pages.filter((_, idx) => idx !== currentPageIndex);
    const renumbered = filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setDoc({ ...doc, pages: renumbered, targetPages: renumbered.length });
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
    showToast('Page removed from notebook', 'info');
  };

  // Add sticky note to current page
  const handleAddStickyNote = () => {
    const page = doc.pages[currentPageIndex];
    if (!page) return;

    const colors: Array<'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple'> = [
      'yellow', 'pink', 'blue', 'green', 'orange', 'purple',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newSticky = {
      id: 'sticky-' + Date.now(),
      title: '⚡ Quick Trick',
      content: 'Write an important formula, quick trick or reminder here...',
      color: randomColor,
      rotation: Math.floor(Math.random() * 6) - 3,
      x: 70,
      y: 15,
    };

    const updatedPage: NotePage = {
      ...page,
      stickyNotes: [...(page.stickyNotes || []), newSticky],
    };

    handleUpdatePage(updatedPage);
    showToast('Added sticky note to page!', 'success');
  };

  // Update current page settings (paper, font, pen, spiral)
  const handleUpdateCurrentPageSettings = (settings: {
    paperPattern?: PaperPattern;
    fontFamily?: FontFamily;
    penColor?: PenColor;
    showSpiral?: boolean;
  }) => {
    const page = doc.pages[currentPageIndex];
    if (!page) return;

    const updatedPage: NotePage = {
      ...page,
      ...settings,
    };
    handleUpdatePage(updatedPage);
  };

  // History Actions
  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.doc) {
      setDoc(item.doc);
      setCurrentPageIndex(0);
      showToast(`Opened notes: ${item.title || item.topic}`, 'success');
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentUser?.id) {
      deleteNotebookFromFirestore(currentUser.id, id).catch(() => {});
    }
    showToast('Removed from history', 'info');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('kalamnotes_history');
    } catch (e) {}
    showToast('History cleared', 'info');
  };

  // Auth Handlers with Firebase Auth & Firestore Sync
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    showToast(`Welcome back, ${user.name || 'Student'}! Logged in successfully.`, 'success');

    // Sync saved notebooks from Firestore
    try {
      const cloudNotebooks = await getUserNotebooksFromFirestore(user.id);
      if (cloudNotebooks.length > 0) {
        setHistory((prev) => {
          const map = new Map<string, HistoryItem>();
          prev.forEach((h) => map.set(h.id, h));
          cloudNotebooks.forEach((h) => map.set(h.id, h));
          return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        });
        showToast(`Synced ${cloudNotebooks.length} notebooks from Firestore!`, 'success');
      }
    } catch (e) {
      console.warn('Could not sync cloud notebooks:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await logOutFirebase();
    } catch (e) {}
    setCurrentUser(null);
    try {
      localStorage.removeItem('kalamnotes_user');
    } catch (e) {}
    showToast('Logged out successfully.', 'info');
  };

  // Sync with Firestore on mount if user is logged in
  useEffect(() => {
    if (currentUser?.id) {
      getUserNotebooksFromFirestore(currentUser.id)
        .then((cloudNotebooks) => {
          if (cloudNotebooks.length > 0) {
            setHistory((prev) => {
              const map = new Map<string, HistoryItem>();
              prev.forEach((h) => map.set(h.id, h));
              cloudNotebooks.forEach((h) => map.set(h.id, h));
              return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
            });
          }
        })
        .catch(() => {});
    }
  }, [currentUser?.id]);

  // AI Generation Handler
  const handleGenerate = async (params: {
    topic: string;
    targetPages: number;
    style: string;
    language: string;
    paperPattern: PaperPattern;
    fontFamily: FontFamily;
    penColor: PenColor;
  }) => {
    setIsLoading(true);
    setLoadingStep(1);
    const stepTimer = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      clearInterval(stepTimer);
      setLoadingStep(4);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate notes');
      }

      const generatedDoc: NotebookDocument = await response.json();
      if (generatedDoc.geminiError) {
        console.error('Gemini generation warning:', generatedDoc.geminiError);
        window.alert('Gemini note:\n\n' + generatedDoc.geminiError);
      }
      setDoc(generatedDoc);
      setCurrentPageIndex(0);
      if (generatedDoc.pages.length > 1) {
        setViewMode('all');
      }
      setIsGenerateModalOpen(false);

      // Save to History
      const newHistoryItem: HistoryItem = {
        id: 'hist-' + Date.now(),
        topic: params.topic,
        title: generatedDoc.title || params.topic,
        targetPages: generatedDoc.pages.length,
        timestamp: Date.now(),
        doc: generatedDoc,
      };

      setHistory((prev) => [
        newHistoryItem,
        ...prev.filter((h) => h.topic.toLowerCase().trim() !== params.topic.toLowerCase().trim()),
      ]);

      // Persist to Firestore if user is logged in
      if (currentUser?.id) {
        saveNotebookToFirestore(currentUser.id, generatedDoc).catch((err) =>
          console.warn('Failed to save notebook to Firestore:', err)
        );
      }

      showToast(
        `Successfully generated all ${generatedDoc.pages.length} pages for "${params.topic.slice(0, 30)}"! You can view all pages or click any page tab.`,
        'success'
      );
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error('Generation error:', err);
      window.alert('Notes generate nahi hue.\n\n' + (err?.message || 'Unknown error'));
      showToast(err.message || 'Error generating notes. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const safeCurrentPage = doc.pages[currentPageIndex] || doc.pages[0];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-300 selection:text-stone-900 flex flex-col">
      {/* Top Application Toolbar */}
      <Toolbar
        document={doc}
        currentPageIndex={currentPageIndex}
        onSelectPage={(idx) => setCurrentPageIndex(idx)}
        onAddPage={handleAddPage}
        onDeleteCurrentPage={handleDeleteCurrentPage}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        historyCount={history.length}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        onUpdateCurrentPageSettings={handleUpdateCurrentPageSettings}
        onAddStickyNote={handleAddStickyNote}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border backdrop-blur-md text-xs font-semibold animate-bounce no-print transition-all bg-stone-800 border-stone-700 text-stone-100">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-amber-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Loading Overlay with Animated Notebook Generation Steps */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm no-print">
          <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-6 text-center text-stone-100 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Generating Handwritten Notebook Notes...
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Creating authentic ruled pages with diagrams, tables, and sticky notes
              </p>
            </div>

            {/* Generation Progress Steps */}
            <div className="space-y-2 text-left bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 text-xs">
              <div className={`flex items-center gap-2 ${loadingStep >= 1 ? 'text-amber-300 font-semibold' : 'text-stone-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 1 ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}>
                  1
                </span>
                <span>Analyzing topic & breaking into target pages...</span>
              </div>

              <div className={`flex items-center gap-2 ${loadingStep >= 2 ? 'text-amber-300 font-semibold' : 'text-stone-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 2 ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}>
                  2
                </span>
                <span>Formulating handwritten definition & feature cards...</span>
              </div>

              <div className={`flex items-center gap-2 ${loadingStep >= 3 ? 'text-amber-300 font-semibold' : 'text-stone-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 3 ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}>
                  3
                </span>
                <span>Drawing architecture flowchart & comparison tables...</span>
              </div>

              <div className={`flex items-center gap-2 ${loadingStep >= 4 ? 'text-emerald-300 font-semibold' : 'text-stone-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingStep >= 4 ? 'bg-emerald-400 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}>
                  4
                </span>
                <span>Attaching exam sticky notes & memory aids!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-6 py-4 flex flex-col items-center">
        {/* Quick Topic Generator Banner */}
        {showGeneratorHero && (
          <QuickTopicGenerator
            onGenerate={handleGenerate}
            isLoading={isLoading}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onOpenFullHistory={() => setIsHistoryModalOpen(true)}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* Helper Banner for quick actions */}
        <div className="w-full max-w-5xl mb-3 flex flex-wrap items-center justify-between text-xs text-stone-400 px-2 no-print">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Click any title, definition, or sticky note to edit text directly.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGeneratorHero(!showGeneratorHero)}
              className="text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {showGeneratorHero ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Hide Topic Box
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Generate New Topic
                </>
              )}
            </button>

            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Layers className="w-3.5 h-3.5" />
              {doc.pages.length} {doc.pages.length === 1 ? 'Page' : 'Pages'} in Notebook
            </span>
          </div>
        </div>

        {/* View Mode: Single Page or All Pages (Booklet) */}
        {viewMode === 'single' ? (
          safeCurrentPage && (
            <NotebookPage
              key={safeCurrentPage.id}
              page={safeCurrentPage}
              totalPages={doc.pages.length}
              onUpdatePage={handleUpdatePage}
              onDeletePage={handleDeleteCurrentPage}
              isEditable={true}
            />
          )
        ) : (
          <div className="w-full flex flex-col items-center space-y-8">
            {doc.pages.map((p, idx) => (
              <NotebookPage
                key={p.id || idx}
                page={p}
                totalPages={doc.pages.length}
                onUpdatePage={handleUpdatePage}
                onDeletePage={handleDeleteCurrentPage}
                isEditable={true}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile Download */}
      <div className="fixed bottom-5 right-4 z-40 sm:hidden no-print">
        <button
          type="button"
          onClick={() => setShowMobileDownloadSheet(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-full shadow-2xl shadow-emerald-950/80 border border-emerald-400/40 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Notes</span>
        </button>
      </div>

      {/* Mobile Download Sheet / Dialog */}
      {showMobileDownloadSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/75 backdrop-blur-xs no-print">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-5 text-stone-100 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Download className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">Download Handwritten Notes</h3>
                  <p className="text-[11px] text-stone-400">Save directly to your phone or tablet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileDownloadSheet(false)}
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isExportingMobile}
                onClick={async () => {
                  setIsExportingMobile(true);
                  await downloadPageAsImage(
                    `notebook-page-${safeCurrentPage.id}`,
                    `${doc.title || 'notes'}-page-${safeCurrentPage.pageNumber}`
                  );
                  setIsExportingMobile(false);
                  setShowMobileDownloadSheet(false);
                  showToast(`Downloaded Page ${safeCurrentPage.pageNumber} as image!`, 'success');
                }}
                className="w-full flex items-center gap-3 p-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer text-left"
              >
                <ImageIcon className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-xs text-white">Download Current Page (PNG Image)</div>
                  <div className="text-[10px] text-stone-400">High-res picture of Page {safeCurrentPage.pageNumber}</div>
                </div>
              </button>

              {doc.pages.length > 1 && (
                <button
                  type="button"
                  disabled={isExportingMobile}
                  onClick={async () => {
                    setIsExportingMobile(true);
                    for (let i = 0; i < doc.pages.length; i++) {
                      const p = doc.pages[i];
                      await downloadPageAsImage(
                        `notebook-page-${p.id}`,
                        `${doc.title || 'notes'}-page-${p.pageNumber}`
                      );
                      await new Promise((r) => setTimeout(r, 600));
                    }
                    setIsExportingMobile(false);
                    setShowMobileDownloadSheet(false);
                    showToast(`Downloaded all ${doc.pages.length} pages!`, 'success');
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer text-left"
                >
                  <Layers className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-xs text-white">Download All {doc.pages.length} Pages (PNG)</div>
                    <div className="text-[10px] text-stone-400">One clear image file for each page</div>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowMobileDownloadSheet(false);
                  window.print();
                }}
                className="w-full flex items-center gap-3 p-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-sky-500/50 rounded-xl transition-all cursor-pointer text-left"
              >
                <Printer className="w-5 h-5 text-sky-400 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-xs text-white">Save as PDF / Print</div>
                  <div className="text-[10px] text-stone-400">Full A4 notebook format</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileDownloadSheet(false);
                  let fullText = `${doc.title}\n==============================\n\n`;
                  doc.pages.forEach((page, pIdx) => {
                    fullText += `--- PAGE ${pIdx + 1}: ${page.headerTitle} ---\n`;
                    if (page.headerSubtitle) fullText += `${page.headerSubtitle}\n\n`;
                    page.sections.forEach((sec) => {
                      fullText += `[${sec.qBadge || 'Section'}] ${sec.qTitle}\n`;
                      if (sec.cards) {
                        sec.cards.forEach((c) => {
                          fullText += `* ${c.title}\n  ${c.items.join('\n  ')}\n`;
                        });
                      }
                    });
                  });
                  downloadNotesAsText(doc.title, fullText);
                  showToast('Downloaded notes as text file!', 'success');
                }}
                className="w-full flex items-center gap-3 p-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-purple-500/50 rounded-xl transition-all cursor-pointer text-left"
              >
                <FileDown className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-xs text-white">Download Text (.txt)</div>
                  <div className="text-[10px] text-stone-400">Quick reading format</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        history={history}
      />

      {/* Search & Notes History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* OTP Login Modal (Phone Number or Gmail) */}
      {isLoginModalOpen && (
        <LoginPage
          isModal={true}
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}