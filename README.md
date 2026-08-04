# Test-LM — AI Educational Test & Question Generator

Test-LM is a web application designed for educators to automatically generate, edit, manage, and export educational tests and quizzes from lesson materials (PDF, DOCX, TXT, images) in Lao and English using AI (Gemini, OpenAI, Anthropic).

---

## 🏛️ Architecture

* **Frontend**: Next.js 16 (React 19, TypeScript, Modular Material Design CSS) in `next-app/`
* **Backend**: Node.js / Express (TypeScript, REST API) in `backend/`
* **Database**: SQLite3 (`test_lm.db`) with WAL mode, foreign keys, and non-destructive schema migrations.
* **OCR & Document Extraction**: Node.js (`pdf-parse`, `mammoth`, `tesseract.js`) with Python fallback (`pdf_ocr.py` via Poppler & Tesseract-OCR).

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
setup.bat
```
* Copies `.env.example` to `.env` if not present.
* Installs dependencies for root, `backend/`, and `next-app/`.
* Builds backend TypeScript into `backend/dist/`.

### 2. Configure Environment Variables
Edit `.env` on the server:
```env
PORT=5000
SECRET_KEY=secure_random_session_secret
GEMINI_API_KEY=AIzaSy...
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
```

### 3. Launch Application
```bash
start.bat
# or
npm start
```
* **Frontend**: http://localhost:3000
* **Backend API**: http://localhost:5000

---

## 🧪 Testing

Run the automated backend test suite:
```bash
npx tsx backend/src/test_suite.ts
```

Run production builds:
```bash
npm run build
```

---

## 🔒 Security & Privacy

* **Server-Side API Key Management**: API keys (`GEMINI_API_KEY`, etc.) are configured exclusively on the server in `.env`. They are never stored in browser `localStorage` or exposed to client-side JavaScript.
* **User Isolation**: All sources, tests, questions, and stats are protected by user ownership validation (`user_id`).
