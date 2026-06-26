import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk'; // Check if they install it, or we can use dynamic import / fetch if not installed. Let's make it safe!

// Structure schemas for Gemini Structured Outputs
const QuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question_text: { type: Type.STRING, description: "The text of the question in Lao language." },
    option_a: { type: Type.STRING, description: "Option A text in Lao (or empty string for subjective questions)." },
    option_b: { type: Type.STRING, description: "Option B text in Lao (or empty string for subjective questions)." },
    option_c: { type: Type.STRING, description: "Option C text in Lao (or empty string for subjective questions)." },
    option_d: { type: Type.STRING, description: "Option D text in Lao (or empty string for subjective questions)." },
    correct_option: { type: Type.STRING, description: "The correct option (MUST be one of 'A', 'B', 'C', or 'D'). For subjective questions, set this to 'A'." },
    explanation: { type: Type.STRING, description: "A clear explanation of why this option is correct. For subjective questions, write the full correct answer detail." }
  },
  required: ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option", "explanation"]
};

const TestSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A suitable, professional title for the test in Lao language." },
    questions: {
      type: Type.ARRAY,
      items: QuestionSchema
    }
  },
  required: ["title", "questions"]
};

const DocumentMetadataSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING, description: "The educational subject of the document, e.g. ຄະນິດສາດ, ຟີຊິກສາດ, ເຄມີສາດ, ປະຫວັດສາດ, ພູມສາດ, ພາສາລາວ, ພາສາອັງກິດ, ຊີວະວິທະຍາ." },
    grade: { type: Type.STRING, description: "The grade level of the lesson, e.g. 'ມ.1' to 'ມ.7'." }
  },
  required: ["subject", "grade"]
};

function cleanJsonString(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (match) {
      cleaned = match[1].trim();
    }
  }
  return cleaned;
}

function getGeminiClient(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("ບໍ່ພົບ API Key ຂອງ Gemini. ກະລຸນາຕັ້ງຄ່າ API Key ໃນສ່ວນການຕັ້ງຄ່າ.");
  }
  return new GoogleGenAI({ apiKey: key });
}

export async function analyzeDocumentMetadata(contextText: string, apiKey?: string): Promise<{ subject: string; grade: string }> {
  try {
    const ai = getGeminiClient(apiKey);
    const sampleText = (contextText || "").substring(0, 8000);
    if (!sampleText.trim()) {
      return { subject: "ບົດຮຽນທົ່ວໄປ", grade: "ມ.7" };
    }

    const prompt = "Analyze the following document snippet. Determine the academic subject (e.g. Mathematics, Physics, Chemistry, Lao Language) and the grade level (e.g. ມ.1 to ມ.7). Return the structured JSON output.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, sampleText],
      config: {
        responseMimeType: "application/json",
        responseSchema: DocumentMetadataSchema,
        temperature: 0.1
      }
    });

    const data = JSON.parse(cleanJsonString(response.text || '{}'));
    return {
      subject: data.subject || "ບົດຮຽນທົ່ວໄປ",
      grade: data.grade || "ມ.7"
    };
  } catch (err: any) {
    console.error("Error analyzing document metadata:", err.message);
    return { subject: "ບົດຮຽນທົ່ວໄປ", grade: "ມ.7" };
  }
}

function buildPrompt(
  contextText: string,
  numQuestions: number,
  difficultyLao: string,
  questionType: string,
  customInstructions?: string,
  numOptions = 4,
  language = 'lao',
  numObjective?: number,
  numSubjective?: number
): string {
  const difficultyMap: Record<string, string> = {
    'easy': "Easy (ງ່າຍ) - Direct retrieval from the lesson text, simple definitions, and straightforward facts.",
    'medium': "Medium (ປານກາງ) - Requires understanding of the context, simple reasoning, or application of concepts from the lesson.",
    'hard': "Hard (ຍາກ) - Requires analysis, synthesis, evaluation, or multi-step problem solving based on the lesson text."
  };
  const difficultyDesc = difficultyMap[difficultyLao.toLowerCase()] || difficultyMap['medium'];

  let optionsInstruction = `Provide exactly ${numOptions} options for each question (option_a, option_b, option_c, option_d).`;
  if (numOptions === 3) {
    optionsInstruction = "Provide exactly 3 options for each question (option_a, option_b, option_c). Set option_d to an empty string \"\".";
  } else if (numOptions === 2) {
    optionsInstruction = "Provide exactly 2 options for each question (option_a, option_b). Set option_c and option_d to empty strings \"\".";
  }

  let formatInstructions = "";
  if (questionType === 'short_answer') {
    formatInstructions = `5. Format: Short Answer/Essay (Subjective) questions.
       * Options 'option_a', 'option_b', 'option_c', and 'option_d' MUST ALL be empty strings "".
       * The correct expected model answer MUST be provided inside the 'explanation' field (e.g. 'ຄຳຕອບທີ່ຖືກຕ້ອງແມ່ນ: [expected answer]').
       * 'correct_option' should be set to 'A' (as a placeholder).`;
  } else if (questionType === 'mixed') {
    if (numObjective !== undefined && numSubjective !== undefined) {
      formatInstructions = `5. Format: A mix of Multiple Choice (Objective) and Short Answer/Essay (Subjective) questions.
       * The first ${numObjective} questions MUST be Multiple Choice (options option_a, option_b, option_c, option_d are provided, and correct_option is one of A, B, C, or D).
       * The next ${numSubjective} questions MUST be Short Answer/Essay questions (options 'option_a', 'option_b', 'option_c', and 'option_d' MUST ALL be empty strings "", and the correct expected answer guidelines/description MUST be provided in the 'explanation' field).
       * 'correct_option' for Short Answer/Essay questions should be set to 'A' (as a placeholder).`;
    } else {
      formatInstructions = `5. Format: A mix of Multiple Choice (Objective) and Short Answer/Essay (Subjective) questions.
       * Roughly half of the questions should be Multiple Choice (options A, B, C, D are provided, and correct_option is one of A, B, C, or D).
       * The other half of the questions should be Short Answer/Essay questions (options 'option_a', 'option_b', 'option_c', and 'option_d' MUST ALL be empty strings "", and the correct expected answer guidelines/description MUST be provided in the 'explanation' field).
       * 'correct_option' for Short Answer/Essay questions should be set to 'A' (as a placeholder).`;
    }
  } else {
    formatInstructions = `5. Format: Standard multiple choice. ${optionsInstruction} Ensure there is only one correct answer.`;
  }

  const customInsClause = customInstructions ? `\n8. ADDITIONAL INSTRUCTIONS: You MUST adhere to these custom instructions: ${customInstructions}` : "";

  return `
    You are an expert curriculum designer and teacher.
    Generate a high-quality, professional test based strictly on the provided LESSON CONTEXT.
    
    RULES:
    1. Language: All content (title, question_text, options, explanation) MUST be in the Lao language.
    2. Factuality: Rely ONLY on the facts directly mentioned in the LESSON CONTEXT. Do not assume or extrapolate.
    3. Test Size: Generate exactly ${numQuestions} questions.
    4. Difficulty Level: The difficulty of the questions must be ${difficultyDesc}.
    ${formatInstructions}
    6. Explanations: Provide a clear and helpful explanation for why the correct option is right.
    7. LaTeX Formatting: For math, science, or technical topics, you MUST format all mathematical expressions, chemical formulas, equations, and technical variables using LaTeX. Use single dollar signs $...$ for inline equations (e.g. $y = mx + c$) and double dollar signs $$...$$ for block/centered equations. Ensure the LaTeX syntax is clean and standard.${customInsClause}
    
    LESSON CONTEXT:
    """${contextText}"""
  `;
}

function enforceQuestionFormat(data: any, questionType: string, numObjective?: number): any {
  const questions = data.questions || [];
  if (questions.length === 0) return data;

  let toBlank: any[] = [];
  if (questionType === 'short_answer') {
    toBlank = questions;
  } else if (questionType === 'mixed') {
    if (numObjective !== undefined) {
      toBlank = questions.slice(numObjective);
    } else {
      const midpoint = Math.floor(questions.length / 2);
      toBlank = questions.slice(midpoint);
    }
  }

  for (const q of toBlank) {
    q.option_a = "";
    q.option_b = "";
    q.option_c = "";
    q.option_d = "";
    q.correct_option = "A";
  }

  return data;
}

export async function generateTestQuestions(params: {
  modelName: string;
  contextText: string;
  numQuestions: number;
  difficultyLao: string;
  questionType: string;
  customInstructions?: string;
  numOptions?: number;
  language?: string;
  apiKeys: Record<string, string>;
  numObjective?: number;
  numSubjective?: number;
}): Promise<{ data: any; tokenCount: number }> {
  const {
    modelName,
    contextText,
    numQuestions,
    difficultyLao,
    questionType,
    customInstructions,
    numOptions = 4,
    language = 'lao',
    apiKeys,
    numObjective,
    numSubjective
  } = params;

  const prompt = buildPrompt(
    contextText,
    numQuestions,
    difficultyLao,
    questionType,
    customInstructions,
    numOptions,
    language,
    numObjective,
    numSubjective
  );

  if (modelName.startsWith('gemini')) {
    const ai = getGeminiClient(apiKeys.gemini);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: TestSchema,
        temperature: 0.3
      }
    });

    const text = response.text || '{}';
    let data = JSON.parse(cleanJsonString(text));
    data = enforceQuestionFormat(data, questionType, numObjective);

    const tokenCount = (response.usageMetadata?.promptTokenCount || 0) + (response.usageMetadata?.candidatesTokenCount || 0);
    return { data, tokenCount };
  } else if (modelName.startsWith('gpt')) {
    const key = apiKeys.openai || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("ບໍ່ພົບ API Key ຂອງ OpenAI.");
    }
    const openai = new OpenAI({ apiKey: key });
    const completion = await (openai.beta as any).chat.completions.parse({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'test_generation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question_text: { type: 'string' },
                    option_a: { type: 'string' },
                    option_b: { type: 'string' },
                    option_c: { type: 'string' },
                    option_d: { type: 'string' },
                    correct_option: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                    explanation: { type: 'string' }
                  },
                  required: ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation'],
                  additionalProperties: false
                }
              }
            },
            required: ['title', 'questions'],
            additionalProperties: false
          }
        }
      },
      temperature: 0.3
    });

    const parsed = completion.choices[0].message.parsed;
    const formatted = enforceQuestionFormat(parsed, questionType, numObjective);
    const tokenCount = completion.usage?.total_tokens || 0;
    return { data: formatted, tokenCount };
  } else if (modelName.startsWith('claude')) {
    const key = apiKeys.anthropic || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error("ບໍ່ພົບ API Key ຂອງ Anthropic.");
    }
    const anthropic = new Anthropic({ apiKey: key });
    const systemPrompt = "You are a curriculum designer. You must output ONLY a valid JSON object matching the requested schema. No markdown wrappers, no introductory text.";
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt + "\nOutput raw JSON conforming to {\"title\":\"...\",\"questions\":[{\"question_text\":\"...\",\"option_a\":\"...\",\"option_b\":\"...\",\"option_c\":\"...\",\"option_d\":\"...\",\"correct_option\":\"A/B/C/D\",\"explanation\":\"...\"}]}" }],
      temperature: 0.3
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '{}';
    let data = JSON.parse(cleanJsonString(textContent));
    data = enforceQuestionFormat(data, questionType, numObjective);
    const tokenCount = response.usage.input_tokens + response.usage.output_tokens;
    return { data, tokenCount };
  } else {
    throw new Error(`ບໍ່ຮອງຮັບໂມເດວ: ${modelName}`);
  }
}

export async function generateChatResponse(params: {
  chatHistory: any[];
  newMessage: string;
  contextText: string;
  apiKeys: Record<string, string>;
  modelName?: string;
}): Promise<string> {
  const { chatHistory, newMessage, contextText, apiKeys, modelName = 'gemini-2.5-flash' } = params;
  
  const systemInstruction = `
    You are an AI assistant helping a teacher study or create tests from a lesson.
    Answer the user's questions in the Lao language based strictly on the provided lesson context.
    If the answer is not in the context, politely state that you do not know.
    
    LESSON CONTEXT:
    """${contextText}"""
  `;

  if (modelName.startsWith('gemini')) {
    const ai = getGeminiClient(apiKeys.gemini);
    
    const contents: any[] = [];
    for (const msg of chatHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.5
      }
    });

    return response.text || '';
  } else {
    // OpenAI and other fallbacks
    const messages: any[] = [
      { role: 'system', content: systemInstruction }
    ];
    for (const msg of chatHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: 'user', content: newMessage });

    if (modelName.startsWith('gpt')) {
      const key = apiKeys.openai || process.env.OPENAI_API_KEY;
      if (!key) throw new Error("ບໍ່ພົບ API Key ຂອງ OpenAI.");
      const openai = new OpenAI({ apiKey: key });
      const completion = await openai.chat.completions.create({
        model: modelName,
        messages,
        temperature: 0.5
      });
      return completion.choices[0].message.content || '';
    } else if (modelName.startsWith('claude')) {
      const key = apiKeys.anthropic || process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("ບໍ່ພົບ API Key ຂອງ Anthropic.");
      const anthropic = new Anthropic({ apiKey: key });
      const response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 2048,
        system: systemInstruction,
        messages: messages.filter(m => m.role !== 'system'),
        temperature: 0.5
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } else {
      throw new Error(`ບໍ່ຮອງຮັບໂມເດວ: ${modelName}`);
    }
  }
}
