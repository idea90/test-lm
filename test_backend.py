import sys
import os
import json
import sqlite3
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from llm_helper import generate_test_questions
import database

context = "ປະຫວັດສາດລາວ: ເຈົ້າຟ້າງຸ່ມໄດ້ທ້ອນໂຮມອານາຈັກລ້ານຊ້າງໃນປີ ຄ.ສ 1353."

try:
    data, tokens = generate_test_questions(
        model_name="gemini-2.5-flash",
        context_text=context,
        num_questions=4,
        difficulty_lao="easy",
        question_type="mixed",
        language="lao"
    )

    print("Generated data questions:")
    for i, q in enumerate(data['questions']):
        print(f"Q{i}: option_a='{q.get('option_a')}'")

    # Insert into DB just like app.py
    test_id = database.create_test(
        title=data.get('title', 'Test'),
        difficulty='easy',
        num_questions=4,
        source_id=1,
        questions=data['questions'],
        user_id=1
    )
    print(f"Inserted as test_id {test_id}")
    
except Exception as e:
    print("Error:", e)
