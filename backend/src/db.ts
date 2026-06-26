import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../test_lm.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
  } else {
    db.run("PRAGMA journal_mode = WAL");
  }
});

// Helper functions for Promise-based queries
export function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export async function initDb(): Promise<void> {
  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_tokens_used INTEGER DEFAULT 0,
      token_limit INTEGER DEFAULT 500000,
      profile_pic TEXT
    )
  `);

  // Sources table
  await run(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      file_size INTEGER,
      text_content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tests table
  await run(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      num_questions INTEGER NOT NULL,
      source_id INTEGER,
      rich_text_content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      FOREIGN KEY(source_id) REFERENCES sources(id) ON DELETE SET NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Questions table
  await run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE
    )
  `);

  // Run migrations if needed
  try {
    const sourceCols = await query("PRAGMA table_info(sources)");
    const sourceColNames = sourceCols.map((c) => c.name);
    if (!sourceColNames.includes('user_id')) {
      await run("ALTER TABLE sources ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE");
    }

    const testCols = await query("PRAGMA table_info(tests)");
    const testColNames = testCols.map((c) => c.name);
    if (!testColNames.includes('user_id')) {
      await run("ALTER TABLE tests ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE");
    }
    if (!testColNames.includes('rich_text_content')) {
      await run("ALTER TABLE tests ADD COLUMN rich_text_content TEXT");
    }

    const userCols = await query("PRAGMA table_info(users)");
    const userColNames = userCols.map((c) => c.name);
    if (!userColNames.includes('total_tokens_used')) {
      await run("ALTER TABLE users ADD COLUMN total_tokens_used INTEGER DEFAULT 0");
    }
    if (!userColNames.includes('token_limit')) {
      await run("ALTER TABLE users ADD COLUMN token_limit INTEGER DEFAULT 500000");
    }
    if (!userColNames.includes('profile_pic')) {
      await run("ALTER TABLE users ADD COLUMN profile_pic TEXT");
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

// User Management
export async function createUser(username: string, passwordHash: string, tokenLimit = 500000): Promise<number | null> {
  try {
    const userCountRow = await get("SELECT COUNT(*) as count FROM users");
    const userCount = userCountRow ? userCountRow.count : 0;

    const result = await run(
      "INSERT INTO users (username, password_hash, token_limit) VALUES (?, ?, ?)",
      [username, passwordHash, tokenLimit]
    );
    const userId = result.lastID;

    // Legacy migration for first user
    if (userCount === 0) {
      await run("UPDATE sources SET user_id = ? WHERE user_id IS NULL", [userId]);
      await run("UPDATE tests SET user_id = ? WHERE user_id IS NULL", [userId]);
    }
    return userId;
  } catch (err) {
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<any | null> {
  const row = await get("SELECT * FROM users WHERE username = ?", [username]);
  return row || null;
}

export async function getUserById(userId: number): Promise<any | null> {
  const row = await get("SELECT * FROM users WHERE id = ?", [userId]);
  return row || null;
}

export async function updateUserProfilePic(userId: number, profilePic: string): Promise<void> {
  await run("UPDATE users SET profile_pic = ? WHERE id = ?", [profilePic, userId]);
}

export async function deleteUserAccount(userId: number): Promise<void> {
  await run("DELETE FROM users WHERE id = ?", [userId]);
}

export async function incrementTokenUsage(userId: number, tokens: number): Promise<void> {
  await run("UPDATE users SET total_tokens_used = total_tokens_used + ? WHERE id = ?", [tokens, userId]);
}

export async function isUserWithinTokenLimit(userId: number): Promise<boolean> {
  const row = await get("SELECT total_tokens_used, token_limit FROM users WHERE id = ?", [userId]);
  if (row) {
    return row.total_tokens_used < row.token_limit;
  }
  return true;
}

// Source Management
export async function addSource(filename: string, fileSize: number, textContent: string, userId: number): Promise<number> {
  const result = await run(
    "INSERT INTO sources (filename, file_size, text_content, user_id) VALUES (?, ?, ?, ?)",
    [filename, fileSize, textContent, userId]
  );
  return result.lastID;
}

export async function listSources(userId: number): Promise<any[]> {
  return query(
    "SELECT id, filename, file_size, created_at FROM sources WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
}

export async function getSource(sourceId: number, userId: number): Promise<any | null> {
  const row = await get("SELECT * FROM sources WHERE id = ? AND user_id = ?", [sourceId, userId]);
  return row || null;
}

export async function deleteSource(sourceId: number, userId: number): Promise<void> {
  const testRows = await query("SELECT id FROM tests WHERE source_id = ? AND user_id = ?", [sourceId, userId]);
  const testIds = testRows.map((r) => r.id);
  for (const tid of testIds) {
    await run("DELETE FROM questions WHERE test_id = ?", [tid]);
  }
  await run("DELETE FROM tests WHERE source_id = ? AND user_id = ?", [sourceId, userId]);
  await run("DELETE FROM sources WHERE id = ? AND user_id = ?", [sourceId, userId]);
}

// Test Management
export async function createTest(
  title: string,
  difficulty: string,
  numQuestions: number,
  sourceId: number,
  questions: any[],
  userId: number
): Promise<number> {
  // First verify the source belongs to the user
  const sourceCheck = await get("SELECT id FROM sources WHERE id = ? AND user_id = ?", [sourceId, userId]);
  if (!sourceCheck) {
    throw new Error("Unauthorized source selection");
  }

  // Create test
  const result = await run(
    "INSERT INTO tests (title, difficulty, num_questions, source_id, user_id) VALUES (?, ?, ?, ?, ?)",
    [title, difficulty, numQuestions, sourceId, userId]
  );
  const testId = result.lastID;

  // Insert questions
  for (const q of questions) {
    await run(
      `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId,
        q.question_text,
        q.option_a || '',
        q.option_b || '',
        q.option_c || '',
        q.option_d || '',
        q.correct_option || 'A',
        q.explanation || ''
      ]
    );
  }
  return testId;
}

export async function listTests(userId: number): Promise<any[]> {
  return query(`
    SELECT t.id, t.title, t.difficulty, t.num_questions, t.source_id, t.created_at, s.filename as source_filename
    FROM tests t
    LEFT JOIN sources s ON t.source_id = s.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `, [userId]);
}

export async function getTest(testId: number, userId: number): Promise<any | null> {
  const testRow = await get(`
    SELECT t.id, t.title, t.difficulty, t.num_questions, t.source_id, t.rich_text_content, t.created_at, s.filename as source_filename
    FROM tests t
    LEFT JOIN sources s ON t.source_id = s.id
    WHERE t.id = ? AND t.user_id = ?
  `, [testId, userId]);

  if (!testRow) return null;

  const questions = await query("SELECT * FROM questions WHERE test_id = ?", [testId]);
  return {
    ...testRow,
    questions
  };
}

export async function deleteTest(testId: number, userId: number): Promise<boolean> {
  const check = await get("SELECT id FROM tests WHERE id = ? AND user_id = ?", [testId, userId]);
  if (!check) return false;

  await run("DELETE FROM questions WHERE test_id = ?", [testId]);
  await run("DELETE FROM tests WHERE id = ? AND user_id = ?", [testId, userId]);
  return true;
}

export async function updateTestRichText(testId: number, userId: number, richTextContent: string): Promise<boolean> {
  const result = await run(
    "UPDATE tests SET rich_text_content = ? WHERE id = ? AND user_id = ?",
    [richTextContent, testId, userId]
  );
  return result.changes > 0;
}

// Question Management
export async function updateQuestion(
  questionId: number,
  qText: string,
  optA: string,
  optB: string,
  optC: string,
  optD: string,
  correctOpt: string,
  explanation: string,
  userId?: number
): Promise<boolean> {
  if (userId) {
    const verify = await get(`
      SELECT q.id FROM questions q
      JOIN tests t ON q.test_id = t.id
      WHERE q.id = ? AND t.user_id = ?
    `, [questionId, userId]);
    if (!verify) return false;
  }

  await run(`
    UPDATE questions 
    SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, explanation = ?
    WHERE id = ?
  `, [qText, optA, optB, optC, optD, correctOpt, explanation, questionId]);
  return true;
}

export async function deleteQuestion(questionId: number, userId?: number): Promise<void> {
  let row;
  if (userId) {
    row = await get(`
      SELECT q.test_id FROM questions q
      JOIN tests t ON q.test_id = t.id
      WHERE q.id = ? AND t.user_id = ?
    `, [questionId, userId]);
  } else {
    row = await get("SELECT test_id FROM questions WHERE id = ?", [questionId]);
  }

  if (row) {
    const testId = row.test_id;
    await run("DELETE FROM questions WHERE id = ?", [questionId]);
    
    // Update question count in test
    const countRow = await get("SELECT COUNT(*) as count FROM questions WHERE test_id = ?", [testId]);
    const newCount = countRow ? countRow.count : 0;
    await run("UPDATE tests SET num_questions = ? WHERE id = ?", [newCount, testId]);
  }
}

export async function addQuestion(
  testId: number,
  qText: string,
  optA: string,
  optB: string,
  optC: string,
  optD: string,
  correctOpt: string,
  explanation: string,
  userId?: number
): Promise<number | null> {
  if (userId) {
    const verify = await get("SELECT id FROM tests WHERE id = ? AND user_id = ?", [testId, userId]);
    if (!verify) return null;
  }

  const result = await run(`
    INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [testId, qText, optA, optB, optC, optD, correctOpt, explanation]);
  const qId = result.lastID;

  // Update question count in test
  const countRow = await get("SELECT COUNT(*) as count FROM questions WHERE test_id = ?", [testId]);
  const newCount = countRow ? countRow.count : 0;
  await run("UPDATE tests SET num_questions = ? WHERE id = ?", [newCount, testId]);

  return qId;
}

export async function getDashboardStats(userId: number): Promise<any> {
  const userRow = await get("SELECT total_tokens_used, token_limit FROM users WHERE id = ?", [userId]);
  const totalTokensUsed = userRow ? userRow.total_tokens_used : 0;
  const tokenLimit = userRow ? userRow.token_limit : 500000;

  const sourcesCountRow = await get("SELECT COUNT(*) as count FROM sources WHERE user_id = ?", [userId]);
  const totalSources = sourcesCountRow ? sourcesCountRow.count : 0;

  const testsCountRow = await get("SELECT COUNT(*) as count FROM tests WHERE user_id = ?", [userId]);
  const totalTests = testsCountRow ? testsCountRow.count : 0;

  const questionsCountRow = await get(`
    SELECT COUNT(q.id) as count 
    FROM questions q
    JOIN tests t ON q.test_id = t.id
    WHERE t.user_id = ?
  `, [userId]);
  const totalQuestions = questionsCountRow ? questionsCountRow.count : 0;

  const fileSizeRow = await get("SELECT SUM(file_size) as sum FROM sources WHERE user_id = ?", [userId]);
  const totalFileSize = fileSizeRow ? (fileSizeRow.sum || 0) : 0;

  // Difficulty breakdown
  const difficultyRows = await query(`
    SELECT difficulty, COUNT(*) as count 
    FROM tests 
    WHERE user_id = ?
    GROUP BY difficulty
  `, [userId]);
  const difficultyBreakdown: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  for (const r of difficultyRows) {
    const diff = r.difficulty.toLowerCase();
    if (diff in difficultyBreakdown) {
      difficultyBreakdown[diff] = r.count;
    }
  }

  // Correct option distribution
  const optionRows = await query(`
    SELECT q.correct_option, COUNT(*) as count 
    FROM questions q
    JOIN tests t ON q.test_id = t.id
    WHERE t.user_id = ?
    GROUP BY q.correct_option
  `, [userId]);
  const correctOptionBreakdown: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of optionRows) {
    const opt = r.correct_option.toUpperCase();
    if (opt in correctOptionBreakdown) {
      correctOptionBreakdown[opt] = r.count;
    }
  }

  // Detailed stats for sources
  const sourcesStats = await query(`
    SELECT s.id, s.filename, s.file_size, s.created_at, LENGTH(s.text_content) as char_count,
           COUNT(t.id) as test_count, COALESCE(SUM(t.num_questions), 0) as total_questions
    FROM sources s
    LEFT JOIN tests t ON s.id = t.source_id
    WHERE s.user_id = ?
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `, [userId]);

  // Recent tests
  const recentTests = await query(`
    SELECT t.id, t.title, t.difficulty, t.num_questions, t.created_at, s.filename as source_filename
    FROM tests t
    LEFT JOIN sources s ON t.source_id = s.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT 5
  `, [userId]);

  return {
    total_tokens_used: totalTokensUsed,
    token_limit: tokenLimit,
    total_sources: totalSources,
    total_tests: totalTests,
    total_questions: totalQuestions,
    total_file_size: totalFileSize,
    difficulty_breakdown: difficultyBreakdown,
    correct_option_breakdown: correctOptionBreakdown,
    sources_stats: sourcesStats,
    recent_tests: recentTests
  };
}
