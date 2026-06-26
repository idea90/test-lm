import sqlite3

conn = sqlite3.connect('C:\\Users\\idea\\Downloads\\Code\\test-lm\\test_lm.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get the latest test
cursor.execute("SELECT * FROM tests ORDER BY id DESC LIMIT 1")
test = cursor.fetchone()
if test:
    print(f"Latest test ID: {test['id']}, num_questions: {test['num_questions']}")
    cursor.execute("SELECT * FROM questions WHERE test_id = ?", (test['id'],))
    questions = cursor.fetchall()
    for q in questions:
        print(f"Q{q['id']}: option_a='{q['option_a']}' option_b='{q['option_b']}'")
else:
    print("No tests found.")

conn.close()
