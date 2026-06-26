import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import util from 'util';
import mammoth from 'mammoth';
// @ts-ignore
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { GoogleGenAI } from '@google/genai';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak
} from 'docx';

const execFilePromise = util.promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

// Mammoth DOCX extraction
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

// Tesseract.js image extraction with Gemini fallback
export async function extractTextFromImage(buffer: Buffer, mimeType: string, apiKey?: string): Promise<string> {
  try {
    console.log("Extracting text from image using Tesseract.js...");
    const result = await Tesseract.recognize(buffer, 'lao+eng');
    const text = result.data.text || '';
    if (text.trim().length > 15) {
      console.log("Image text extracted successfully using Tesseract.js");
      return text.trim();
    }
  } catch (err: any) {
    console.error("Tesseract.js OCR failed on image:", err.message);
  }

  console.log("Falling back to Gemini Vision for image transcription...");
  try {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("No Gemini API key available");
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        "Please extract and transcribe all the text from this image exactly as it appears. If there is no text, describe the image.",
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: mimeType || 'image/png'
          }
        }
      ]
    });
    return response.text || '';
  } catch (geminiErr: any) {
    console.error("Gemini Vision fallback failed:", geminiErr.message);
    return '';
  }
}

// PDF Text Extraction using pdf-parse & Python OCR fallback
export async function extractTextFromPdf(
  pdfBuffer: Buffer,
  pageStart = 1,
  pageEnd: number | null = null,
  excludePages: number[] = [],
  forceOcr = false
): Promise<string> {
  const excludeSet = new Set(excludePages);

  // If not forced, try pdf-parse first
  if (!forceOcr) {
    try {
      let pagesText: string[] = [];
      const options = {
        pagerender: function (pageData: any) {
          return pageData.getTextContent().then(function (textContent: any) {
            let lastY: any, text = '';
            for (let item of textContent.items) {
              if (lastY === item.transform[5] || !lastY) {
                text += item.str;
              } else {
                text += '\n' + item.str;
              }
              lastY = item.transform[5];
            }
            return text;
          });
        }
      };

      const parsed = await pdf(pdfBuffer, options);
      
      // pdf-parse doesn't easily split page text, but we can hook into text content
      // If we got sufficient text, return it
      const text = parsed.text || '';
      if (text.trim().length >= 15) {
        // Since pdf-parse output is combined, we return it. 
        // Note: For advanced pagination/exclusion, we rely on the python helper.
        return text.trim();
      }
    } catch (err: any) {
      console.warn("pdf-parse failed, falling back to python OCR:", err.message);
    }
  }

  // Fallback / Forced OCR: Write PDF to temp file and run python helper
  const tempPdfPath = path.join(rootDir, `temp_upload_${Date.now()}.pdf`);
  await fs.promises.writeFile(tempPdfPath, pdfBuffer);

  try {
    const pythonPath = path.resolve(rootDir, 'venv/Scripts/python.exe');
    const helperScript = path.resolve(__dirname, 'pdf_ocr.py');
    const excludePagesStr = excludePages.length > 0 ? excludePages.join(',') : 'none';
    const pageEndStr = pageEnd !== null ? String(pageEnd) : 'none';
    const forceOcrStr = forceOcr ? '1' : '0';

    console.log(`Running Python OCR helper: ${pythonPath} ${helperScript} ...`);
    const { stdout } = await execFilePromise(pythonPath, [
      helperScript,
      tempPdfPath,
      String(pageStart),
      pageEndStr,
      excludePagesStr,
      forceOcrStr
    ], { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer

    return stdout.trim();
  } catch (err: any) {
    console.error("Python OCR helper failed:", err.message);
    return '';
  } finally {
    // Cleanup temp file
    if (fs.existsSync(tempPdfPath)) {
      try {
        await fs.promises.unlink(tempPdfPath);
      } catch (e) {}
    }
  }
}

// Helper to style text
function textRun(text: string, size = 12, bold = false, italic = false): TextRun {
  return new TextRun({
    text,
    font: 'Noto Sans Lao',
    size: size * 2,
    bold,
    italics: italic
  });
}

// Generate Docx using docx package
export async function generateDocxFile(params: {
  testData: any;
  school?: string;
  subject?: string;
  motto?: string;
  grade?: string;
  watermark?: string;
  examNo?: string;
  timeLimit?: string;
}): Promise<Buffer> {
  const { testData, school, subject, motto, grade, watermark, examNo, timeLimit } = params;

  const laoOptions: Record<string, string> = { 'A': 'ກ', 'B': 'ຂ', 'C': 'ຄ', 'D': 'ງ' };

  // Determine sections
  const questions = testData.questions || [];
  const objectiveQs = questions.filter(
    (q: any) => !(q.option_a === '' && q.option_b === '' && q.option_c === '' && q.option_d === '')
  );
  const subjectiveQs = questions.filter(
    (q: any) => q.option_a === '' && q.option_b === '' && q.option_c === '' && q.option_d === ''
  );

  const docChildren: any[] = [];

  // 1. Top Meta Row: Grade & Watermark
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [textRun(`ຊັ້ນ: ${grade || 'ມ.7'}`, 11, true)]
                })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [textRun(watermark ? `ຄຳຕັກເຕືອນ: ${watermark}` : '', 11, true)]
                })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    })
  );

  docChildren.push(new Paragraph({}));

  // 2. Motto
  const defaultMotto =
    "ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ\n" +
    "ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ\n" +
    "------000-------";
  const mottoLines = (motto || defaultMotto).split('\n');
  for (const line of mottoLines) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 }, // docx spacing is in twentieths of a point (dxa)
        children: [textRun(line.trim(), 11, true)]
      })
    );
  }

  docChildren.push(new Paragraph({}));

  // 3. School & Exam No Row
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [textRun(`ໂຮງຮຽນ: ${school || '........................'}`, 11)]
                })
              ],
              width: { size: 70, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [textRun(`ເລກທີ: ${examNo || '........'}`, 11)]
                })
              ],
              width: { size: 30, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    })
  );

  // 4. Title
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 120 },
      children: [textRun(`ຫົວບົດສອບເສັງ: ${testData.title}`, 15, true)]
    })
  );

  // 5. Subject & Time Row
  let subjectStr = subject || 'ບົດຮຽນທົ່ວໄປ';
  if (!subjectStr.startsWith('ວິຊາ')) {
    subjectStr = `ວິຊາ: ${subjectStr}`;
  }
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [textRun(subjectStr, 11, true)]
                })
              ],
              width: { size: 70, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [textRun(`ເວລາ: ${timeLimit || '90'} ນາທີ`, 11)]
                })
              ],
              width: { size: 30, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    })
  );

  docChildren.push(new Paragraph({}));

  // 6. Student Grid Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  spacing: { line: 299 }, // ~1.3 line spacing (lineRule is AUTO by default)
                  children: [
                    textRun(
                      "ຊື່ ແລະ ນາມສະກຸນ: ....................................................\n" +
                      "ຫ້ອງ: ....................................................\n" +
                      "ວັນທີ: ....................................................\n" +
                      "ເລກໂຕະ: ....................................................",
                      10
                    )
                  ]
                })
              ],
              width: { size: 60, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [textRun("ຄະແນນ", 10, true)]
                })
              ],
              width: { size: 13, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [textRun("ຄຳເຫັນຂອງຄູ", 10, true)]
                })
              ],
              width: { size: 13, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [textRun("ລາຍເຊັນຄູ", 10, true)]
                })
              ],
              width: { size: 14, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    })
  );

  docChildren.push(new Paragraph({}));

  // Render Objective Section
  if (objectiveQs.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [textRun("I. ພາກປາລະໄນ (ຄຳຖາມເລືອກຕອບ)", 13, true)]
      })
    );
    docChildren.push(new Paragraph({}));

    objectiveQs.forEach((q: any, i: number) => {
      docChildren.push(
        new Paragraph({
          children: [textRun(`ຂໍ້ ${i + 1}. ${q.question_text}`, 12, true)]
        })
      );

      const options = [
        { key: 'A', val: q.option_a },
        { key: 'B', val: q.option_b },
        { key: 'C', val: q.option_c },
        { key: 'D', val: q.option_d }
      ];

      options.forEach((opt) => {
        if (opt.val && opt.val.trim() !== '') {
          const optLao = laoOptions[opt.key] || opt.key;
          docChildren.push(
            new Paragraph({
              indent: { left: 576 }, // 0.4 inches in dxa (1 inch = 1440 dxa, 0.4 = 576 dxa)
              spacing: { after: 40 },
              children: [textRun(`${optLao}. ${opt.val}`, 12)]
            })
          );
        }
      });

      docChildren.push(new Paragraph({}));
    });
  }

  // Render Subjective Section
  if (subjectiveQs.length > 0) {
    docChildren.push(
      new Paragraph({
        children: [textRun("II. ພາກອັດຕະໄນ (ຄຳຖາມອະທິບາຍ/ຕອບສັ້ນ)", 13, true)]
      })
    );
    docChildren.push(new Paragraph({}));

    subjectiveQs.forEach((q: any, i: number) => {
      docChildren.push(
        new Paragraph({
          children: [textRun(`ຂໍ້ ${i + 1}. ${q.question_text}`, 12, true)]
        })
      );

      for (let j = 0; j < 3; j++) {
        docChildren.push(
          new Paragraph({
            indent: { left: 576 },
            spacing: { after: 40 },
            children: [
              textRun(
                "....................................................................................................................................................",
                12
              )
            ]
          })
        );
      }

      docChildren.push(new Paragraph({}));
    });
  }

  // Page Break for Answer Key
  docChildren.push(new PageBreak());

  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [textRun("ສະເລີຍຄຳຕອບ ແລະ ຄຳອະທິບາຍ (Answer Key)", 14, true)]
    })
  );
  docChildren.push(new Paragraph({}));

  questions.forEach((q: any, i: number) => {
    const isSubj = q.option_a === '' && q.option_b === '' && q.option_c === '' && q.option_d === '';
    
    if (isSubj) {
      docChildren.push(
        new Paragraph({
          children: [
            textRun(`ຂໍ້ ${i + 1}. ແນວທາງຄຳຕອບ: `, 12),
            textRun(q.explanation || 'ບໍ່ມີແນວທາງຄຳຕອບ', 12, true)
          ]
        })
      );
    } else {
      const correctLao = laoOptions[q.correct_option.toUpperCase()] || q.correct_option;
      const optField = `option_${q.correct_option.toLowerCase()}`;
      const correctText = q[optField] || '';

      const p = new Paragraph({
        children: [
          textRun(`ຂໍ້ ${i + 1}. ຕອບ: `, 12),
          textRun(correctLao, 12, true),
          textRun(` (${correctText})`, 12)
        ]
      });
      docChildren.push(p);

      const explanationText = q.explanation || 'ບໍ່ມີຄຳອະທິບາຍ';
      docChildren.push(
        new Paragraph({
          children: [
            textRun(`ອະທິບາຍ: ${explanationText}`, 10.5, false, true)
          ]
        })
      );
    }

    docChildren.push(new Paragraph({}));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBuffer(doc);
}
