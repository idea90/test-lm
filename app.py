from flask import Flask, request, jsonify, render_template, send_file, session, send_from_directory
import os
import pypdf
import io
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# Import our custom helper modules
import database
import llm_helper
import gemini_helper # Keep around for backward compatibility if needed

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='frontend/dist', static_url_path='')
app.secret_key = os.getenv("SECRET_KEY", "test-lm-default-secret-key-123456")

# Initialize SQLite database
database.init_db()

# Authentication Decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "ກະລຸນາເຂົ້າລະບົບກ່ອນ", "auth_required": True}), 401
        return f(*args, **kwargs)
    return decorated_function

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    if not username or not password:
        return jsonify({"error": "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ສາມາດຫວ່າງເປົ່າໄດ້"}), 400
        
    if len(username) < 3:
        return jsonify({"error": "ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ"}), 400
        
    if len(password) < 4:
        return jsonify({"error": "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ"}), 400
        
    existing_user = database.get_user_by_username(username)
    if existing_user:
        return jsonify({"error": "ຊື່ຜູ້ໃຊ້ນີ້ຖືກໃຊ້ໄປແລ້ວ"}), 400
        
    try:
        password_hash = generate_password_hash(password)
        user_id = database.create_user(username, password_hash)
        if user_id:
            session['user_id'] = user_id
            session['username'] = username
            session['is_guest'] = False
            return jsonify({"message": "ລົງທະບຽນສຳເລັດ", "user_id": user_id, "username": username})
        else:
            return jsonify({"error": "ບໍ່ສາມາດສ້າງບັນຊີໄດ້"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"}), 400
        
    username = data['username'].strip()
    password = data['password']
    
    try:
        user = database.get_user_by_username(username)
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({"error": "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"}), 401
            
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['is_guest'] = (user['username'] == 'guest')
        return jsonify({
            "message": "ເຂົ້າລະບົບສຳເລັດ", 
            "user_id": user['id'], 
            "username": user['username'], 
            "is_guest": session['is_guest']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/guest', methods=['POST'])
def guest_login():
    try:
        username = 'guest'
        user = database.get_user_by_username(username)
        if not user:
            dummy_hash = generate_password_hash('guest_bypass_hash_code_123')
            user_id = database.create_user(username, dummy_hash, token_limit=50000)
            if not user_id:
                user = database.get_user_by_username(username)
                if user:
                    user_id = user['id']
                else:
                    return jsonify({"error": "ບໍ່ສາມາດສ້າງບັນຊີ Guest ໄດ້"}), 500
        else:
            user_id = user['id']
            
        session['user_id'] = user_id
        session['username'] = username
        session['is_guest'] = True
        return jsonify({
            "message": "ເຂົ້າລະບົບໃນຖານະ Guest ສຳເລັດ", 
            "user_id": user_id, 
            "username": username, 
            "is_guest": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "ອອກຈາກລະບົບສຳເລັດ"})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if 'user_id' in session:
        return jsonify({
            "logged_in": True,
            "user_id": session['user_id'],
            "username": session['username'],
            "is_guest": session.get('is_guest', False)
        })
    return jsonify({"logged_in": False})

# Helper function to extract text from PDF
def extract_text_from_pdf(file_stream):
    try:
        reader = pypdf.PdfReader(file_stream)
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def extract_text_from_docx(file_stream):
    try:
        from docx import Document
        doc = Document(file_stream)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return None

def extract_text_from_image(file_stream):
    try:
        import gemini_helper
        from PIL import Image
        img = Image.open(file_stream)
        
        client = gemini_helper.get_client()
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=["Please extract and transcribe all the text from this image exactly as it appears. If there is no text, describe the image.", img]
        )
        return response.text
    except Exception as e:
        print(f"Error reading Image: {e}")
        return None

# Serve Frontend Home Page
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Catch-all route for React client-side routing
@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# API Endpoints for Sources (Lesson PDFs)
@app.route('/api/sources', methods=['GET'])
@login_required
def get_sources():
    try:
        sources = database.list_sources(session['user_id'])
        return jsonify(sources)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sources/upload', methods=['POST'])
@login_required
def upload_source():
    if 'file' not in request.files:
        return jsonify({"error": "ບໍ່ພົບໄຟລ໌ທີ່ອັບໂຫລດ"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "ຊື່ໄຟລ໌ບໍ່ຖືກຕ້ອງ"}), 400
        
    filename_lower = file.filename.lower()
    allowed_extensions = ('.pdf', '.docx', '.jpg', '.jpeg', '.png')
    if not filename_lower.endswith(allowed_extensions):
        return jsonify({"error": "ຮອງຮັບສະເພາະໄຟລ໌ PDF, DOCX ແລະ ຮູບພາບເທົ່ານັ້ນ"}), 400
        
    try:
        # Read the file contents into memory stream to parse
        file_bytes = file.read()
        file_size = len(file_bytes)
        file_stream = io.BytesIO(file_bytes)
        
        extracted_text = None
        if filename_lower.endswith('.pdf'):
            extracted_text = extract_text_from_pdf(file_stream)
        elif filename_lower.endswith('.docx'):
            extracted_text = extract_text_from_docx(file_stream)
        else:
            extracted_text = extract_text_from_image(file_stream)
            
        if not extracted_text:
            return jsonify({"error": "ບໍ່ສາມາດອ່ານຂໍ້ຄວາມຈາກໄຟລ໌ໄດ້ ຫຼື ໄຟລ໌ຫວ່າງເປົ່າ"}), 400
            
        source_id = database.add_source(file.filename, file_size, extracted_text, session['user_id'])
        
        return jsonify({
            "id": source_id,
            "filename": file.filename,
            "file_size": file_size,
            "message": "ອັບໂຫລດ ແລະ ວິເຄາະບົດຮຽນສຳເລັດ"
        })
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({"error": f"ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດ: {str(e)}"}), 500

@app.route('/api/sources/<int:source_id>', methods=['DELETE'])
@login_required
def delete_source(source_id):
    try:
        source = database.get_source(source_id, session['user_id'])
        if not source:
            return jsonify({"error": "ບໍ່ພົບບົດຮຽນນີ້"}), 404
            
        database.delete_source(source_id, session['user_id'])
        return jsonify({"message": "ລົບບົດຮຽນສຳເລັດ"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sources/<int:source_id>/preview', methods=['GET'])
@login_required
def preview_source(source_id):
    try:
        source = database.get_source(source_id, session['user_id'])
        if not source:
            return jsonify({"error": "ບໍ່ພົບບົດຮຽນນີ້"}), 404
        return jsonify({
            "id": source["id"],
            "filename": source["filename"],
            "text_content": source["text_content"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoints for Tests
@app.route('/api/tests', methods=['GET'])
@login_required
def get_tests():
    try:
        tests = database.list_tests(session['user_id'])
        return jsonify(tests)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tests/<int:test_id>', methods=['GET'])
@login_required
def get_test(test_id):
    try:
        test = database.get_test(test_id, session['user_id'])
        if not test:
            return jsonify({"error": "ບໍ່ພົບການສອບເສັງນີ້"}), 404
        return jsonify(test)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tests/<int:test_id>', methods=['DELETE'])
@login_required
def delete_test(test_id):
    try:
        test = database.get_test(test_id, session['user_id'])
        if not test:
            return jsonify({"error": "ບໍ່ພົບການສອບເສັງນີ້"}), 404
            
        database.delete_test(test_id, session['user_id'])
        return jsonify({"message": "ລົບການສອບເສັງສຳເລັດ"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tests/<int:test_id>/rich_text', methods=['PUT'])
@login_required
def update_test_rich_text(test_id):
    data = request.json
    if not data or 'rich_text_content' not in data:
        return jsonify({"error": "ບໍ່ມີເນື້ອຫາສົ່ງມາ"}), 400
    try:
        success = database.update_test_rich_text(test_id, session['user_id'], data['rich_text_content'])
        if not success:
            return jsonify({"error": "ບໍ່ພົບການສອບເສັງ ຫຼື ບໍ່ມີສິດ"}), 404
        return jsonify({"message": "ບັນທຶກເອກະສານສຳເລັດ"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tests/generate', methods=['POST'])
@login_required
def generate_test():
    data = request.json
    if not data or 'source_id' not in data:
        return jsonify({"error": "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ (ຕ້ອງການ source_id)"}), 400
        
    source_id = data['source_id']
    num_questions = int(data.get('num_questions', 10))
    difficulty = data.get('difficulty', 'medium')
    question_type = data.get('question_type', 'multiple_choice')
    custom_instructions = data.get('custom_instructions', '')
    num_options = int(data.get('num_options', 4))
    language = data.get('language', 'lao')
    time_limit = int(data.get('time_limit', 0))
    shuffle_options = data.get('shuffle_options', False)
    
    model = data.get('model', 'gemini-2.5-flash')
    api_keys = data.get('api_keys', {})
    if data.get('api_key'):
        api_keys['gemini'] = data.get('api_key')
    
    try:
        source = database.get_source(source_id, session['user_id'])
        if not source:
            return jsonify({"error": "ບໍ່ພົບບົດຮຽນທີ່ເລືອກ"}), 404
            
        user_stats = database.get_dashboard_stats(session['user_id'])
            
        # Generate questions via LLM
        gemini_response, token_count = llm_helper.generate_test_questions(
            model_name=model,
            context_text=source['text_content'],
            num_questions=num_questions,
            difficulty_lao=difficulty,
            question_type=question_type,
            custom_instructions=custom_instructions,
            num_options=num_options,
            language=language,
            api_keys=api_keys
        )
        
        # Shuffle options if requested
        if shuffle_options and question_type == 'multiple_choice':
            import random
            for q in gemini_response['questions']:
                options = [
                    ('A', q.get('option_a', '')),
                    ('B', q.get('option_b', '')),
                    ('C', q.get('option_c', '')),
                    ('D', q.get('option_d', '')),
                ]
                correct_key = q['correct_option']
                correct_text = dict(options).get(correct_key, '')
                random.shuffle(options)
                q['option_a'] = options[0][1]
                q['option_b'] = options[1][1]
                q['option_c'] = options[2][1]
                q['option_d'] = options[3][1]
                # Find new position of correct answer
                for new_key_idx, (_, text) in enumerate(options):
                    if text == correct_text:
                        q['correct_option'] = ['A', 'B', 'C', 'D'][new_key_idx]
                        break
        
        # Save generated test and questions to SQLite database
        test_id = database.create_test(
            title=gemini_response['title'],
            difficulty=difficulty,
            num_questions=len(gemini_response['questions']),
            source_id=source_id,
            questions=gemini_response['questions'],
            user_id=session['user_id']
        )
        
        saved_test = database.get_test(test_id, session['user_id'])
        # Attach extra metadata for the frontend
        saved_test['time_limit'] = time_limit
        return jsonify(saved_test)
        
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        print(f"Generation error: {e}")
        return jsonify({"error": f"ເກີດຂໍ້ຜິດພາດໃນການສ້າງຄຳຖາມ: {str(e)}"}), 500

# API Endpoints for Individual Questions (Editing)
@app.route('/api/questions/<int:question_id>', methods=['PUT'])
@login_required
def update_question(question_id):
    data = request.json
    if not data:
        return jsonify({"error": "ບໍ່ມີຂໍ້ມູນສົ່ງມາ"}), 400
        
    try:
        result = database.update_question(
            question_id=question_id,
            question_text=data['question_text'],
            option_a=data['option_a'],
            option_b=data['option_b'],
            option_c=data['option_c'],
            option_d=data['option_d'],
            correct_option=data['correct_option'],
            explanation=data.get('explanation', ''),
            user_id=session['user_id']
        )
        if result is False:
            return jsonify({"error": "ບໍ່ພົບຄຳຖາມ ຫຼື ບໍ່ມີສິດ"}), 404
        return jsonify({"message": "ແກ້ໄຂຄຳຖາມສຳເລັດ"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/questions/<int:question_id>', methods=['DELETE'])
@login_required
def delete_question(question_id):
    try:
        database.delete_question(question_id, user_id=session['user_id'])
        return jsonify({"message": "ລົບຄຳຖາມສຳເລັດ"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/questions', methods=['POST'])
@login_required
def add_question():
    data = request.json
    if not data or 'test_id' not in data:
        return jsonify({"error": "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"}), 400
        
    try:
        question_id = database.add_question(
            test_id=data['test_id'],
            question_text=data['question_text'],
            option_a=data['option_a'],
            option_b=data['option_b'],
            option_c=data['option_c'],
            option_d=data['option_d'],
            correct_option=data['correct_option'],
            explanation=data.get('explanation', ''),
            user_id=session['user_id']
        )
        if question_id is None:
            return jsonify({"error": "ບໍ່ພົບບົດສອບເສັງ ຫຼື ບໍ່ມີສິດ"}), 404
        return jsonify({"id": question_id, "message": "ເພີ່ມຄຳຖາມສຳເລັດ"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint for chat interaction with lesson content
@app.route('/api/chat', methods=['POST'])
@login_required
def chat_with_source():
    data = request.json
    if not data or 'source_id' not in data or 'message' not in data:
        return jsonify({"error": "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"}), 400
        
    source_id = data['source_id']
    new_message = data['message']
    chat_history = data.get('history', [])
    
    model = data.get('model', 'gemini-2.5-flash')
    api_keys = data.get('api_keys', {})
    if data.get('api_key'):
        api_keys['gemini'] = data.get('api_key')
    
    try:
        source = database.get_source(source_id, session['user_id'])
        if not source:
            return jsonify({"error": "ບໍ່ພົບບົດຮຽນນີ້"}), 404
            
        user_stats = database.get_dashboard_stats(session['user_id'])
            
        response_text, token_count = llm_helper.generate_chat_response(
            model_name=model,
            chat_history=chat_history,
            new_message=new_message,
            context_text=source['text_content'],
            api_keys=api_keys
        )
        return jsonify({"response": response_text})
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"error": f"ເກີດຂໍ້ຜິດພາດໃນການສົນທະນາ: {str(e)}"}), 500

# API Endpoint for Dashboard Statistics
@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats_endpoint():
    try:
        stats = database.get_dashboard_stats(session['user_id'])
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to export test to Word (.docx)
@app.route('/api/tests/<int:test_id>/export/docx', methods=['GET', 'POST'])
@login_required
def export_docx(test_id):
    try:
        test = database.get_test(test_id, session['user_id'])
        if not test:
            return jsonify({"error": "ບໍ່ພົບການສອບເສັງນີ້"}), 404
            
        docx_stream = generate_docx_file(test)
        
        # Safe ASCII/URL encoded filename for download
        filename = f"test_{test_id}.docx"
        
        return send_file(
            docx_stream,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Export error: {e}")
        return jsonify({"error": f"ເກີດຂໍ້ຜິດພາດໃນການດາວໂຫລດ Word: {str(e)}"}), 500

# Word Document (.docx) Generator Helper
def generate_docx_file(test_data):
    from docx import Document
    from docx.shared import Pt, Inches
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    
    doc = Document()
    
    # Page setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    # Set default font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Noto Sans Lao'
    font.size = Pt(12)
    
    # Header/Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run(test_data['title'])
    title_run.bold = True
    title_run.font.size = Pt(16)
    
    # Subtitle Info
    diff_map = {'easy': 'ງ່າຍ', 'medium': 'ປານກາງ', 'hard': 'ຍາກ'}
    diff_lao = diff_map.get(test_data['difficulty'].lower(), test_data['difficulty'])
    
    info_p = doc.add_paragraph()
    info_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run = info_p.add_run(f"ລະດັບຄວາມຍາກ: {diff_lao}  |  ຈຳນວນ: {test_data['num_questions']} ຂໍ້\n")
    info_run.font.size = Pt(11)
    info_run.italic = True
    
    # Student Header Info Table
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Auto-fit table cells
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "ຊື່ ແລະ ນາມສະກຸນ: ....................................."
    hdr_cells[1].text = "ຫ້ອງຮຽນ: ................."
    hdr_cells[2].text = "ວັນທີ: ....../....../......"
    
    # Set font for all cells in tables
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.name = 'Noto Sans Lao'
                    run.font.size = Pt(11)
                    
    doc.add_paragraph() # space
    
    lao_options = {'A': 'ກ', 'B': 'ຂ', 'C': 'ຄ', 'D': 'ງ'}
    
    # Questions loop
    for i, q in enumerate(test_data['questions'], 1):
        qp = doc.add_paragraph()
        q_run = qp.add_run(f"ຂໍ້ {i}. {q['question_text']}")
        q_run.bold = True
        
        # Options
        for opt_key, opt_val in [('A', q['option_a']), ('B', q['option_b']), ('C', q['option_c']), ('D', q['option_d'])]:
            op = doc.add_paragraph()
            op.paragraph_format.left_indent = Inches(0.4)
            op.paragraph_format.space_after = Pt(2)
            opt_lao = lao_options[opt_key]
            op.add_run(f"{opt_lao}. {opt_val}")
            
        doc.add_paragraph() # spacing
        
    # Answer Key Page Break
    doc.add_page_break()
    
    key_title_p = doc.add_paragraph()
    key_title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    key_title_run = key_title_p.add_run("ສະເລີຍຄຳຕອບ ແລະ ຄຳອະທິບາຍ (Answer Key)")
    key_title_run.bold = True
    key_title_run.font.size = Pt(14)
    doc.add_paragraph()
    
    for i, q in enumerate(test_data['questions'], 1):
        kp = doc.add_paragraph()
        correct_lao = lao_options.get(q['correct_option'], q['correct_option'])
        
        k_run1 = kp.add_run(f"ຂໍ້ {i}. ຕອບ: ")
        k_run2 = kp.add_run(f"{correct_lao}")
        k_run2.bold = True
        
        # Add actual text of the correct option
        opt_field = f"option_{q['correct_option'].lower()}"
        correct_text = q.get(opt_field, '')
        kp.add_run(f" ({correct_text})\n")
        
        explanation_text = q.get('explanation') or 'ບໍ່ມີຄຳອະທິບາຍ'
        k_run3 = kp.add_run(f"ອະທິບາຍ: {explanation_text}")
        k_run3.font.size = Pt(10.5)
        k_run3.italic = True
        
        doc.add_paragraph()
        
    # Save to BytesIO
    docx_stream = io.BytesIO()
    doc.save(docx_stream)
    docx_stream.seek(0)
    return docx_stream

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
