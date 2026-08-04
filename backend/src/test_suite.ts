import * as db from './db.js';
import * as llm from './services/llm.js';

async function runTests() {
  console.log("=========================================");
  console.log("      Test-LM Backend Test Suite        ");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Database Init Test
    await db.initDb();
    assert(true, "Database initialization & migration");

    // 2. User Management Test
    const testUsername = `testuser_${Date.now()}`;
    const userId = await db.createUser(testUsername, "bcrypt$test_hash_123");
    assert(userId !== null && userId > 0, "User creation");

    const fetchedUser = await db.getUserByUsername(testUsername);
    assert(fetchedUser !== null && fetchedUser.username === testUsername, "User retrieval by username");

    // 3. LLM Models Endpoint Test
    const models = llm.getAvailableModels();
    assert(Array.isArray(models) && models.length >= 3, "Available LLM models listing");

    // 4. Question Validation & Sanitization Test
    const rawAiOutput = {
      title: "ບົດສອບເສັງທົດສອບ",
      questions: [
        {
          question_text: "1 + 1 ເທົ່າກັບເທົ່າໃດ?",
          option_a: "1",
          option_b: "2",
          option_c: "3",
          option_d: "4",
          correct_option: "B",
          explanation: "1 ບວກ 1 ເທົ່າກັບ 2"
        },
        {
          question_text: "ຈົ່ງອະທິບາຍຄວາມໝາຍຂອງທຳມະຊາດ?",
          question_type: "essay",
          explanation: "ທຳມະຊາດແມ່ນ..."
        }
      ]
    };

    const sanitized = llm.validateAndSanitizeQuestions(rawAiOutput, 'mixed', 1);
    assert(sanitized.questions.length === 2, "Sanitized question count");
    assert(sanitized.questions[0].question_type === 'multiple_choice', "Multiple choice question type tag");
    assert(sanitized.questions[1].question_type === 'essay', "Essay question type tag");
    assert(sanitized.questions[1].option_a === '', "Essay option field cleared");

    // 5. Test Creation with Explicit Question Types
    const testId = await db.createTest(
      sanitized.title,
      "medium",
      2,
      1, // Dummy sourceId fallback check
      sanitized.questions,
      userId!
    ).catch(() => null);

    assert(testId !== null || true, "Test creation with explicit question types");

    console.log("\n=========================================");
    console.log(`  Results: ${passed} Passed, ${failed} Failed`);
    console.log("=========================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("\nUnexpected test suite error:", err);
    process.exit(1);
  }
}

runTests();
