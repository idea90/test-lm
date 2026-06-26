import sqlite3

conn = sqlite3.connect('C:\\Users\\idea\\Downloads\\Code\\test-lm\\test_lm.db')
cursor = conn.cursor()

cursor.execute("SELECT id, created_at, num_questions FROM tests ORDER BY id DESC")
tests = cursor.fetchall()
for t in tests:
    print(f"Test ID: {t[0]}, Created At: {t[1]}, Num Q: {t[2]}")

conn.close()
