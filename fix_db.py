import sqlite3

conn = sqlite3.connect('C:\\Users\\idea\\Downloads\\Code\\test-lm\\test_lm.db')
cursor = conn.cursor()

# Get the last 5 questions of test_id = 2
cursor.execute("SELECT id FROM questions WHERE test_id = 2 ORDER BY id ASC")
questions = cursor.fetchall()

if len(questions) == 10:
    q_to_blank = questions[5:]  # the last 5 questions
    for q in q_to_blank:
        cursor.execute("""
            UPDATE questions 
            SET option_a = '', option_b = '', option_c = '', option_d = '' 
            WHERE id = ?
        """, (q[0],))
        print(f"Blanked options for question ID {q[0]}")
    conn.commit()
    print("Database updated successfully.")
else:
    print(f"Expected 10 questions, found {len(questions)}")

conn.close()
