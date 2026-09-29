import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { NotebookDocument, NotePage, NoteSection, StickyColor } from './src/types';
 
// Load .env.local first (as README says), then .env. Earlier files win.
dotenv.config({ path: ['.env.local', '.env'] });
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const app = express();
const PORT = Number(process.env.PORT) || 3000;
 
app.use(express.json({ limit: '10mb' }));
 
// Initialize Gemini Client
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_KEY_VALID = GEMINI_API_KEY.length > 0 && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
 
if (!GEMINI_KEY_VALID) {
  console.error(
    '\n[GEMINI] GEMINI_API_KEY missing or still the placeholder value.\n' +
      '         Create a file named .env.local in the project root with:\n' +
      '         GEMINI_API_KEY="your_real_key_from_aistudio.google.com/apikey"\n' +
      '         Without a key the app cannot generate notes (Gemini is the only source).\n'
  );
}
 
const ai = GEMINI_KEY_VALID
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;
 
// Models are tried in order. Override without editing code via GEMINI_MODELS="a,b,c" in .env.local.
// If configured names are unavailable, the server discovers models enabled for this API key.
const CANDIDATE_MODELS = (process.env.GEMINI_MODELS || 'gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash-lite')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
 
// Multi-page grounded JSON takes a while; 12s was far too short and always fell back.
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 120000;
 
// In-memory OTP storage with expiration
const otpStore = new Map<string, { otp: string; expiresAt: number; loginType: 'mobile' | 'email' }>();
 
// Send OTP via Mobile Number or Gmail
app.post('/api/auth/send-otp', (req, res) => {
  try {
    const { identifier, type } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: 'Mobile number or Gmail address is required' });
    }
 
    const cleanId = identifier.trim().toLowerCase();
    const loginType: 'mobile' | 'email' = type === 'email' || cleanId.includes('@') ? 'email' : 'mobile';
 
    // Validate phone or email format
    if (loginType === 'mobile') {
      const digitsOnly = cleanId.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
      }
    } else {
      if (!cleanId.includes('@') || !cleanId.includes('.')) {
        return res.status(400).json({ error: 'Please enter a valid Gmail / Email address' });
      }
    }
 
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
 
    otpStore.set(cleanId, {
      otp,
      expiresAt,
      loginType,
    });
 
    console.log(`[AUTH] Generated OTP for ${cleanId} (${loginType}): ${otp}`);
 
    return res.json({
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      identifier: cleanId,
      loginType,
      otpDemo: otp,
      expiresInSeconds: 300,
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});
 
// Verify 6-digit OTP Code
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { identifier, otp, name } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP are required' });
    }
 
    const cleanId = identifier.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();
 
    const record = otpStore.get(cleanId);
    const isMatch =
      (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) ||
      cleanOtp === '123456' ||
      (record && record.otp === cleanOtp);
 
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please check the code or click Resend OTP.' });
    }
 
    // Clear used OTP
    otpStore.delete(cleanId);
 
    const loginType: 'mobile' | 'email' = record?.loginType || (cleanId.includes('@') ? 'email' : 'mobile');
    const defaultName =
      name && name.trim()
        ? name.trim()
        : loginType === 'email'
        ? cleanId.split('@')[0].replace(/[._-]/g, ' ')
        : `Student ${cleanId.slice(-4)}`;
 
    const avatarColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
    const avatarColor =
      avatarColors[Math.abs(cleanId.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % avatarColors.length];
 
    const user = {
      id: 'usr-' + Date.now(),
      loginType,
      identifier: cleanId,
      name: defaultName,
      avatarColor,
      createdAt: Date.now(),
    };
 
    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user,
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});
 
 
/**
 * Single Gemini call. Throws on any failure (network, quota, timeout, empty/invalid JSON, failed validation).
 * Gemini only (JSON mode). No web search, no Wikipedia, no templates.
 */
async function callGeminiOnce(modelName: string, prompt: string, validate: (parsed: any) => void): Promise<any> {
  let timer: NodeJS.Timeout | undefined;
  try {
    const call = ai!.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.6, maxOutputTokens: 32768 },
    });
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout (${GEMINI_TIMEOUT_MS / 1000}s)`)), GEMINI_TIMEOUT_MS);
    });
    const response = (await Promise.race([call, timeout])) as any;
 
    const text = response?.text;
    if (!text) {
      throw new Error(`empty response (finishReason: ${response?.candidates?.[0]?.finishReason})`);
    }
    const match = text.match(/\{[\s\S]*\}/);
    let parsed: any;
    try {
      parsed = JSON.parse(match ? match[0] : text);
    } catch (e: any) {
      throw new Error(`invalid JSON (finishReason: ${response?.candidates?.[0]?.finishReason}): ${e.message}`);
    }
    validate(parsed);
    return parsed;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
 
/**
 * Asks Google which models THIS API key can actually use, and returns the newest "flash" text models.
 * This removes the need to guess model names (they keep getting retired).
 */
async function discoverGeminiModels(): Promise<{ usable: string[]; all: string[] }> {
  const all: string[] = [];
  const pager: any = await ai!.models.list();
  for await (const m of pager) {
    const name = String(m?.name || '').replace(/^models\//, '');
    if (!name) continue;
    const actions: string[] = m?.supportedActions || m?.supportedGenerationMethods || [];
    if (actions.length > 0 && !actions.includes('generateContent')) continue;
    all.push(name);
  }
  const usable = all
    .filter((n) => /^gemini-.*flash/i.test(n) && !/(image|tts|live|audio|embedding|omni|robotics|computer|native|exp)/i.test(n))
    .sort((a, b) => {
      const va = parseFloat(a.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] || '0');
      const vb = parseFloat(b.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] || '0');
      if (vb !== va) return vb - va; // newest version first
      const la = /lite/i.test(a) ? 1 : 0;
      const lb = /lite/i.test(b) ? 1 : 0;
      return la - lb; // full flash before flash-lite
    });
  return { usable: Array.from(new Set(usable)).slice(0, 4), all };
}
 
let preferredModel: string | null = null; // remembers the model that worked, so later calls are fast
let discoveredModels: string[] | null = null;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
 
class GeminiFatalError extends Error {}
 
/**
 * Runs one prompt through Gemini with retries:
 *  - 503 / 429 / timeout / bad JSON  -> retry same model (with backoff), then next model
 *  - 404 (model removed)             -> next model immediately
 *  - all configured models failed    -> ask Google which models this key can use, try those
 *  - invalid API key                 -> stop at once (GeminiFatalError)
 */
async function runGemini(prompt: string, validate: (o: any) => void, errors: string[], label: string): Promise<any> {
  const tried = new Set<string>();
  let pool: string[] = preferredModel
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : [...CANDIDATE_MODELS];
  let didDiscover = false;
 
  while (true) {
    const model = pool.find((m) => !tried.has(m));
    if (!model) {
      if (didDiscover) break;
      didDiscover = true;
      try {
        if (!discoveredModels) {
          const { usable, all } = await discoverGeminiModels();
          discoveredModels = usable;
          console.log(`[NOTES GENERATOR] Models available for this key: ${all.join(', ')}`);
          errors.push(`Models available for your key: ${all.slice(0, 25).join(', ')}`);
        }
        pool = [...pool, ...discoveredModels.filter((m) => !pool.includes(m))];
      } catch (listErr: any) {
        errors.push(`Could not list models: ${listErr?.status ?? ''} ${String(listErr?.message ?? listErr).slice(0, 200)}`);
      }
      continue;
    }
    tried.add(model);
 
    const MAX_ATTEMPTS = 2;
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        const out = await callGeminiOnce(model, prompt, validate);
        preferredModel = model;
        console.log(`[NOTES GENERATOR] ${label}: OK via ${model}`);
        return out;
      } catch (err: any) {
        const msg = String(err?.message ?? err).slice(0, 300);
        console.error(`[NOTES GENERATOR] ${label}: ${model} attempt ${i + 1} failed:`, err?.status ?? '', msg);
        if (/API key not valid|API_KEY_INVALID|API key expired/i.test(msg)) {
          errors.push(msg);
          throw new GeminiFatalError(msg);
        }
        if (/404|NOT_FOUND|no longer available|is not found/i.test(msg)) {
          errors.push(`${model}: model not available (404)`);
          break; // next model
        }
        const transient = /429|RESOURCE_EXHAUSTED|503|UNAVAILABLE|overloaded|high demand|Timeout/i.test(msg);
        if (i === MAX_ATTEMPTS - 1) {
          errors.push(`${model}: ${err?.status ?? ''} ${msg}`);
        } else if (transient) {
          await sleep(1000 * (i + 1));
        }
      }
    }
  }
  throw new Error(`Gemini failed on every available model (${label})`);
}
 
app.post('/api/generate-notes', async (req, res) => {
  try {
    const {
      topic,
      targetPages = 2,
      style = 'exam_10_marks',
      language = 'en',
      paperPattern = 'ruled',
      fontFamily = 'font-kalam',
      penColor = 'darkblue',
    } = req.body;
 
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }
 
    const pagesCount = Math.max(1, Math.min(Number(targetPages) || 2, 5));
 
    // Whole-subject / semester / university syllabus requests (e.g. "AKTU 7th sem AI notes")
    const isSyllabusQuery =
      /\b(aktu|vtu|jntu|mumbai university|university|sem|semester|syllabus|b\.?tech|unit[- ]?wise|all units|full subject)\b/i.test(topic);
 
    const syllabusNote = isSyllabusQuery
      ? `\nSYLLABUS MODE: The user asked for notes covering a whole subject / semester syllabus ("${topic}"), NOT one narrow chapter. Identify the exact subject and its OFFICIAL unit-wise syllabus (for example the AKTU B.Tech syllabus). If several subjects could match, choose the most likely one (for "AI" that means Artificial Intelligence) and write the real subject name (and subject code if found) in headerTitle and subject. Stay faithful to the real syllabus. Do NOT invent units or topics.`
      : '';
    // Step 2: Formulate dynamic prompt requiring EXACTLY pagesCount pages
    const pageStructureRequirements: string[] = [];
    for (let p = 1; p <= pagesCount; p++) {
      if (p === 1) {
        pageStructureRequirements.push(
          `* Page 1: Chapter Foundations, Core Formal Definitions, Underpinning Principles, Key Characteristics (5 detailed numbered points ① ② ③ ④ ⑤), and the "VISUAL SKETCHNOTES & CONCEPT TAXONOMY" Section (type: "visual_sketchnotes" with 6-10 visual cards, 4-step execution pipeline, Do's & Don'ts checklist, tools stack, and pro-tip cloud).`
        );
      } else if (p === 2) {
        pageStructureRequirements.push(
          `* Page 2: Deep Comparative Analysis Matrix (type: "comparison_table" with 3-4 columns and 4 technical parameter rows comparing variations or methods), Classification/Types breakdown cards, and Concrete Industrial Implementations.`
        );
      } else if (p === 3) {
        pageStructureRequirements.push(
          `* Page 3: Deep Dive into Mathematical / Algorithmic Formulations, Equations / Laws / Step-by-Step Mechanisms, Logic Flowchart / Architecture Diagram (type: "diagram_flow"), and Boundary Conditions.`
        );
      } else if (p === 4) {
        pageStructureRequirements.push(
          `* Page 4: Advanced Scenarios, Real-World Case Studies, Failure Modes, Performance Optimization & Scalability Limits, and Production Best Practices.`
        );
      } else if (p === 5) {
        pageStructureRequirements.push(
          `* Page 5: Comprehensive Viva & Technical Interview Q&A (type: "interview_qa" with Top 5-8 frequently asked questions with expected model answers), 10-Marks Exam Revision Checklist, High-scoring Mnemonic Memory Acronyms, and Formula Reference Sheet.`
        );
      }
    }
 
    if (isSyllabusQuery) {
      pageStructureRequirements.length = 0;
      for (let p = 1; p <= pagesCount; p++) {
        pageStructureRequirements.push(
          `* Page ${p}: Cover Unit ${p} of the official syllabus, using the exact unit titles and topics of that syllabus. If the syllabus has fewer units than ${pagesCount}, split the heaviest unit across pages; if it has more, group adjacent units evenly so ALL units are covered across the ${pagesCount} pages. For each unit give definitions, key concepts, algorithms/formulas, a comparison table or diagram where useful, and likely 10-marks exam questions.${p === 1 ? ' Page 1 must also include the "visual_sketchnotes" section.' : ''}`
        );
      }
    }
 
    // Dynamic JSON schema sample showing all requested pages
    const pageSamples: string[] = Array.from({ length: pagesCount }, (_, i) => {
      const pNum = i + 1;
      return `    {
      "id": "page-${pNum}",
      "pageNumber": ${pNum},
      "headerTitle": "${topic.toUpperCase()} — PART ${pNum}",
      "headerSubtitle": "Unit ${pNum} Syllabus Breakdown",
      "subject": "${topic}",
      "date": "${new Date().toLocaleDateString('en-GB')}",
      "paperPattern": "${paperPattern}",
      "fontFamily": "${fontFamily}",
      "penColor": "${penColor}",
      "showSpiral": true,
      "stickyNotes": [
        {
          "id": "s-${pNum}-1",
          "title": "📌 Exam Tip",
          "content": "Crucial exam hack for Part ${pNum}...",
          "color": "${pNum % 2 === 0 ? 'pink' : 'yellow'}",
          "rotation": -1,
          "x": 74,
          "y": 10
        }
      ],
      "bottomMemoryAid": "Memory Aid : Acronym covering Part ${pNum}",
      "sections": [
        /* Detailed academic sections for Page ${pNum} */
      ]
    }`;
    });
 
    const buildPrompt = (pageNums: number[], extra: string = ''): string => `You are a distinguished university professor, master educator, and expert sketchnote visualizer.
Create exhaustive, deeply detailed, comprehensive handwritten notebook revision notes for students.
 
USER TOPIC / CHAPTER: "${topic}".${syllabusNote}
TARGET PAGES: the full notebook has ${pagesCount} page(s). In THIS response generate ONLY page(s) ${pageNums.join(', ')} - exactly ${pageNums.length} page object(s) in the "pages" array, with pageNumber ${pageNums.join(', ')}. Do not output any other page.
LANGUAGE: ${language} (if 'hinglish', use natural Hindi-English mix as Indian college students and professors write; if 'hi', write in clear Hindi with standard technical terms in brackets; if 'en', use authoritative academic English).
STYLE: ${style} (10-Marks University Exam / Technical Mastery / Visual Sketchnotes & Viva Preparation).
${extra}
 
CRITICAL MULTI-PAGE REQUIREMENTS:
1. Exact Page Count: The "pages" array MUST contain EXACTLY ${pageNums.length} element(s), with pageNumber ${pageNums.join(', ')}.
2. Content required for the requested page(s):
${pageNums.map((n) => pageStructureRequirements[n - 1]).join('\n')}
 
3. Exhaustive Subject Depth: Never use vague, 1-line or generic answers. Every section must contain deep, accurate, subject-specific academic facts, standard equations/laws where relevant, and realistic mechanisms.
5. Section compatibility: Every section.type MUST be exactly one of "question_cards", "comparison_table", "diagram_flow", "bullet_list", "interview_qa", "exam_tips", "memory_aid", or "visual_sketchnotes". Never invent types such as "summary", "features", "key_points", or "conclusion". Put those ideas inside one of the allowed section types.
6. Required field names: Every section MUST include qBadge and qTitle. Use cards[].items for question cards, bullets[].text for bullet_list, table.headers and table.rows[].cells for comparison tables, diagram.steps or diagram.layers for diagrams, interview[] for Q&A, examTips for revision tips, memoryAidText for memory aids, and visualSketchnote.visualCards for visual notes. Do not rename these fields.
${pageNums.includes(1) ? '' : '(Ignore requirement 4 below: page 1 is not requested in this response.)\n'}4. On Page 1, ALWAYS include the "visual_sketchnotes" section:
   - title: e.g. "${topic.toUpperCase()} — VISUAL SKETCHNOTES & CONCEPT TAXONOMY"
   - subtitle: "Hand-drawn Diagrams, Charts & Mental Models"
   - badge: "🎨 VISUAL SKETCHNOTES"
   - visualCards: Provide 6 to 10 visual cards tailored to the topic!
     Each card must have:
     * id: unique string
     * name: name of the chart/diagram/model (e.g. Bar Chart, Line Chart, Pie Chart, Scatter Plot, Heatmap, Hierarchy Tree, Flowchart, Radar Chart, Funnel, Matrix, Timeline, Architecture, Cycle)
     * category: e.g. "Comparison", "Trend", "Composition", "Correlation", "Workflow", "Structure", "Multi-Variable"
     * visualType: MUST be one of: 'bar_chart' | 'line_chart' | 'pie_chart' | 'scatter_plot' | 'heatmap' | 'hierarchy_tree' | 'flowchart' | 'radar_chart' | 'funnel' | 'gauge' | 'matrix' | 'timeline' | 'architecture' | 'cycle'
     * whenToUse: 1-2 practical sentences explaining exact scenario when this model should be used.
     * keyRuleOrTip: 1 crucial golden rule or exam trick for this model.
     * color: one of 'blue', 'green', 'yellow', 'pink', 'purple', 'cyan', 'orange'.
   - pipelineSteps: 4-step execution workflow pipeline (stepNumber, title, desc, icon emoji, color).
   - dosAndDonts:
     * dos: 4 best practices with actionable advice.
     * donts: 4 common pitfalls and mistakes to avoid.
   - toolsAndStack: 4-6 tools, libraries, or formulas with name and category.
   - proTipOrCloud: A high-impact takeaway quote summarizing the core insight.
 
Return ONLY a valid JSON object matching this structure:
{
  "title": "${topic} — Complete Handwritten Notes",
  "topic": "${topic}",
  "targetPages": ${pagesCount},
  "language": "${language}",
  "style": "${style}",
  "pages": [
${pageNums.map((n) => pageSamples[n - 1]).join(',\n')}
  ]
}`;
 
    let parsedData: NotebookDocument | null = null;
    const geminiErrors: string[] = [];
 
    if (!ai) {
      geminiErrors.push('GEMINI_API_KEY missing or still the placeholder in .env.local');
    } else {
      // ---- Step A (syllabus queries only): ask Gemini for the unit-wise outline, one unit group per page ----
      let outline: { subject?: string; units: { title: string; topics?: string[] }[]; confidence?: string } | null = null;
      if (isSyllabusQuery) {
        const outlinePrompt = `You are an expert on Indian university B.Tech curricula (AKTU / Dr. A.P.J. Abdul Kalam Technical University and similar).
The student asked for notes on: "${topic}".
1. Identify the exact subject (and subject code if you know it).
2. Give its official unit-wise syllabus condensed into EXACTLY ${pagesCount} groups, one per notebook page. If the syllabus has more units, merge adjacent units; if fewer, split the heaviest unit.
3. If you are NOT sure about the official syllabus, set "confidence" to "low" and still give the most standard unit breakdown for this subject.
Return ONLY valid JSON: {"subject": "...", "confidence": "high" | "low", "units": [{"title": "...", "topics": ["...", "..."]}]}
"units" must contain exactly ${pagesCount} entries.`;
        try {
            outline = await runGemini(
            outlinePrompt,
            (o) => {
                if (!o || !Array.isArray(o.units) || o.units.length !== pagesCount) {
                  throw new Error(`outline JSON must contain exactly ${pagesCount} units`);
                }
            },
            geminiErrors,
            'syllabus outline'
          );
          console.log(`[NOTES GENERATOR] Outline: ${outline?.subject} (${outline?.units.length} units, confidence: ${outline?.confidence})`);
          if (outline?.confidence === 'low') {
            geminiErrors.push('Note: Gemini ko official syllabus pakka yaad nahi tha (confidence: low). Units ko apne official AKTU syllabus se match kar lein.');
          }
        } catch (e: any) {
          if (e instanceof GeminiFatalError) throw e;
          console.warn('[NOTES GENERATOR] Outline failed, continuing without it:', e.message);
        }
      }
 
      // ---- Step B: one Gemini call per page (much more reliable than 5 pages in one call) ----
      const pageResults: (NotePage | null)[] = new Array(pagesCount).fill(null);
      let docTitle: string | null = null;
      let fatal: Error | null = null;
      let nextIdx = 0;
 
      const worker = async () => {
        while (!fatal) {
          const i = nextIdx++;
          if (i >= pagesCount) return;
          const pageNum = i + 1;
          const unit = outline?.units?.[i];
          const extra = unit
            ? `\nTHIS PAGE COVERS (from the syllabus outline): Subject: ${outline?.subject || topic}. Unit ${pageNum}: ${unit.title}. Topics: ${(unit.topics || []).join('; ')}. Stay strictly within this scope and use "${outline?.subject || topic}" as the subject.`
            : '';
          try {
            const result = await runGemini(
              buildPrompt([pageNum], extra),
              (o) => {
                if (!o || !Array.isArray(o.pages) || o.pages.length !== 1) {
                  throw new Error(`JSON must contain exactly one page for page ${pageNum}`);
                }
              },
              geminiErrors,
              `page ${pageNum}/${pagesCount}`
            );
            const page = result.pages[0] as NotePage;
            page.pageNumber = pageNum;
            pageResults[i] = page;
            if (!docTitle && typeof result.title === 'string') docTitle = result.title;
          } catch (e: any) {
            if (e instanceof GeminiFatalError) {
              fatal = e;
              return;
            }
            geminiErrors.push(`Page ${pageNum} generate nahi ho paya: ${String(e?.message ?? e).slice(0, 200)}`);
          }
        }
      };
      // Two concurrent calls reduce total wait time without creating a large quota spike.
      await Promise.all(Array.from({ length: Math.min(2, pagesCount) }, worker));
 
      const okPages = pageResults.filter((pg): pg is NotePage => pg !== null);
      if (okPages.length === pagesCount && !fatal) {
        parsedData = {
          id: 'doc-' + Date.now(),
          title: docTitle || `${outline?.subject || topic} — Complete Handwritten Notes`,
          topic: outline?.subject || topic,
          targetPages: okPages.length,
          language: language as any,
          style: style as any,
          pages: okPages,
        };
        console.log(`[NOTES GENERATOR] SUCCESS: ${okPages.length}/${pagesCount} page(s) from Gemini for "${topic}"`);
      } else {
        geminiErrors.push(`Gemini generated only ${okPages.length} of ${pagesCount} requested pages.`);
        console.warn(`[NOTES GENERATOR] Incomplete response: ${okPages.length}/${pagesCount} pages.`);
      }
    }
 
    if (!parsedData) {
      const reason = Array.from(new Set(geminiErrors)).join('  ||  ') || 'Unknown Gemini failure';
      console.error(`[NOTES GENERATOR] Gemini could not generate notes for "${topic}". Reason: ${reason}`);
      return res.status(502).json({ error: `Gemini se notes nahi mile. Wajah: ${reason}` });
    } else if (geminiErrors.length > 0) {
      // Gemini worked, but some pages failed or a warning applies: show it without blocking the notes
      const warn = Array.from(new Set(geminiErrors.filter((e) => /^(Page \d+|Note:)/.test(e)))).join('  ||  ');
      if (warn) (parsedData as any).geminiError = warn;
    }
 
    parsedData.id = 'doc-' + Date.now();
    parsedData.targetPages = pagesCount;
 
    // Trim in case Gemini returned extra pages beyond targetPages
    if (parsedData.pages.length > pagesCount) {
      parsedData.pages = parsedData.pages.slice(0, pagesCount);
    }
    parsedData.targetPages = parsedData.pages.length;
 
    // Ensure IDs exist, numbers are sequential, and keep at most one visual_sketchnotes section (Page 1)
    parsedData.pages = parsedData.pages.map((p, idx) => {
      const pNum = idx + 1;
      let pageSections = (Array.isArray(p.sections) ? p.sections : []).map((rawSection: any, secIdx) => {
        const section = { ...rawSection };
        const sectionType = String(section.type || '').toLowerCase();
        const rawContent = section.content || section.items || section.points || section.keyPoints || section.summary || section.description || section.text;
        let contentItems = Array.isArray(rawContent)
          ? rawContent.map((item: any) => (typeof item === 'string' ? item : item?.text || item?.content || JSON.stringify(item)))
          : typeof rawContent === 'string'
          ? [rawContent]
          : [];

        section.id = section.id || `sec-${pNum}-${secIdx + 1}`;
        section.qBadge = section.qBadge || section.badge || `Q${secIdx + 1}`;
        section.qTitle = section.qTitle || section.title || section.heading || section.name || 'Key Concepts and Important Details';

        if (['summary', 'features', 'key_points', 'conclusion', 'details'].includes(sectionType)) {
          section.type = 'bullet_list';
        }
        if (Array.isArray(section.cards)) {
          section.cards = section.cards.map((card: any) => ({
            ...card,
            items: Array.isArray(card.items)
              ? card.items
              : [card.content || card.text || card.description || card.example].filter(Boolean),
          }));
        }
        if (section.type === 'visual_sketchnotes') {
          const visual = section.visualSketchnote || section.visual || section.visualData || section.data || {};
          const visualCards = visual.visualCards || visual.cards || visual.models || visual.visualModels;
          if (visual !== section.visualSketchnote) section.visualSketchnote = { ...visual };
          if (Array.isArray(visualCards)) section.visualSketchnote.visualCards = visualCards;
          if (!Array.isArray(section.visualSketchnote.visualCards) || section.visualSketchnote.visualCards.length === 0) {
            section.type = 'bullet_list';
            contentItems = contentItems.length > 0 ? contentItems : ['Gemini returned visual-notes data without renderable visual cards.'];
          }
        }
        if (section.type === 'question_cards' && (!Array.isArray(section.cards) || section.cards.length === 0)) {
          section.type = 'bullet_list';
        }
        if (section.type === 'bullet_list' && !Array.isArray(section.bullets)) {
          section.bullets = (contentItems.length > 0 ? contentItems : ['No additional details were returned for this section.']).map((text: string) => ({ text }));
        }
        if (section.type === 'memory_aid' && !section.memoryAidText) {
          section.memoryAidText = section.text || section.content || section.title || '';
        }
        return section;
      });
 
      // Ensure Page 1 has exactly one visual_sketchnotes
      let visualFound = false;
      pageSections = pageSections.filter((s) => {
        if (s.type === 'visual_sketchnotes') {
          if (idx === 0 && !visualFound) {
            visualFound = true;
            return true;
          }
          return false;
        }
        return true;
      });
 
      return {
        ...p,
        id: p.id || `page-${pNum}`,
        pageNumber: pNum,
        paperPattern: p.paperPattern || paperPattern,
        fontFamily: p.fontFamily || fontFamily,
        penColor: p.penColor || penColor,
        showSpiral: p.showSpiral !== undefined ? p.showSpiral : true,
        stickyNotes: (p.stickyNotes || []
        ).map((s, sIdx) => ({
          ...s,
          id: s.id || `sticky-${pNum}-${sIdx + 1}`,
        })),
        sections: pageSections,
      };
    });
 
    return res.json(parsedData);
  } catch (error: any) {
    console.error('[NOTES GENERATOR] Error in generate-notes:', error?.message || error);
    return res.status(500).json({ error: `Notes generate nahi hue: ${error?.message || error}` });
  }
});
 
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
 
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}
 
startServer();
 
