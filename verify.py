import sys
import os

print("=== Verifying Test LM Application ===")

try:
    import fastapi
    print("[OK] FastAPI package imported successfully.")
except ImportError:
    print("[FAIL] FastAPI package import FAILED.")
    sys.exit(1)

try:
    import google.genai
    print("[OK] google-genai package imported successfully.")
except ImportError:
    print("[FAIL] google-genai package import FAILED.")
    sys.exit(1)

try:
    import docx
    print("[OK] python-docx package imported successfully.")
except ImportError:
    print("[FAIL] python-docx package import FAILED.")
    sys.exit(1)

try:
    import pypdf
    print("[OK] pypdf package imported successfully.")
except ImportError:
    print("[FAIL] pypdf package import FAILED.")
    sys.exit(1)

try:
    import database
    database.init_db()
    print("[OK] database module imported and initialized successfully.")
    
    # Check tables in SQLite
    import sqlite3
    conn = sqlite3.connect(database.DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    expected_tables = ['sources', 'tests', 'questions']
    for t in expected_tables:
        if t in tables:
            print(f"  - Table '{t}' verified.")
        else:
            print(f"  - Table '{t}' MISSING.")
            sys.exit(1)
            
except Exception as e:
    print(f"[FAIL] Database verification FAILED: {e}")
    sys.exit(1)

try:
    import gemini_helper
    print("[OK] gemini_helper module imported successfully.")
except Exception as e:
    print(f"[FAIL] gemini_helper import FAILED: {e}")
    sys.exit(1)

print("\n[OK] All backend code files, imports, and database structures verified successfully!")

