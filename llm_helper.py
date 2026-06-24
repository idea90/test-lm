import json
import os
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import gemini_helper

load_dotenv()

def generate_test_questions(model_name, context_text, num_questions, difficulty_lao, question_type='multiple_choice', custom_instructions='', num_options=4, language='lao', api_keys=None):
    if api_keys is None:
        api_keys = {}
        
    if model_name.startswith('gemini'):
        # Pass directly to gemini_helper
        return gemini_helper.generate_test_questions(
            context_text, num_questions, difficulty_lao, question_type, 
            custom_instructions, num_options, language, api_key=api_keys.get('gemini')
        )
    elif model_name.startswith('gpt'):
        return _generate_openai(model_name, context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language, api_keys.get('openai'))
    elif model_name.startswith('claude'):
        return _generate_anthropic(model_name, context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language, api_keys.get('anthropic'))
    else:
        raise ValueError(f"ບໍ່ຮອງຮັບໂມເດວ: {model_name}")

def generate_chat_response(model_name, chat_history, new_message, context_text, api_keys=None):
    if api_keys is None:
        api_keys = {}
        
    if model_name.startswith('gemini'):
        return gemini_helper.generate_chat_response(
            chat_history, new_message, context_text, api_key=api_keys.get('gemini')
        )
    elif model_name.startswith('gpt'):
        return _chat_openai(model_name, chat_history, new_message, context_text, api_keys.get('openai'))
    elif model_name.startswith('claude'):
        return _chat_anthropic(model_name, chat_history, new_message, context_text, api_keys.get('anthropic'))
    else:
        raise ValueError(f"ບໍ່ຮອງຮັບໂມເດວ: {model_name}")

def _build_prompt(context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language):
    difficulty_map = {
        'easy': "Easy (ງ່າຍ) - Direct retrieval from the lesson text, simple definitions, and straightforward facts.",
        'medium': "Medium (ປານກາງ) - Requires understanding of the context, simple reasoning, or application of concepts from the lesson.",
        'hard': "Hard (ຍາກ) - Requires deep analysis, synthesis of multiple ideas from the text, or complex reasoning."
    }
    difficulty_desc = difficulty_map.get(difficulty_lao.lower(), "Medium (ປານກາງ)")
    
    language_map = {
        'lao': "The entire output MUST be written completely in the Lao language (ພາສາລາວ) using proper spelling.",
        'english': "The entire output MUST be written completely in English.",
        'mixed': "Use a mix of Lao and English. Questions can be in Lao, but technical terms can be in English."
    }
    language_desc = language_map.get(language, language_map['lao'])
    
    if num_options < 4:
        options_instruction = f"Each question should have exactly {num_options} options. Only use options A through {chr(64 + num_options)}. Set unused option fields (option_c, option_d, etc.) to empty strings."
    elif num_options > 4:
        options_instruction = f"Each question should have exactly {num_options} options. Use options A through {chr(64 + num_options)}. For options beyond D, include them in the explanation field as 'option_e: ...', 'option_f: ...' etc."
    else:
        options_instruction = "Each question should have exactly 4 options (A, B, C, D)."
    
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
       * The correct expected model answer MUST be provided inside the 'explanation' field.
       * 'correct_option' should be set to 'A' (as a placeholder)."""
    elif question_type == 'mixed':
        format_instructions = """5. Format: A mix of Multiple Choice (Objective) and Short Answer/Essay (Subjective) questions.
       * Roughly half of the questions should be Multiple Choice (options A, B, C, D are provided, and correct_option is one of A, B, C, or D).
       * The other half of the questions should be Short Answer/Essay questions (options option_a, option_b, option_c, and option_d are ALL empty strings "", and the correct answer description is placed in the explanation field)."""
    else:
        format_instructions = f"5. Format: Standard multiple choice. {options_instruction} Ensure there is only one correct answer."

    custom_ins_clause = f"\n7. ADDITIONAL INSTRUCTIONS: You MUST adhere to these custom instructions: {custom_instructions}" if custom_instructions else ""

    return f"""
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

def _get_system_chat_instruction(context_text):
    return f"""
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

def _generate_openai(model_name, context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language, api_key):
    import openai
    from openai import OpenAI
    
    key = api_key or os.getenv("OPENAI_API_KEY")
    if not key:
        raise ValueError("ບໍ່ພົບ API Key ຂອງ OpenAI. ກະລຸນາຕັ້ງຄ່າ API Key ໃນສ່ວນການຕັ້ງຄ່າ.")
        
    client = OpenAI(api_key=key)
    prompt = _build_prompt(context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language)
    
    try:
        completion = client.beta.chat.completions.parse(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format=gemini_helper.TestSchema,
        )
        data = json.loads(completion.choices[0].message.content)
        token_count = completion.usage.total_tokens if completion.usage else 0
        return data, token_count
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "401" in error_msg:
            raise ValueError("API Key ຂອງ OpenAI ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີສິດເຂົ້າເຖິງ.")
        raise ValueError(f"ເກີດຂໍ້ຜິດພາດຈາກ OpenAI API: {error_msg}")

def _chat_openai(model_name, chat_history, new_message, context_text, api_key):
    import openai
    from openai import OpenAI
    
    key = api_key or os.getenv("OPENAI_API_KEY")
    if not key:
        raise ValueError("ບໍ່ພົບ API Key ຂອງ OpenAI. ກະລຸນາຕັ້ງຄ່າ API Key ໃນສ່ວນການຕັ້ງຄ່າ.")
        
    client = OpenAI(api_key=key)
    system_instruction = _get_system_chat_instruction(context_text)
    
    messages = [{"role": "system", "content": system_instruction}]
    for msg in chat_history:
        role = 'user' if msg['role'] == 'user' else 'assistant'
        messages.append({"role": role, "content": msg['content']})
    messages.append({"role": "user", "content": new_message})
    
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.7,
        )
        token_count = response.usage.total_tokens if response.usage else 0
        return response.choices[0].message.content, token_count
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "401" in error_msg:
            raise ValueError("API Key ຂອງ OpenAI ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີສິດເຂົ້າເຖິງ.")
        raise ValueError(f"ເກີດຂໍ້ຜິດພາດຈາກ OpenAI API: {error_msg}")

def _generate_anthropic(model_name, context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language, api_key):
    import anthropic
    
    key = api_key or os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("ບໍ່ພົບ API Key ຂອງ Anthropic. ກະລຸນາຕັ້ງຄ່າ API Key ໃນສ່ວນການຕັ້ງຄ່າ.")
        
    client = anthropic.Anthropic(api_key=key)
    prompt = _build_prompt(context_text, num_questions, difficulty_lao, question_type, custom_instructions, num_options, language)
    
    system_prompt = "You are a curriculum designer. You must output ONLY a valid JSON object matching the requested schema. No markdown wrappers, no introductory text."
    
    schema = gemini_helper.TestSchema.model_json_schema()
    
    try:
        response = client.messages.create(
            model=model_name,
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
            tools=[{
                "name": "output_test",
                "description": "Output the generated test as structured JSON.",
                "input_schema": schema
            }],
            tool_choice={"type": "tool", "name": "output_test"}
        )
        
        for block in response.content:
            if block.type == "tool_use":
                data = block.input
                token_count = response.usage.input_tokens + response.usage.output_tokens
                return data, token_count
                
        raise ValueError("Claude ບໍ່ໄດ້ຕອບເປັນ JSON.")
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "authentication" in error_msg.lower():
            raise ValueError("API Key ຂອງ Anthropic ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີສິດເຂົ້າເຖິງ.")
        raise ValueError(f"ເກີດຂໍ້ຜິດພາດຈາກ Anthropic API: {error_msg}")

def _chat_anthropic(model_name, chat_history, new_message, context_text, api_key):
    import anthropic
    
    key = api_key or os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("ບໍ່ພົບ API Key ຂອງ Anthropic. ກະລຸນາຕັ້ງຄ່າ API Key ໃນສ່ວນການຕັ້ງຄ່າ.")
        
    client = anthropic.Anthropic(api_key=key)
    system_instruction = _get_system_chat_instruction(context_text)
    
    messages = []
    for msg in chat_history:
        role = 'user' if msg['role'] == 'user' else 'assistant'
        messages.append({"role": role, "content": msg['content']})
    messages.append({"role": "user", "content": new_message})
    
    try:
        response = client.messages.create(
            model=model_name,
            max_tokens=4096,
            system=system_instruction,
            messages=messages,
            temperature=0.7,
        )
        
        token_count = response.usage.input_tokens + response.usage.output_tokens
        return response.content[0].text, token_count
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg.upper() or "authentication" in error_msg.lower():
            raise ValueError("API Key ຂອງ Anthropic ບໍ່ຖືກຕ້ອງ ຫຼື ບໍ່ມີສິດເຂົ້າເຖິງ.")
        raise ValueError(f"ເກີດຂໍ້ຜິດພາດຈາກ Anthropic API: {error_msg}")
