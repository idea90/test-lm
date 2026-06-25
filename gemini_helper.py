from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Define Pydantic schema for structured output
class QuestionSchema(BaseModel):
    question_text: str = Field(description="The question text in Lao language, based strictly on the text context.")
    option_a: str = Field(description="Option A text. For multiple choice, must start with the option text itself (do not prepend 'ກ.' or 'A.'). For subjective/essay questions, this MUST be an empty string (\"\").")
    option_b: str = Field(description="Option B text. For multiple choice, must start with the option text itself. For subjective/essay questions, this MUST be an empty string (\"\").")
    option_c: str = Field(description="Option C text. For multiple choice, must start with the option text itself. For subjective/essay questions, this MUST be an empty string (\"\").")
    option_d: str = Field(description="Option D text. For multiple choice, must start with the option text itself. For subjective/essay questions, this MUST be an empty string (\"\").")
    correct_option: str = Field(description="The correct option key. Must be exactly 'A', 'B', 'C', or 'D'. For subjective/essay, set this to 'A'.")
    explanation: str = Field(description="Lao explanation for why the option is correct, or the detailed model answer/guidelines for subjective questions.")

class TestSchema(BaseModel):
    title: str = Field(description="A suitable, professional title for the test in Lao language based on the topic.")
    questions: list[QuestionSchema]

def optimize_context_text(text, max_chars=60000):
    if not text or len(text) <= max_chars:
        return text or ""
    
    print(f"Optimizing large context text of size {len(text)} chars (limit: {max_chars} chars)...")
    # Take chunks from the beginning, middle, and end to ensure broad coverage
    chunk_size = max_chars // 3
    
    start_chunk = text[:chunk_size]
    
    mid_start = len(text) // 2 - chunk_size // 2
    mid_chunk = text[mid_start:mid_start + chunk_size]
    
    end_chunk = text[-chunk_size:]
    
    optimized_text = (
        f"{start_chunk}\n\n"
        f"... [ເນື້ອຫາບາງສ່ວນຖືກຍໍ້ເພື່ອຄວາມໄວໃນການປະມວນຜົນ / Content truncated for processing speed] ...\n\n"
        f"{mid_chunk}\n\n"
        f"... [ເນື້ອຫາບາງສ່ວນຖືກຍໍ້ເພື່ອຄວາມໄວໃນການປະມວນຜົນ / Content truncated for processing speed] ...\n\n"
        f"{end_chunk}"
    )
    return optimized_text

def get_client(api_key=None):
    """
    Get a Gemini client. If API key is provided, use it.
    Otherwise fall back to environment variable GEMINI_API_KEY.
    """
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("ບໍ່ພົບ API Key ຂອງ Gemini. ກະລຸນາຕັ້ງຄ່າ API Key ໃນສ່ວນການຕັ້ງຄ່າ.")
    return genai.Client(api_key=key)

def generate_test_questions(context_text, num_questions, difficulty_lao, question_type='multiple_choice', custom_instructions='', num_options=4, language='lao', api_key=None):
    """
    Generate test questions based on the lesson content, supporting multiple formats and custom instructions.
    """
    context_text = optimize_context_text(context_text)
    client = get_client(api_key)
    
    # Map difficulty levels to instructions
    difficulty_map = {
        'easy': "Easy (ງ່າຍ) - Direct retrieval from the lesson text, simple definitions, and straightforward facts.",
        'medium': "Medium (ປານກາງ) - Requires understanding of the context, simple reasoning, or application of concepts from the lesson.",
        'hard': "Hard (ຍາກ) - Requires deep analysis, synthesis of multiple ideas from the text, or complex reasoning."
    }
    difficulty_desc = difficulty_map.get(difficulty_lao.lower(), "Medium (ປານກາງ)")
    
    # Language instructions
    language_map = {
        'lao': "The entire output MUST be written completely in the Lao language (ພາສາລາວ) using proper spelling.",
        'english': "The entire output MUST be written completely in English.",
        'mixed': "Use a mix of Lao and English. Questions can be in Lao, but technical terms can be in English."
    }
    language_desc = language_map.get(language, language_map['lao'])
    
    # Number of options instruction
    if num_options < 4:
        options_instruction = f"Each question should have exactly {num_options} options. Only use options A through {chr(64 + num_options)}. Set unused option fields (option_c, option_d, etc.) to empty strings."
    elif num_options > 4:
        options_instruction = f"Each question should have exactly {num_options} options. Use options A through {chr(64 + num_options)}. For options beyond D, include them in the explanation field as 'option_e: ...', 'option_f: ...' etc."
    else:
        options_instruction = "Each question should have exactly 4 options (A, B, C, D)."
    
    # Map question type requirements to prompt constraints
    if question_type == 'true_false':
        format_instructions = """5. Format: True or False questions. For each question:
       * 'option_a' MUST be exactly 'ຖືກຕ້ອງ' (True)
       * 'option_b' MUST be exactly 'ບໍ່ຖືກຕ້ອງ' (False)
       * 'option_c' MUST be an empty string ("" or empty)
       * 'option_d' MUST be an empty string ("" or empty)
       * 'correct_option' MUST be exactly 'A' (if the statement is True) or 'B' (if the statement is False)."""
    elif question_type == 'short_answer':
        format_instructions = """5. Format: Short Answer / Fill in the blank questions. For each question:
       * Options 'option_a', 'option_b', 'option_c', and 'option_d' MUST all be empty strings ("").
       * The correct expected model answer MUST be provided inside the 'explanation' field (e.g. 'ຄຳຕອບທີ່ຖືກຕ້ອງແມ່ນ: [expected answer]').
       * 'correct_option' should be set to 'A' (as a placeholder)."""
    elif question_type == 'mixed':
        format_instructions = """5. Format: A mix of Multiple Choice (Objective) and Short Answer/Essay (Subjective) questions.
       * Roughly half of the questions should be Multiple Choice (options A, B, C, D are provided, and correct_option is one of A, B, C, or D).
       * The other half of the questions should be Short Answer/Essay questions (options 'option_a', 'option_b', 'option_c', and 'option_d' MUST ALL be empty strings "", and the correct expected answer guidelines/description MUST be provided in the 'explanation' field).
       * 'correct_option' for Short Answer/Essay questions should be set to 'A' (as a placeholder)."""
    else: # default multiple_choice
        format_instructions = f"5. Format: Standard multiple choice. {options_instruction} Ensure there is only one correct answer."

    # Inject custom prompt instructions if provided
    custom_ins_clause = ""
    if custom_instructions:
        custom_ins_clause = f"\n7. ADDITIONAL INSTRUCTIONS: You MUST adhere to these custom instructions: {custom_instructions}"

    prompt = f"""
    You are an expert curriculum designer and teacher.
    Analyze the following lesson context and generate a high-quality test based strictly on it.
    
    CRITICAL REQUIREMENTS:
    1. Language: {language_desc}
    2. Context Strictness: Generate questions based ONLY on the facts directly mentioned in the lesson text. Do not invent facts, introduce outside knowledge, or hallucinate.
    3. Test Size: Generate exactly {num_questions} questions.
    4. Difficulty Level: The difficulty of the questions must be {difficulty_desc}.
    {format_instructions}
    6. Explanations: Provide a clear and helpful explanation for why the correct option is right.{custom_ins_clause}
    
    LESSON CONTEXT:
    \"\"\"{context_text}\"\"\"
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TestSchema,
                temperature=0.2,
            ),
        )
        usage = getattr(response, "usage_metadata", None)
        token_count = getattr(usage, "total_token_count", 0) if usage else 0
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "400" in error_msg:
            raise ValueError("API Key ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີສິດເຂົ້າເຖິງ (Gemini API Error).")
        if "503" in error_msg or "UNAVAILABLE" in error_msg.upper() or "high demand" in error_msg.lower():
            raise ValueError("ເກີດຂໍ້ຜິດພາດຈາກ Gemini API (503): ປັດຈຸບັນລະບົບມີຜູ້ໃຊ້ງານຈຳນວນຫຼາຍ (High Demand). ກະລຸນາລອງໃໝ່ອີກຄັ້ງໃນພາຍຫຼັງ.")
        raise ValueError(f"ເກີດຂໍ້ຜິດພາດຈາກ Gemini API: {error_msg}")
    
    try:
        data = json.loads(response.text)
        
        return data, token_count
    except Exception as e:
        # Fallback if parsing fails (highly unlikely with Structured Outputs)
        print(f"Error parsing Gemini response: {e}")
        print(response.text)
        raise ValueError("Gemini ຕອບສະໜອງໃນຮູບແບບທີ່ບໍ່ຖືກຕ້ອງ. ກະລຸນາລອງໃໝ່.")

def generate_chat_response(chat_history, new_message, context_text, api_key=None):
    """
    Generate chat response in Lao using the lesson context.
    """
    context_text = optimize_context_text(context_text)
    client = get_client(api_key)
    
    system_instruction = f"""
    You are Test LM AI, a helpful virtual teaching assistant.
    You help teachers understand the lesson content, answer questions about it, or write specific test questions.
    
    Guidelines:
    1. Respond completely in the Lao language (ພາສາລາວ).
    2. Rely primarily on the lesson context provided. If you don't know the answer or if it's not in the context, tell the teacher politely.
    3. Keep your answers concise, clear, and professional.
    4. If the teacher asks to create a specific question (e.g. "ສ້າງຄຳຖາມກ່ຽວກັບ..."), respond by outputting a formatted multiple-choice question in Lao.
    
    LESSON CONTEXT:
    \"\"\"{context_text}\"\"\"
    """
    
    # Map chat history to API format
    contents = []
    for msg in chat_history:
        role = 'user' if msg['role'] == 'user' else 'model'
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg['content'])]
            )
        )
    
    contents.append(
        types.Content(
            role='user',
            parts=[types.Part.from_text(text=new_message)]
        )
    )
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        usage = getattr(response, "usage_metadata", None)
        token_count = getattr(usage, "total_token_count", 0) if usage else 0
        return response.text, token_count
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "400" in error_msg:
            raise ValueError("API Key ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີສິດເຂົ້າເຖິງ (Gemini API Error).")
        if "503" in error_msg or "UNAVAILABLE" in error_msg.upper() or "high demand" in error_msg.lower():
            raise ValueError("ເກີດຂໍ້ຜິດພາດຈາກ Gemini API (503): ປັດຈຸບັນລະບົບມີຜູ້ໃຊ້ງານຈຳນວນຫຼາຍ (High Demand). ກະລຸນາລອງໃໝ່ອີກຄັ້ງໃນພາຍຫຼັງ.")
        raise ValueError(f"ເກີດຂໍ້ຜິດພາດຈາກ Gemini API: {error_msg}")
