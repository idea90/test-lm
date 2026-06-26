import sys
import os
import json

# Add current dir to path to import llm_helper
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from llm_helper import generate_test_questions

context = "ປະຫວັດສາດລາວ: ເຈົ້າຟ້າງຸ່ມໄດ້ທ້ອນໂຮມອານາຈັກລ້ານຊ້າງໃນປີ ຄ.ສ 1353. ເພິ່ນໄດ້ນຳເອົາພະບາງມາຈາກກຳປູເຈຍ."

try:
    data, tokens = generate_test_questions(
        model_name="gemini-2.5-flash",
        context_text=context,
        num_questions=4,
        difficulty_lao="easy",
        question_type="mixed",
        language="lao",
        num_objective=2,
        num_subjective=2
    )

    print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print("Error:", e)
