import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Groq from 'groq-sdk';
import PDFParser from 'pdf2json';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const analysisCache = new Map();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'UpgradCV API is online and listening.' });
});

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Missing resume PDF payload." });
        }

        if (!req.body.jobDescription) {
            return res.status(400).json({ error: "Missing job description text." });
        }

        const resumeText = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(null, 1);
            pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
            pdfParser.parseBuffer(req.file.buffer);
        });

        if (resumeText.trim().length < 50) {
            return res.status(400).json({ error: "We detected a scanned image or unreadable file. Please upload a standard text-based PDF." });
        }

        const jobDescription = req.body.jobDescription;
        const cacheKey = crypto.createHash('sha256').update(resumeText + jobDescription).digest('hex');

        if (analysisCache.has(cacheKey)) {
            console.log("Serving analysis from cache.");
            return res.json(analysisCache.get(cacheKey));
        }

        const systemPrompt = `You are an expert ATS AI. You have two mandatory tasks:
        1. Extract the resume text into a structured JSON format with ZERO DATA LOSS.
        2. Compare it against the job description to find missing skills and inject them.

        CRITICAL DIRECTIVE — ZERO DATA LOSS (highest priority, overrides brevity):
        - Do NOT summarize, abbreviate, condense, truncate, or delete ANY content from the original resume.
        - Every single skill, language, framework, tool, certification, extracurricular, project, job entry, and bullet point in the original resume MUST appear in "resumeData", copied verbatim (only "bulletDiffs" may reword text, via the "suggested" field, never by altering "resumeData" bullets directly for non-diffed bullets).
        - The COUNT of items you output in each resumeData array (experience[].bullets, projects[].bullets, skills categories, education, certifications, extracurriculars) MUST equal the count of that same item type in the original resume text. If the original resume has 6 bullets under a job, "resumeData" must contain all 6 — not 3, not 4. Only 3-5 of ALL bullets across the whole resume get a matching "bulletDiffs" entry; the rest are copied through unchanged.
        - "skills": do NOT force-fit into only "Languages"/"Frameworks"/"Tools". Preserve the ORIGINAL category headings from the resume exactly as written (e.g. "Databases", "Cloud & DevOps", "Soft Skills"). If the resume has no explicit categories, put everything under a single "Technical Skills" key. Never drop a skill because it doesn't fit a predefined bucket.
        - Before writing the final JSON, mentally re-count every bullet, skill, project, and section in the source text and verify none are missing. Loss or truncation of ANY item is treated as a failed response.

        You must return a raw JSON object exactly matching this structure, with no markdown:
        {
          "matchScore": <number 0-100 based on skill ratio>,
          "coverLetterSnippet": "<A compelling 3-sentence cover letter opening>",
          "standoutFeatures": ["<array of 3 short strings>"],
          "areasToImprove": ["<array of 2 short strings>"],
          "skillMatrix": {
            "matched": ["<array of found skills>"],
            "missing": ["<array of missing skills>"]
          },
          "bulletDiffs": [
            {
              "id": "<unique string id matching the experience/project bullets below>",
              "original": "<actual original bullet text>",
              "suggested": "<rewritten bullet naturally injecting a MISSING keyword>",
              "status": "pending"
            }
          ],
          "resumeData": {
            "header": { "name": "", "email": "", "phone": "", "links": [] },
            "summary": "",
            "skills": { "Languages": [], "Frameworks": [], "Tools": [] },
            "experience": [
              { "company": "", "title": "", "date": "", "location": "", "bullets": [{ "id": "", "text": "" }] }
            ],
            "projects": [
              { "name": "", "role": "", "date": "", "links": [], "bullets": [{ "id": "", "text": "" }] }
            ],
            "education": [
              { "institution": "", "degree": "", "date": "", "location": "", "details": [] }
            ],
            "certifications": [],
            "extracurriculars": []
          }
        }       
        
        RULES:
        - Generate 3 to 5 'bulletDiffs' (a SUBSET of all bullets). The 'id' MUST exactly match the 'id' assigned to that bullet in the 'resumeData' arrays.
        - Every bullet in 'resumeData' (whether or not it has a matching 'bulletDiffs' entry) must still be present, in original order, with an "id".
        - Do not omit any "skills" category or item, any "education" entry, any "certifications" or "extracurriculars" item, or any "project" from the original resume.`;

        const fallbackModels = ["openai/gpt-oss-120b", "groq/compound", "openai/gpt-oss-20b"];

        // Groq's free/on-demand tier enforces a hard TOKENS-PER-MINUTE cap that varies
        // by model (e.g. openai/gpt-oss-20b can be as low as 8000 TPM for a given account).
        // That cap covers prompt tokens + completion tokens COMBINED for a single request.
        // A flat max_tokens (e.g. 8192) works for some models but instantly blows past the
        // cap on smaller/stricter ones once the prompt itself is a couple thousand tokens
        // (a real resume + job description easily is). So instead:
        //   1. Start each model with a modest completion budget.
        //   2. If Groq reports "Limit X, Requested Y" (413/429, tokens-per-minute), that
        //      response tells us the model's true per-minute cap — recompute a completion
        //      budget that actually fits and retry the SAME model once before giving up on it.
        //   3. If the response comes back truncated (finish_reason === "length") instead,
        //      that's the opposite problem — retry the same model once with a larger budget.
        const INITIAL_MAX_TOKENS = 4096;
        const MAX_TOKENS_CEILING = 8192;
        const TOKEN_SAFETY_MARGIN = 200;

        const estimateTokens = (text) => Math.ceil((text || "").length / 4); // ~4 chars/token, rough but good enough for budgeting
        const promptTokenEstimate =
            estimateTokens(systemPrompt) + estimateTokens(resumeText) + estimateTokens(jobDescription);

        const parseTpmLimit = (message) => {
            const match = /Limit (\d+), Requested (\d+)/.exec(message || "");
            if (!match) return null;
            return { limit: parseInt(match[1], 10), requested: parseInt(match[2], 10) };
        };

        let aiData = null;
        let lastError = null;

        modelLoop:
        for (const currentModel of fallbackModels) {
            let maxTokensForThisModel = INITIAL_MAX_TOKENS;

            // Up to 2 attempts per model: the initial try, plus one adaptive retry
            // (budget scaled down after a TPM error, or scaled up after truncation).
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    console.log(`Attempting analysis with model: ${currentModel} (max_tokens=${maxTokensForThisModel})...`);
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}` }
                        ],
                        model: currentModel,
                        temperature: 0.0,
                        max_tokens: maxTokensForThisModel,
                        response_format: { type: "json_object" }
                    });

                    const rawContent = chatCompletion.choices[0].message.content;
                    const finishReason = chatCompletion.choices[0].finish_reason;

                    if (finishReason === "length") {
                        if (maxTokensForThisModel < MAX_TOKENS_CEILING && attempt === 0) {
                            maxTokensForThisModel = MAX_TOKENS_CEILING;
                            console.warn(`${currentModel} truncated the response — retrying once with max_tokens=${MAX_TOKENS_CEILING}.`);
                            continue;
                        }
                        throw new Error(`Response truncated (finish_reason=length) on model ${currentModel}.`);
                    }

                    aiData = JSON.parse(rawContent); // throws if the JSON is malformed/incomplete
                    console.log(`✅ Success using model: ${currentModel}`);
                    break modelLoop;

                } catch (err) {
                    const status = err.status || err.statusCode;
                    const tpm = parseTpmLimit(err.message);

                    if (tpm && (status === 413 || status === 429) && attempt === 0) {
                        // Groq just told us this model's real per-minute token cap.
                        // Recompute a completion budget that fits under it and retry once.
                        const safeBudget = tpm.limit - promptTokenEstimate - TOKEN_SAFETY_MARGIN;
                        if (safeBudget >= 500) {
                            maxTokensForThisModel = safeBudget;
                            console.warn(`${currentModel} hit its TPM limit (limit=${tpm.limit}) — retrying once with max_tokens=${safeBudget}.`);
                            continue;
                        }
                    }

                    console.warn(`⚠️ Model ${currentModel} failed or returned invalid/truncated JSON. Moving to next fallback...`, err.message);
                    lastError = err;
                    break; // give up on this model, move to the next fallback
                }
            }
        }

        if (!aiData) {
            throw new Error(`All LLM fallback models failed to produce valid JSON. Last error: ${lastError?.message}`);
        }

        const finalPayload = { ...aiData, originalText: resumeText };

        analysisCache.set(cacheKey, finalPayload);
        res.json(finalPayload);

    } catch (error) {
        console.error("Analysis pipeline failed:", error);
        res.status(500).json({ error: "Internal server error during analysis." });
    }
});

app.post('/api/refine', async (req, res) => {
    try {
        const { originalText, instruction } = req.body;

        if (!originalText || !instruction) {
            return res.status(400).json({ error: "Missing original text or instruction." });
        }

        const systemPrompt = `You are an expert resume writer. The user will provide a resume bullet point and an instruction on how to improve it. 
        You must return a raw JSON object exactly matching this structure, with no markdown formatting or extra text:
        {
            "refinedText": "<the newly rewritten bullet point>"
        }`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `ORIGINAL BULLET:\n${originalText}\n\nINSTRUCTION:\n${instruction}` }
            ],
            model: "openai/gpt-oss-120b",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        const aiData = JSON.parse(chatCompletion.choices[0].message.content);
        res.json({ refinedText: aiData.refinedText });

    } catch (error) {
        console.error("Refinement failed:", error);
        res.status(500).json({ error: "Failed to refine bullet point." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server is blasting off on http://localhost:${port}`);
});