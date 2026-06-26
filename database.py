import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'test_lm.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db_connection()
    # Set WAL mode once during initialization to avoid locking issues
    conn.execute("PRAGMA journal_mode = WAL")
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_tokens_used INTEGER DEFAULT 0,
            token_limit INTEGER DEFAULT 500000,
            profile_pic TEXT
        )
    ''')
    
    # Sources table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_size INTEGER,
            text_content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    # Tests table
    cursor.execute('''
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
    ''')
    
    # Questions table
    cursor.execute('''
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
    ''')
    
    # Migrate sources table if needed
    cursor.execute("PRAGMA table_info(sources)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'user_id' not in columns:
        cursor.execute("ALTER TABLE sources ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE")
        
    # Migrate tests table if needed
    cursor.execute("PRAGMA table_info(tests)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'user_id' not in columns:
        cursor.execute("ALTER TABLE tests ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE")
    if 'rich_text_content' not in columns:
        cursor.execute("ALTER TABLE tests ADD COLUMN rich_text_content TEXT")
        
    # Migrate users table if needed
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'total_tokens_used' not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN total_tokens_used INTEGER DEFAULT 0")
    if 'token_limit' not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN token_limit INTEGER DEFAULT 500000")
    if 'profile_pic' not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN profile_pic TEXT")
        
    conn.commit()
    conn.close()

# User management
def create_user(username, password_hash, token_limit=500000):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check user count for legacy migration
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute(
            "INSERT INTO users (username, password_hash, token_limit) VALUES (?, ?, ?)",
            (username, password_hash, token_limit)
        )
        user_id = cursor.lastrowid
        
        # If this is the first user, migrate legacy sources and tests to them
        if user_count == 0:
            cursor.execute("UPDATE sources SET user_id = ? WHERE user_id IS NULL", (user_id,))
            cursor.execute("UPDATE tests SET user_id = ? WHERE user_id IS NULL", (user_id,))
            
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def get_user_by_username(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_profile_pic(user_id, profile_pic):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET profile_pic = ? WHERE id = ?", (profile_pic, user_id))
    conn.commit()
    conn.close()

def delete_user_account(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Delete sources and tests (and cascade handles the rest)
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

def increment_token_usage(user_id, tokens):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET total_tokens_used = total_tokens_used + ? WHERE id = ?", (tokens, user_id))
    conn.commit()
    conn.close()

def is_user_within_token_limit(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT total_tokens_used, token_limit FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row['total_tokens_used'] < row['token_limit']
    return True

# Source management
def add_source(filename, file_size, text_content, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sources (filename, file_size, text_content, user_id) VALUES (?, ?, ?, ?)",
        (filename, file_size, text_content, user_id)
    )
    source_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return source_id

def list_sources(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, filename, file_size, created_at FROM sources WHERE user_id = ? ORDER BY created_at DESC", 
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_source(source_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sources WHERE id = ? AND user_id = ?", (source_id, user_id))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_source(source_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Delete all tests (and their questions) linked to this source
    cursor.execute("SELECT id FROM tests WHERE source_id = ? AND user_id = ?", (source_id, user_id))
    test_ids = [row[0] for row in cursor.fetchall()]
    for tid in test_ids:
        cursor.execute("DELETE FROM questions WHERE test_id = ?", (tid,))
    cursor.execute("DELETE FROM tests WHERE source_id = ? AND user_id = ?", (source_id, user_id))
    cursor.execute("DELETE FROM sources WHERE id = ? AND user_id = ?", (source_id, user_id))
    conn.commit()
    conn.close()

# Test management
def create_test(title, difficulty, num_questions, source_id, questions, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # First verify the source belongs to the user
        cursor.execute("SELECT id FROM sources WHERE id = ? AND user_id = ?", (source_id, user_id))
        if not cursor.fetchone():
            raise ValueError("Unauthorized source selection")
            
        cursor.execute(
            "INSERT INTO tests (title, difficulty, num_questions, source_id, user_id) VALUES (?, ?, ?, ?, ?)",
            (title, difficulty, num_questions, source_id, user_id)
        )
        test_id = cursor.lastrowid
        
        for q in questions:
            cursor.execute(
                """INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (test_id, q['question_text'], q['option_a'], q['option_b'], q['option_c'], q['option_d'], q['correct_option'], q['explanation'])
            )
        conn.commit()
        return test_id
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def list_tests(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.id, t.title, t.difficulty, t.num_questions, t.source_id, t.created_at, s.filename as source_filename
        FROM tests t
        LEFT JOIN sources s ON t.source_id = s.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_test(test_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.id, t.title, t.difficulty, t.num_questions, t.source_id, t.rich_text_content, t.created_at, s.filename as source_filename
        FROM tests t
        LEFT JOIN sources s ON t.source_id = s.id
        WHERE t.id = ? AND t.user_id = ?
    """, (test_id, user_id))
    test_row = cursor.fetchone()
    if not test_row:
        conn.close()
        return None
    
    test_data = dict(test_row)
    
    cursor.execute("SELECT * FROM questions WHERE test_id = ?", (test_id,))
    question_rows = cursor.fetchall()
    test_data['questions'] = [dict(row) for row in question_rows]
    
    conn.close()
    return test_data

def delete_test(test_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Verify ownership first
    cursor.execute("SELECT id FROM tests WHERE id = ? AND user_id = ?", (test_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return False
    # Explicitly delete child questions first (safety net if FK cascade is off)
    cursor.execute("DELETE FROM questions WHERE test_id = ?", (test_id,))
    cursor.execute("DELETE FROM tests WHERE id = ? AND user_id = ?", (test_id, user_id))
    conn.commit()
    conn.close()
    return True

def update_test_rich_text(test_id, user_id, rich_text_content):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE tests SET rich_text_content = ? WHERE id = ? AND user_id = ?",
        (rich_text_content, test_id, user_id)
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

# Question management
def update_question(question_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Verify the question belongs to a test owned by this user
    if user_id:
        cursor.execute("""
            SELECT q.id FROM questions q
            JOIN tests t ON q.test_id = t.id
            WHERE q.id = ? AND t.user_id = ?
        """, (question_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False
    cursor.execute(
        """UPDATE questions 
           SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, explanation = ?
           WHERE id = ?""",
        (question_text, option_a, option_b, option_c, option_d, correct_option, explanation, question_id)
    )
    conn.commit()
    conn.close()
    return True

def delete_question(question_id, user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verify ownership
    if user_id:
        cursor.execute("""
            SELECT q.test_id FROM questions q
            JOIN tests t ON q.test_id = t.id
            WHERE q.id = ? AND t.user_id = ?
        """, (question_id, user_id))
    else:
        cursor.execute("SELECT test_id FROM questions WHERE id = ?", (question_id,))
    row = cursor.fetchone()
    if row:
        test_id = row[0]
        cursor.execute("DELETE FROM questions WHERE id = ?", (question_id,))
        cursor.execute("UPDATE tests SET num_questions = (SELECT COUNT(*) FROM questions WHERE test_id = ?) WHERE id = ?", (test_id, test_id))
    
    conn.commit()
    conn.close()

def add_question(test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Verify the test belongs to the user
    if user_id:
        cursor.execute("SELECT id FROM tests WHERE id = ? AND user_id = ?", (test_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return None
    cursor.execute(
        """INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
    )
    q_id = cursor.lastrowid
    cursor.execute("UPDATE tests SET num_questions = (SELECT COUNT(*) FROM questions WHERE test_id = ?) WHERE id = ?", (test_id, test_id))
    conn.commit()
    conn.close()
    return q_id

def get_dashboard_stats(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 0. User limits
    cursor.execute("SELECT total_tokens_used, token_limit FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    total_tokens_used = user_row['total_tokens_used'] if user_row else 0
    token_limit = user_row['token_limit'] if user_row else 500000
    
    # 1. General counts
    cursor.execute("SELECT COUNT(*) FROM sources WHERE user_id = ?", (user_id,))
    total_sources = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM tests WHERE user_id = ?", (user_id,))
    total_tests = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(q.id) 
        FROM questions q
        JOIN tests t ON q.test_id = t.id
        WHERE t.user_id = ?
    """, (user_id,))
    total_questions = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(file_size) FROM sources WHERE user_id = ?", (user_id,))
    total_file_size = cursor.fetchone()[0] or 0
    
    # 2. Difficulty breakdown (easy, medium, hard)
    cursor.execute("""
        SELECT difficulty, COUNT(*) as count 
        FROM tests 
        WHERE user_id = ?
        GROUP BY difficulty
    """, (user_id,))
    difficulty_rows = cursor.fetchall()
    difficulty_breakdown = {"easy": 0, "medium": 0, "hard": 0}
    for row in difficulty_rows:
        diff = row['difficulty'].lower()
        if diff in difficulty_breakdown:
            difficulty_breakdown[diff] = row['count']
            
    # 3. Correct option distribution (A, B, C, D)
    cursor.execute("""
        SELECT q.correct_option, COUNT(*) as count 
        FROM questions q
        JOIN tests t ON q.test_id = t.id
        WHERE t.user_id = ?
        GROUP BY q.correct_option
    """, (user_id,))
    option_rows = cursor.fetchall()
    correct_option_breakdown = {"A": 0, "B": 0, "C": 0, "D": 0}
    for row in option_rows:
        opt = row['correct_option'].upper()
        if opt in correct_option_breakdown:
            correct_option_breakdown[opt] = row['count']
            
    # 4. Detailed statistics for each lesson source file
    cursor.execute("""
        SELECT s.id, s.filename, s.file_size, s.created_at, LENGTH(s.text_content) as char_count,
               COUNT(t.id) as test_count, COALESCE(SUM(t.num_questions), 0) as total_questions
        FROM sources s
        LEFT JOIN tests t ON s.id = t.source_id
        WHERE s.user_id = ?
        GROUP BY s.id
        ORDER BY s.created_at DESC
    """, (user_id,))
    sources_rows = cursor.fetchall()
    sources_stats = [dict(row) for row in sources_rows]
    
    # 5. Chronological list of the 5 most recent tests generated
    cursor.execute("""
        SELECT t.id, t.title, t.difficulty, t.num_questions, t.created_at, s.filename as source_filename
        FROM tests t
        LEFT JOIN sources s ON t.source_id = s.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT 5
    """, (user_id,))
    recent_tests_rows = cursor.fetchall()
    recent_tests = [dict(row) for row in recent_tests_rows]
    
    conn.close()
    
    return {
        "total_tokens_used": total_tokens_used,
        "token_limit": token_limit,
        "total_sources": total_sources,
        "total_tests": total_tests,
        "total_questions": total_questions,
        "total_file_size": total_file_size,
        "difficulty_breakdown": difficulty_breakdown,
        "correct_option_breakdown": correct_option_breakdown,
        "sources_stats": sources_stats,
        "recent_tests": recent_tests
    }
