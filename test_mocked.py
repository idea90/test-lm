import sys
import os
import json
from unittest.mock import patch

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from llm_helper import generate_test_questions
import database

# Mock response structure
mock_ai_response = {
    "title": "ບົດທົດສອບປະຫວັດສາດລາວ",
    "questions": [
        {
            "question_text": "ໃຜເປັນຜູ້ທ້ອນໂຮມອານາຈັກລ້ານຊ້າງໃນປີ ຄ.ສ 1353?",
            "option_a": "ເຈົ້າຟ້າງຸ່ມ",
            "option_b": "ເຈົ້າໄຊເສດຖາທິລາດ",
            "option_c": "ເຈົ້າອານຸວົງ",
            "option_d": "ເຈົ້າສຸລິຍະວົງສາ",
            "correct_option": "A",
            "explanation": "ເຈົ້າຟ້າງຸ່ມໄດ້ທ້ອນໂຮມອານາຈັກລ້ານຊ້າງໃນປີ ຄ.ສ 1353."
        },
        {
            "question_text": "ເຈົ້າຟ້າງຸ່ມໄດ້ນຳເອົາພະພຸດທະຮູບໃດມາຈາກກຳປູເຈຍ?",
            "option_a": "ພະບາງ",
            "option_b": "ພະແກ້ວມໍລະກົດ",
            "option_c": "ພະແສນ",
            "option_d": "ພະໃສ",
            "correct_option": "A",
            "explanation": "ເພິ່ນໄດ້ນຳເອົາພະບາງມາຈາກກຳປູເຈຍ."
        }
    ]
}

@patch('gemini_helper.generate_test_questions')
def run_test(mock_generate):
    # Setup mock return value
    mock_generate.return_value = (mock_ai_response, 150)
    
    print("--- Running Mocked Test (No AI Call) ---")
    context = "ປະຫວັດສາດລາວ: ເຈົ້າຟ້າງຸ່ມໄດ້ທ້ອນໂຮມອານາຈັກລ້ານຊ້າງໃນປີ ຄ.ສ 1353. ເພິ່ນໄດ້ນຳເອົາພະບາງມາຈາກກຳປູເຈຍ."
    
    try:
        data, tokens = generate_test_questions(
            model_name="gemini-2.5-flash",
            context_text=context,
            num_questions=2,
            difficulty_lao="easy",
            question_type="mixed",
            language="lao",
            num_objective=1,
            num_subjective=1
        )
        
        print("\n1. Verification of Formatting Logic (mixed type):")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        # Verify subjective option fields are blanked out correctly by llm_helper
        q1 = data['questions'][0]
        q2 = data['questions'][1]
        assert q1['option_a'] == "ເຈົ້າຟ້າງຸ່ມ", "Objective question should preserve options"
        assert q2['option_a'] == "", "Subjective question option should be blanked"
        print("[OK] Formatting verification passed!")
        
        print("\n2. Verification of Database Insertion:")
        database.init_db()
        
        # Ensure a test user exists
        user = database.get_user_by_username("test_mock_user")
        if user:
            user_id = user['id']
        else:
            user_id = database.create_user("test_mock_user", "hashed_pass")
            
        # Add a mock source under this user
        source_id = database.add_source(
            filename="mock_lesson.txt",
            file_size=len(context),
            text_content=context,
            user_id=user_id
        )
        
        test_id = database.create_test(
            title=data.get('title', 'Test'),
            difficulty='easy',
            num_questions=2,
            source_id=source_id,
            questions=data['questions'],
            user_id=user_id
        )
        print(f"[OK] Inserted as test_id: {test_id}")
        
    except Exception as e:
        print("Error during mock test execution:", e)

if __name__ == '__main__':
    run_test()
