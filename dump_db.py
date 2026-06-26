import sqlite3
import json

conn = sqlite3.connect('C:\\Users\\idea\\Downloads\\Code\\test-lm\\test_lm.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT * FROM tests ORDER BY id DESC LIMIT 1")
test = cursor.fetchone()
if test:
    print(f"Latest test ID: {test['id']}, num_questions: {test['num_questions']}")
    cursor.execute("SELECT * FROM questions WHERE test_id = ?", (test['id'],))
    questions = [dict(r) for r in cursor.fetchall()]
    
    # Save as JSON to avoid Windows console encoding errors
    with open('C:\\Users\\idea\\Downloads\\Code\\test-lm\\latest_test.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("Saved latest_test.json")
else:
    print("No tests found.")

conn.close()
