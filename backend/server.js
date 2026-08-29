import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import Groq from 'groq-sdk';
import PDFParser from 'pdf2json';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

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

        // 1. Extract text using modern pdf2json
        const resumeText = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(null, 1);

            pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", () => {
                resolve(pdfParser.getRawTextContent());
            });

            pdfParser.parseBuffer(req.file.buffer);
        });

        // 2. EDGE CASE: Catch scanned images or unreadable PDFs
        if (resumeText.trim().length < 50) {
            return res.status(400).json({
                error: "We detected a scanned image or unreadable file. Please upload a standard text-based PDF."
            });
        }

        const jobDescription = req.body.jobDescription;

        // 3. Strict JSON formatting prompt with updated rules for Score and Bullets
        const systemPrompt = `You are an expert ATS AI. Compare the provided resume against the job description.
        You must return a raw JSON object exactly matching this structure, with no markdown formatting or extra text:
        {
          "matchScore": <number 0-100>,
          "standoutFeatures": [<array of 3 short string observations>],
          "areasToImprove": [<array of 2 short string observations>],
          "skillMatrix": {
            "matched": [<array of found technical skills>],
            "missing": [<array of missing technical skills>]
          },
          "bulletDiffs": [
            {
              "id": <unique number>,
              "original": "<an actual bullet point from the resume that needs improvement>",
              "suggested": "<the rewritten bullet point incorporating missing skills>",
              "status": "pending"
            }
          ]
        }       
        
        CRITICAL RULES:
        - Calculate the "matchScore" strictly based on the mathematical ratio of matched skills to total required skills in the job description. Do not estimate.
        - Generate a "bulletDiff" for EVERY bullet point in the original resume that can be meaningfully improved. Provide between 3 and 6 diffs depending on the resume length.`;

        // 4. The resilient API fallback queue
        const fallbackModels = [
            "openai/gpt-oss-120b",
            "groq/compound",
            "openai/gpt-oss-20b"
        ];

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
                    temperature: 0.0, // Swapped to 0.0 for maximum mathematical determinism
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

        // 5. Parse and return the JSON
        const aiData = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(aiData);

    } catch (error) {
        console.error("Analysis pipeline failed:", error);
        res.status(500).json({ error: "Internal server error during analysis." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server is blasting off on http://localhost:${port}`);
});