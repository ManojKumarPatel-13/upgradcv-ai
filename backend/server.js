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

        CRITICAL DIRECTIVE: Do NOT summarize, abbreviate, or delete ANY content from the original resume. Every single language, framework, tool, project, and bullet point MUST be copied into the JSON verbatim. Loss of data will result in system failure.

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
        - Generate 3 to 5 'bulletDiffs'. The 'id' MUST exactly match the 'id' assigned to that bullet in the 'resumeData' arrays.`;

        const fallbackModels = ["openai/gpt-oss-120b", "groq/compound", "openai/gpt-oss-20b"];
        let chatCompletion = null;
        let lastError = null;

        for (const currentModel of fallbackModels) {
            try {
                console.log(`Attempting analysis with model: ${currentModel}...`);
                chatCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `RESUME TEXT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}` }
                    ],
                    model: currentModel,
                    temperature: 0.0,
                    response_format: { type: "json_object" }
                });
                console.log(`✅ Success using model: ${currentModel}`);
                break;
            } catch (err) {
                console.warn(`⚠️ Model ${currentModel} failed. Moving to next fallback...`);
                lastError = err;
            }
        }

        if (!chatCompletion) {
            throw new Error(`All LLM fallback models failed. Last error: ${lastError.message}`);
        }

        const aiData = JSON.parse(chatCompletion.choices[0].message.content);
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