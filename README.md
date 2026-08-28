# UpgradCV

An AI-powered resume tailoring studio built for the SyncGaze Hackathon. UpgradCV scores candidate profiles against job descriptions, highlights critical keyword gaps, and generates ATS-compliant PDFs to help applicants land interviews without hallucinating qualifications.

## Core Features

* **Zero-Friction Ingestion:** Drag-and-drop PDF upload and job description text parsing.
* **Analytics Dashboard:** Animated circular match scoring and a categorized skill gap matrix (Matched vs. Missing).
* **Interactive Tailoring Studio:** Side-by-side visual diffs comparing original resume bullets with AI-optimized, metric-driven rewrites. Includes manual inline editing.
* **ATS-Safe PDF Export:** One-click client-side export to a clean, single-column ATS-compliant PDF using `html2pdf.js`.
* **Demo Mode:** Instant one-click mock data injection to guarantee a flawless live presentation.

## Tech Stack

* **Frontend:** React (via Vite), Tailwind CSS, Lucide React (Icons), `html2pdf.js`
* **Backend (Planned):** Node.js, Express, `multer`, `pdf-parse`
* **AI Engine:** Prompt-engineered LLM (Google Gemini / Groq) with strict JSON schema enforcement

## Local Development Setup

Follow these steps to run the frontend locally:

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/upgradcv-ai.git
cd upgradcv-ai

```

**2. Install dependencies**

```bash
npm install

```

**3. Start the Vite development server**

```bash
npm run dev

```

**4. Access the application**
Open your browser and navigate to `http://localhost:5173`.