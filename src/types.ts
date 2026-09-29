export type PaperPattern = 'ruled' | 'legal' | 'grid' | 'dot' | 'parchment' | 'clean';

export type FontFamily = 'font-kalam' | 'font-caveat' | 'font-patrick' | 'font-gochi' | 'font-indie';

export type PenColor = 'blue' | 'black' | 'darkblue' | 'purple' | 'green';

export type CardColor = 'cyan' | 'yellow' | 'green' | 'pink' | 'purple' | 'orange' | 'blue';

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

export interface ConceptCard {
  id: string;
  title: string;
  badge?: string;
  color: CardColor;
  items: string[];
  example?: string;
}

export interface ComparisonTable {
  headers: Array<{ text: string; color?: CardColor }>;
  rows: Array<{
    label?: string;
    cells: string[];
  }>;
}

export interface DiagramNode {
  id: string;
  label: string;
  subLabel?: string;
  color?: CardColor;
  shape?: 'box' | 'cloud' | 'pill' | 'server' | 'user';
}

export interface DiagramFlow {
  title?: string;
  subtitle?: string;
  diagramType: 'horizontal_flow' | 'architecture_stack' | 'tiered' | 'virtualization';
  steps?: Array<{
    step: string;
    title: string;
    desc?: string;
    icon?: string;
    color?: CardColor;
  }>;
  layers?: Array<{
    name: string;
    items: string[];
    color?: CardColor;
  }>;
}

export interface InterviewQA {
  id: string;
  question: string;
  answer: string;
  expectedKeywords?: string[];
  importance?: 'high' | 'viva' | 'frequently_asked';
}

export interface ExamRevisionSection {
  title: string;
  keyFormulasOrPoints: string[];
  mustRememberTip?: string;
  weightage?: string;
}

export type VisualDiagramType =
  | 'bar_chart'
  | 'line_chart'
  | 'pie_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'hierarchy_tree'
  | 'flowchart'
  | 'radar_chart'
  | 'funnel'
  | 'gauge'
  | 'matrix'
  | 'timeline'
  | 'architecture'
  | 'cycle'
  | 'custom_svg';

export interface VisualCardItem {
  id: string;
  name: string;
  category?: string; // e.g. "Comparison", "Distribution", "Composition", "Relationship", "Workflow"
  visualType: VisualDiagramType;
  whenToUse: string;
  keyRuleOrTip?: string;
  color?: CardColor;
  icon?: string;
}

export interface VisualFlowStep {
  stepNumber: number | string;
  title: string;
  desc: string;
  icon?: string;
  color?: CardColor;
}

export interface BestPracticesDoDont {
  dos: string[];
  donts: string[];
}

export interface VisualSketchnoteData {
  title: string;
  subtitle?: string;
  badge?: string;
  themeBannerColor?: CardColor;
  visualCards: VisualCardItem[];
  pipelineSteps?: VisualFlowStep[];
  dosAndDonts?: BestPracticesDoDont;
  toolsAndStack?: Array<{ name: string; category?: string; badgeColor?: CardColor }>;
  proTipOrCloud?: string;
}

export interface NoteSection {
  id: string;
  type:
    | 'question_cards'
    | 'comparison_table'
    | 'diagram_flow'
    | 'bullet_list'
    | 'interview_qa'
    | 'exam_tips'
    | 'memory_aid'
    | 'visual_sketchnotes';
  qBadge?: string; // e.g. "Q1", "Q2", "IMP", "CORE", "VISUAL"
  qTitle: string; // e.g. "Define Cloud Computing : Explain characteristics, advantages..."
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' | 'full';
  cards?: ConceptCard[];
  table?: ComparisonTable;
  diagram?: DiagramFlow;
  bullets?: Array<{ text: string; highlight?: boolean; boldPrefix?: string }>;
  interview?: InterviewQA[];
  examTips?: ExamRevisionSection;
  memoryAidText?: string;
  visualSketchnote?: VisualSketchnoteData;
}

export interface StickyNoteItem {
  id: string;
  title?: string;
  content: string;
  color: StickyColor;
  rotation?: number; // e.g. -2, 2, -1
  x?: number; // percentage (0 to 80%)
  y?: number; // percentage (0 to 80%)
  pinned?: boolean;
}

export interface NotePage {
  id: string;
  pageNumber: number;
  headerTitle: string;
  headerSubtitle?: string;
  subject?: string;
  date?: string;
  paperPattern: PaperPattern;
  fontFamily: FontFamily;
  penColor: PenColor;
  showSpiral: boolean;
  sections: NoteSection[];
  stickyNotes: StickyNoteItem[];
  bottomMemoryAid?: string;
}

export interface NotebookDocument {
  id: string;
  title: string;
  topic: string;
  targetPages: number;
  language: 'en' | 'hi' | 'hinglish';
  style: 'exam_10_marks' | 'interview_prep' | 'cheat_sheet' | 'concept_deep_dive';
  pages: NotePage[];
  /** Set by the server when Gemini generated notes with a non-fatal warning. */
  geminiError?: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  title: string;
  targetPages: number;
  timestamp: number;
  doc: NotebookDocument;
}

export interface UserProfile {
  id: string;
  loginType: 'mobile' | 'email';
  identifier: string; // phone number (e.g. "+91 9876543210") or email ("user@gmail.com")
  name: string;
  avatarColor?: string;
  createdAt: number;
}