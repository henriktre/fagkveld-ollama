# Exercise 1: AI-Powered Trivia Quiz

**Time:** ~30-45 minutes  
**Difficulty:** Beginner to Intermediate

## Goal

Build a command-line trivia quiz that:

1. Generates trivia questions using an AI model
2. Captures user answers from the terminal
3. Uses AI to evaluate if answers are correct
4. Tracks and displays the final score

This exercise focuses on **prompt engineering** - the art of instructing AI models to perform specific tasks reliably.

---

## Setup

Make sure Ollama is running and you have a model pulled (e.g., `ollama pull gpt-oss:20b`).

Install dependencies:

```bash
npm install
```

Run the starter code (will show TODOs):

```bash
node index.js
```

---

## Your Tasks

### Task 1: Implement `generateQuestion(previous)`

Create a function that uses `ollama.chat()` to generate trivia questions.

**Requirements:**

- Use the `QUESTION_INSTRUCTION` as the system message
- Use `QUESTION_PROMPT(previous)` as the user message
- Return just the question text (extract from `response.message.content`)

**Tips:**

- Look at `exercise0/index.js` for `ollama.chat()` examples
- The `previous` array helps avoid repeating topics
- Test with simple prompts first, then refine

### Task 2: Implement `evaluateAnswer(question, userAnswer)`

Create a function that uses `ollama.chat()` to grade user answers.

**Requirements:**

- Use `EVALUATOR_INSTRUCTION` as the system message
- Use `EVALUATOR_PROMPT(question, userAnswer)` as the user message
- Ask Ollama for **structured output** by passing a JSON schema via the `format` option
- Parse and return the JSON response: `{correct: boolean, shortFeedback: string, modelAnswer: string}`

**Tips:**

- Structured outputs guarantee valid JSON, so prefer `format: { ... }`
- Read more: https://ollama.com/blog/structured-outputs
- If you skip structured outputs, you must safely extract and parse the JSON yourself
- Use `JSON.parse()` in a try/catch to surface helpful errors

### Task 3: Write Effective Prompts

Replace the placeholder instructions with clear, specific prompts.

**For QUESTION_INSTRUCTION:**

- Define the AI's role (e.g., "You are a trivia quiz master")
- Specify output format (e.g., "Return only the question text, no numbering")
- Set style guidelines (e.g., "General knowledge, avoid yes/no questions")

**For EVALUATOR_INSTRUCTION:**

- Define the grading role (e.g., "You are an impartial answer grader")
- Specify exact JSON format
- Provide grading rules (e.g., "Allow minor spelling errors")

---

## Example Prompt Structures

### Question Generation Prompt

```javascript
const QUESTION_INSTRUCTION = `You are a trivia quiz master.
Task: Generate ONE clear general knowledge trivia question.
Output Rules:
  - Only the question text
  - No numbering, no answers, no hints
  - Avoid repeating earlier topics listed by the user
Style:
  - Concise, neutral tone
  - Prefer not yes/no questions
  - Must end with a question mark`;
```

### Answer Evaluation Prompt

```javascript
const EVALUATOR_INSTRUCTION = `You are an impartial trivia answer grader.
Return ONLY JSON:
{"correct": boolean, "shortFeedback": "one short sentence", "modelAnswer": "concise expected answer"}
Guidelines:
  - Allow minor spelling mistakes / synonyms
  - If missing key detail -> correct = false
  - shortFeedback <= 12 words`;
```

---

## Testing Your Implementation

1. **Start simple:** Test with one question first
2. **Check question quality:** Are questions clear and answerable?
3. **Test evaluation:** Try correct answers, wrong answers, and partial answers
4. **Refine prompts:** Adjust based on what you see

---

## Common Issues

**Issue:** Questions are too vague or too specific  
**Fix:** Adjust the QUESTION_INSTRUCTION to be more specific about difficulty level

**Issue:** Evaluation is too strict or too lenient  
**Fix:** Update EVALUATOR_INSTRUCTION with clearer grading criteria

**Issue:** JSON parsing fails  
**Fix:** Use structured outputs (`format` option) to enforce correct JSON

---

## Extension Ideas

Once you have the basic version working:

- Add difficulty levels (easy/medium/hard)
- Implement multiple choice questions
- Track question categories
- Add a time limit for answers
- Save high scores to a file

---
