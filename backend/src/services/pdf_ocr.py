import sys
import os
import pypdf
import pytesseract
from pdf2image import convert_from_bytes
from concurrent.futures import ThreadPoolExecutor

def main():
    if len(sys.argv) < 6:
        print("Usage: python pdf_ocr.py <pdf_path> <page_start> <page_end> <exclude_pages> <force_ocr>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    page_start = int(sys.argv[2])
    page_end_val = sys.argv[3]
    page_end = int(page_end_val) if page_end_val.lower() != 'none' else None
    exclude_pages_str = sys.argv[4]
    exclude_pages = set(int(p) for p in exclude_pages_str.split(',') if p.strip())
    force_ocr = sys.argv[5] == '1'

    poppler_path = os.getenv("POPPLER_PATH") or r"C:\Users\idea\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin"
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD") or r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        sys.exit(1)

    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()

    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)

    start_idx = max(0, page_start - 1)
    end_idx = min(total_pages, page_end if page_end is not None else total_pages)

    results = [None] * (end_idx - start_idx)
    pages_to_ocr = []

    for idx, i in enumerate(range(start_idx, end_idx)):
        page_num = i + 1
        if page_num in exclude_pages:
            results[idx] = ""
            continue

        page_text = ""
        if not force_ocr:
            page = reader.pages[i]
            page_text = page.extract_text() or ""

        if not force_ocr and page_text and len(page_text.strip()) >= 15:
            results[idx] = page_text
        else:
            pages_to_ocr.append((idx, page_num))

    if pages_to_ocr:
        def ocr_page(page_num):
            try:
                images = convert_from_bytes(pdf_bytes, first_page=page_num, last_page=page_num, poppler_path=poppler_path)
                if images:
                    ocr_text = pytesseract.image_to_string(images[0], lang='lao+eng')
                    if ocr_text and len(ocr_text.strip()) > 5:
                        return page_num, ocr_text.strip()
            except Exception as ocr_err:
                pass
            return page_num, ""

        max_workers = min(len(pages_to_ocr), 4, os.cpu_count() or 4)
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(ocr_page, p_num): idx
                for idx, p_num in pages_to_ocr
            }
            for future in futures:
                idx = futures[future]
                p_num, ocr_result = future.result()
                if ocr_result:
                    results[idx] = ocr_result
                else:
                    results[idx] = ""

    text = "\n".join([r for r in results if r])
    # Write to stdout using utf-8 encoding to avoid Windows console errors
    sys.stdout.buffer.write(text.strip().encode('utf-8'))

if __name__ == '__main__':
    from dotenv import load_dotenv
    # Load dotenv from root directory
    root_dir = path_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    load_dotenv(os.path.join(root_dir, '.env'))
    main()
