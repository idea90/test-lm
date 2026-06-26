import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

import * as db from './db.js';
import * as llm from './services/llm.js';
import * as parser from './services/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

dotenv.config({ path: path.resolve(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
await db.initDb();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for dev
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'test-lm-default-secret-key-123456'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Uploads folders setup
const uploadAvatarFolder = path.join(rootDir, 'uploads', 'avatars');
fs.mkdirSync(uploadAvatarFolder, { recursive: true });

const uploadTempFolder = path.join(rootDir, 'uploads', 'temp');
fs.mkdirSync(uploadTempFolder, { recursive: true });

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Authentication Helpers
function verifyWerkzeugHash(password: string, passwordHash: string): boolean {
  if (passwordHash.startsWith('bcrypt$')) {
    const hash = passwordHash.substring(7);
    return bcrypt.compareSync(password, hash);
  }
  
  if (passwordHash.startsWith('pbkdf2:')) {
    const parts = passwordHash.split('$');
    if (parts.length === 3) {
      const methodParts = parts[0].split(':');
      const algorithm = methodParts[1] || 'sha256';
      const iterations = parseInt(methodParts[2]) || 260000;
      const salt = parts[1];
      const expectedHashHex = parts[2];
      
      const calculatedHash = crypto.pbkdf2Sync(
        password,
        salt,
        iterations,
        expectedHashHex.length / 2,
        algorithm
      );
      return calculatedHash.toString('hex') === expectedHashHex;
    }
  }

  if (passwordHash.startsWith('scrypt:')) {
    const parts = passwordHash.split('$');
    if (parts.length === 3) {
      const methodParts = parts[0].split(':');
      const N = parseInt(methodParts[1]) || 32768;
      const r = parseInt(methodParts[2]) || 8;
      const p = parseInt(methodParts[3]) || 1;
      const salt = parts[1];
      const expectedHashHex = parts[2];

      const calculatedHash = crypto.scryptSync(
        password,
        salt,
        expectedHashHex.length / 2,
        { N, r, p, maxmem: 128 * 1024 * 1024 }
      );
      return calculatedHash.toString('hex') === expectedHashHex;
    }
  }

  try {
    return bcrypt.compareSync(password, passwordHash);
  } catch (e) {
    return password === passwordHash;
  }
}

function hashPassword(password: string): string {
  const hash = bcrypt.hashSync(password, 10);
  return `bcrypt$${hash}`;
}

function getUserId(req: express.Request): number | null {
  return req.session && req.session.user_id ? Number(req.session.user_id) : null;
}

// ─── AUTHENTICATION ROUTES ───────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ" });
  }

  const existing = await db.getUserByUsername(username);
  if (existing) {
    return res.status(400).json({ error: "ຊື່ຜູ້ໃຊ້ນີ້ມີໃນລະບົບແລ້ວ" });
  }

  const passHash = hashPassword(password);
  const userId = await db.createUser(username, passHash);
  if (userId) {
    req.session = { user_id: userId };
    return res.json({ message: "ລົງທະບຽນສຳເລັດ", user_id: userId });
  }
  return res.status(500).json({ error: "ບໍ່ສາມາດລົງທະບຽນໄດ້" });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "ກະລຸນາປ້ອນຊື່ ແລະ ລະຫັດຜ່ານ" });
  }

  const user = await db.getUserByUsername(username);
  if (!user || !verifyWerkzeugHash(password, user.password_hash)) {
    return res.status(401).json({ error: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" });
  }

  req.session = { user_id: user.id };
  return res.json({
    message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
    user: {
      id: user.id,
      username: user.username,
      profile_pic: user.profile_pic
    }
  });
});

app.post('/api/auth/guest', async (req, res) => {
  let userId = getUserId(req);
  if (userId) {
    const user = await db.getUserById(userId);
    if (user) {
      return res.json({
        message: "ເຂົ້າສູ່ລະບົບແຂກສຳເລັດ",
        user: { id: user.id, username: user.username, profile_pic: user.profile_pic }
      });
    }
  }

  // Create auto guest
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const guestUsername = `guest_${randNum}`;
  const passHash = hashPassword(guestUsername);
  // Guest gets 200,000 token limit
  userId = await db.createUser(guestUsername, passHash, 200000);
  if (userId) {
    req.session = { user_id: userId };
    return res.json({
      message: "ເຂົ້າສູ່ລະບົບແຂກສຳເລັດ",
      user: { id: userId, username: guestUsername, profile_pic: null }
    });
  }
  return res.status(500).json({ error: "ບໍ່ສາມາດສ້າງຜູ້ໃຊ້ແຂກໄດ້" });
});

app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  return res.json({ message: "ອອກຈາກລະບົບສຳເລັດ" });
});

app.get('/api/auth/me', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "ບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ" });
  }
  const user = await db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "ບໍ່ພົບຜູ້ໃຊ້ນີ້" });
  }
  return res.json({
    id: user.id,
    username: user.username,
    profile_pic: user.profile_pic
  });
});

app.post('/api/user/profile-pic', upload.single('file'), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const ext = path.extname(req.file.originalname) || '.png';
  const filename = `${userId}_avatar${ext}`;
  const destPath = path.join(uploadAvatarFolder, filename);

  await fs.promises.writeFile(destPath, req.file.buffer);
  await db.updateUserProfilePic(userId, filename);

  return res.json({ message: "ອັບເດດຮູບໂປຣຟາຍສຳເລັດ", profile_pic: filename });
});

app.delete('/api/user/account', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  await db.deleteUserAccount(userId);
  req.session = null;
  return res.json({ message: "ລົບລາຍຊື່ຜູ້ໃຊ້ ແລະ ຂໍ້ມູນທັງໝົດສຳເລັດ" });
});

// ─── SOURCES ROUTES ─────────────────────────────────────────────────────────

app.get('/api/sources', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const list = await db.listSources(userId);
  return res.json(list);
});

app.post('/api/sources/upload', upload.single('file'), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const isWithinLimit = await db.isUserWithinTokenLimit(userId);
  if (!isWithinLimit) {
    return res.status(400).json({ error: "ທ່ານໄດ້ໃຊ້ໂທເຄັນເກີນກຳນົດແລ້ວ (Token limit exceeded)" });
  }

  // Parse options
  const pStart = parseInt(req.body.p_start || req.query.p_start || '1');
  const pEndVal = req.body.p_end || req.query.p_end;
  const pEnd = pEndVal ? parseInt(pEndVal) : null;
  
  const pExcludeVal = req.body.p_exclude || req.query.p_exclude || '';
  const pExclude = pExcludeVal
    ? pExcludeVal.split(',').map((x: string) => parseInt(x.trim())).filter((x: number) => !isNaN(x))
    : [];

  const forceOcr = req.body.force_ocr === 'true' || req.query.force_ocr === 'true' || false;
  const apiKey = req.body.api_key || req.query.api_key;

  const filename = req.file.originalname;
  const fileSize = req.file.size;
  const filenameLower = filename.toLowerCase();

  try {
    let extractedText = "";

    if (filenameLower.endsWith('.pdf')) {
      extractedText = await parser.extractTextFromPdf(req.file.buffer, pStart, pEnd, pExclude, forceOcr);
    } else if (filenameLower.endsWith('.docx')) {
      extractedText = await parser.extractTextFromDocx(req.file.buffer);
    } else {
      extractedText = await parser.extractTextFromImage(req.file.buffer, req.file.mimetype, apiKey);
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ error: "ບໍ່ສາມາດອ່ານຂໍ້ຄວາມຈາກໄຟລ໌ໄດ້ ຫຼື ໄຟລ໌ຫວ່າງເປົ່າ" });
    }

    const metadata = await llm.analyzeDocumentMetadata(extractedText, apiKey);
    const sourceId = await db.addSource(filename, fileSize, extractedText, userId);

    return res.json({
      id: sourceId,
      filename,
      file_size: fileSize,
      message: "ອັບໂຫລດ ແລະ ວິເຄາະບົດຮຽນສຳເລັດ",
      subject: metadata.subject,
      grade: metadata.grade
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: `ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດ: ${err.message}` });
  }
});

app.delete('/api/sources/:source_id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const sourceId = parseInt(req.params.source_id);
  await db.deleteSource(sourceId, userId);
  return res.json({ message: "ລົບບົດຮຽນສຳເລັດ" });
});

app.get('/api/sources/:source_id/preview', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const sourceId = parseInt(req.params.source_id);
  const source = await db.getSource(sourceId, userId);
  if (!source) return res.status(404).json({ error: "Source not found" });

  const text = source.text_content || '';
  const preview = text.substring(0, 1000);
  return res.json({
    id: source.id,
    filename: source.filename,
    preview_text: preview + (text.length > 1000 ? "..." : ""),
    char_count: text.length
  });
});

// ─── TESTS ROUTES ───────────────────────────────────────────────────────────

app.get('/api/tests', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const list = await db.listTests(userId);
  return res.json(list);
});

app.get('/api/tests/:test_id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const testId = parseInt(req.params.test_id);
  const test = await db.getTest(testId, userId);
  if (!test) return res.status(404).json({ error: "Test not found" });
  return res.json(test);
});

app.delete('/api/tests/:test_id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const testId = parseInt(req.params.test_id);
  const success = await db.deleteTest(testId, userId);
  if (success) {
    return res.json({ message: "ລົບຫົວບົດສອບເສັງສຳເລັດ" });
  }
  return res.status(404).json({ error: "Test not found" });
});

app.put('/api/tests/:test_id/rich_text', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const testId = parseInt(req.params.test_id);
  const { rich_text_content } = req.body;
  const success = await db.updateTestRichText(testId, userId, rich_text_content);
  if (success) {
    return res.json({ message: "ອັບເດດເນື້ອຫາ Rich Text ສຳເລັດ" });
  }
  return res.status(404).json({ error: "Test not found" });
});

app.get('/api/system-prompts', (req, res) => {
  const promptsDir = path.join(rootDir, 'system-prompt-lao');
  if (!fs.existsSync(promptsDir)) {
    return res.json([]);
  }
  const files = fs.readdirSync(promptsDir);
  const list = files
    .filter((f) => f.endsWith('.txt'))
    .map((f) => f.substring(0, f.length - 4));
  return res.json(list);
});

app.post('/api/tests/generate', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const isWithinLimit = await db.isUserWithinTokenLimit(userId);
  if (!isWithinLimit) {
    return res.status(400).json({ error: "ທ່ານໄດ້ໃຊ້ໂທເຄັນເກີນກຳນົດແລ້ວ (Token limit exceeded)" });
  }

  const {
    source_ids,
    question_type: questionType = 'multiple_choice',
    difficulty = 'medium',
    custom_instructions = '',
    num_options: numOptions = 4,
    language = 'lao',
    shuffle_options = false,
    model = 'gemini-2.5-flash',
    api_key
  } = req.body;

  let numObjective = req.body.num_objective !== undefined ? parseInt(req.body.num_objective) : undefined;
  let numSubjective = req.body.num_subjective !== undefined ? parseInt(req.body.num_subjective) : undefined;

  let numQuestions = 10;
  if (questionType === 'mixed' && numObjective !== undefined && numSubjective !== undefined) {
    numQuestions = numObjective + numSubjective;
  } else {
    numQuestions = parseInt(req.body.num_questions || '10');
  }

  // Load custom system prompt if name provided
  let instructionsMerged = custom_instructions;
  const systemPromptName = req.body.system_prompt;
  if (systemPromptName && systemPromptName !== 'default') {
    const promptPath = path.join(rootDir, 'system-prompt-lao', `${systemPromptName}.txt`);
    if (fs.existsSync(promptPath)) {
      const sysContent = fs.readFileSync(promptPath, 'utf-8');
      instructionsMerged = instructionsMerged ? `${sysContent}\n\nUser Custom Instructions:\n${instructionsMerged}` : sysContent;
    }
  }

  const apiKeys: Record<string, string> = req.body.api_keys || {};
  if (api_key) apiKeys.gemini = api_key;

  try {
    let combinedText = "";
    for (const sid of source_ids) {
      const source = await db.getSource(sid, userId);
      if (source) {
        combinedText += `--- ຂໍ້ມູນຈາກໄຟລ໌: ${source.filename} ---\n${source.text_content}\n\n`;
      }
    }

    if (!combinedText) {
      return res.status(404).json({ error: "ບໍ່ພົບບົດຮຽນທີ່ເລືອກ" });
    }

    const { data: geminiResponse, tokenCount } = await llm.generateTestQuestions({
      modelName: model,
      contextText: combinedText,
      numQuestions,
      difficultyLao: difficulty,
      questionType,
      customInstructions: instructionsMerged,
      numOptions,
      language,
      apiKeys,
      numObjective,
      numSubjective
    });

    await db.incrementTokenUsage(userId, tokenCount);

    // Shuffle options if requested
    if (shuffle_options && (questionType === 'multiple_choice' || questionType === 'mixed')) {
      for (const q of geminiResponse.questions || []) {
        const isSubj = q.option_a === '' && q.option_b === '' && q.option_c === '' && q.option_d === '';
        if (isSubj) continue;

        const options = [
          { k: 'A', v: q.option_a || '' },
          { k: 'B', v: q.option_b || '' },
          { k: 'C', v: q.option_c || '' },
          { k: 'D', v: q.option_d || '' }
        ];
        const correctKey = q.correct_option;
        const correctText = options.find(o => o.k === correctKey)?.v || '';
        
        // Shuffle
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        q.option_a = options[0].v;
        q.option_b = options[1].v;
        q.option_c = options[2].v;
        q.option_d = options[3].v;

        // Find new correct option letter
        const newCorrectIdx = options.findIndex(o => o.v === correctText);
        q.correct_option = ['A', 'B', 'C', 'D'][newCorrectIdx !== -1 ? newCorrectIdx : 0];
      }
    }

    // Save test to db
    const testId = await db.createTest(
      geminiResponse.title || 'ຫົວບົດສອບເສັງ',
      difficulty,
      numQuestions,
      source_ids[0],
      geminiResponse.questions || [],
      userId
    );

    return res.json({
      test_id: testId,
      title: geminiResponse.title,
      questions: geminiResponse.questions,
      token_count: tokenCount
    });
  } catch (err: any) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: `ເກີດຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ສອບ: ${err.message}` });
  }
});

// ─── QUESTIONS ROUTES ───────────────────────────────────────────────────────

app.put('/api/questions/:question_id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const qId = parseInt(req.params.question_id);
  const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

  const success = await db.updateQuestion(
    qId,
    question_text,
    option_a || '',
    option_b || '',
    option_c || '',
    option_d || '',
    correct_option || 'A',
    explanation || '',
    userId
  );

  if (success) {
    return res.json({ message: "ອັບເດດຂໍ້ສອບສຳເລັດ" });
  }
  return res.status(404).json({ error: "Question not found" });
});

app.delete('/api/questions/:question_id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const qId = parseInt(req.params.question_id);
  await db.deleteQuestion(qId, userId);
  return res.json({ message: "ລົບຂໍ້ສອບສຳເລັດ" });
});

app.post('/api/questions', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
  const qId = await db.addQuestion(
    parseInt(test_id),
    question_text,
    option_a || '',
    option_b || '',
    option_c || '',
    option_d || '',
    correct_option || 'A',
    explanation || '',
    userId
  );

  if (qId !== null) {
    return res.json({ id: qId, message: "ເພີ່ມຂໍ້ສອບສຳເລັດ" });
  }
  return res.status(404).json({ error: "Test not found" });
});

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

app.get('/api/dashboard/stats', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const stats = await db.getDashboardStats(userId);
  return res.json(stats);
});

// ─── EXPORT DOCX ────────────────────────────────────────────────────────────

app.all('/api/tests/:test_id/export/docx', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const testId = parseInt(req.params.test_id);
  const test = await db.getTest(testId, userId);
  if (!test) return res.status(404).json({ error: "Test not found" });

  const getParam = (name: string) => req.query[name] || req.body[name];

  try {
    const buffer = await parser.generateDocxFile({
      testData: test,
      school: getParam('school') as string,
      subject: getParam('subject') as string,
      motto: getParam('motto') as string,
      grade: getParam('grade') as string,
      watermark: getParam('watermark') as string,
      examNo: getParam('exam_no') as string,
      timeLimit: getParam('time_limit') as string
    });

    res.setHeader('Content-Disposition', `attachment; filename="test_${testId}.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    return res.send(buffer);
  } catch (err: any) {
    console.error("Export docx error:", err);
    return res.status(500).json({ error: `Export failed: ${err.message}` });
  }
});

// ─── CHAT ROUTE ─────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { chat_history, new_message, source_ids, model = 'gemini-2.5-flash', api_key } = req.body;
  if (!new_message) return res.status(400).json({ error: "Message is required" });

  const apiKeys: Record<string, string> = req.body.api_keys || {};
  if (api_key) apiKeys.gemini = api_key;

  try {
    let combinedText = "";
    if (source_ids && Array.isArray(source_ids)) {
      for (const sid of source_ids) {
        const source = await db.getSource(sid, userId);
        if (source) {
          combinedText += `--- ຂໍ້ມູນຈາກໄຟລ໌: {source.filename} ---\n${source.text_content}\n\n`;
        }
      }
    }

    const reply = await llm.generateChatResponse({
      chatHistory: chat_history || [],
      newMessage: new_message,
      contextText: combinedText,
      apiKeys,
      modelName: model
    });

    return res.json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: `ເກີດຂໍ້ຜິດພາດ: ${err.message}` });
  }
});

// ─── STATIC PIC & STATIC SITE SERVING ────────────────────────────────────────

app.use('/uploads/avatars', express.static(uploadAvatarFolder));

// Serve Vite frontend build (production mode)
const clientBuildPath = path.join(rootDir, 'frontend', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    // Only serve index.html for non-api routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
} else {
  // If not built, just print warning
  app.get('/', (req, res) => {
    res.send("Backend running. Serve client from Vite dev server.");
  });
}

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
