# Subjective Questions (ພາກອັດຕະໄນ) & Dotted Answer Lines Toggle

Support subjective/essay questions alongside multiple choice. Subjective questions will automatically render under a "Section II. Written Part" (II. ພາກອັດຕະໄນ) and display customizable dotted lines for writing answers, with a toggle toolbar to control their visibility.

## User Review Required

> [!IMPORTANT]
> **Coexistence of Both Formats**: A single test paper can contain **both** multiple choice questions and subjective questions at the same time. The app will automatically split them:
> 1. **Section I. Objective Part** (I. ພາກປາລະໄນ) - Standard multiple choice and True/False questions.
> 2. **Section II. Written Part** (II. ພາກອັດຕະໄນ) - Essay/short answer questions with dotted lines.
>
> **Questions Classification**: We classify questions as **Subjective** (ອັດຕະໄນ) if their options (A, B, C, D) are all saved as empty strings (`""`). The correct answer is stored in the `explanation` (ຄຳອະທິບາຍ) field.

## Proposed Changes

### Backend — [MODIFY] [app.py](file:///c:/Users/idea/Downloads/Code/test-lm/app.py)

1. **Word Document Export (`generate_docx_file`)**:
   - Check if a question is subjective (all options are empty).
   - If subjective: Instead of option letters, write 3 rows of dotted lines (`....................................................................`).
   - On the Answer Key page: Instead of option letters (A, B, etc.), print the model answer directly as the answer guidelines.

---

### Frontend — [MODIFY] [App.jsx](file:///c:/Users/idea/Downloads/Code/test-lm/frontend/src/App.jsx)

1. **New state: `dottedLines`**
   - Stores the number of dotted lines to render under subjective questions (can be `0` (hidden), `3` lines, or `5` lines).
   - Stores default Lao instruction text for subjective questions: `previewSubjInstructions` (defaults to "ຈົ່ງຕອບຄຳຖາມລຸ່ມນີ້ໃສ່ບ່ອນວ່າງ:").

2. **Action Toolbar additions**:
   - Add a button/selector chip: `ເສັ້ນຂຽນ: [ປິດ / 3 ແຖວ / 5 ແຖວ]` to toggle `dottedLines` value.

3. **Separate Sections on Exam Paper**:
   - Partition `activeTest.questions` into objective and subjective questions list.
   - If objective questions exist: Render Section I title, instructions, and standard objective question layouts.
   - If subjective questions exist: Render Section II title (`II. ພາກອັດຕະໄນ`), score placeholder (`ຄະແນນພາກອັດຕະໄນ ....................`), subjective instructions, and subjective questions list.
   - For subjective questions:
     - Only render question text (no options grid).
     - Render `{dottedLines}` rows of dotted lines under the question text.
     - If "Show Answers" (`showExp`) is enabled, display the model answer/explanation in a subtle box.

4. **Add/Edit Question Dialog**:
   - Add a question type selector: `ປາລະໄນ (Multiple Choice)` or `ອັດຕະໄນ (Short Answer/Essay)`.
   - If `ອັດຕະໄນ` is selected: Hide the A, B, C, D options input grid and the correct option dropdown. Save them as empty strings (`""`) on save.

---

### Frontend — [MODIFY] [index.css](file:///c:/Users/idea/Downloads/Code/test-lm/frontend/src/index.css)

1. **Dotted lines styling**:
   - Add styling for subjective dotted lines: height, margin, and dotted border bottom.
   - Add section header and instruction layout rules for the subjective section.

## Verification Plan

### Manual Verification
1. Open the app and generate or add a subjective question to a multiple-choice test.
2. Verify that both Section I (Multiple choice) and Section II (Subjective) appear simultaneously.
3. In the preview toolbar, click `ເສັ້ນຂຽນ: 3 ແຖວ` to switch between 0 lines, 3 lines, and 5 lines. Verify they appear/change/disappear instantly.
4. Toggle "Show Answers" (eye icon) and verify the subjective answer keys appear/disappear correctly.
5. Export to Word (docx) and verify that the Word document correctly splits the objective and subjective questions and outputs the dotted lines.
