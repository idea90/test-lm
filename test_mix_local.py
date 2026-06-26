import sys
import os
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from llm_helper import generate_test_questions

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

    for i, q in enumerate(data['questions']):
        print(f"Q{i}: A='{q.get('option_a')}' B='{q.get('option_b')}'")

except Exception as e:
    print("Error:", e)
