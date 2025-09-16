// Prompt template strings and builders
export const PROMPT_SYSTEM_QUESTION_BASE = `You are a trivia quiz master.
Task: Generate ONE clear general knowledge trivia question.
Output Rules:
  - Only the question text
  - No numbering, no answers, no hints
  - Avoid repeating earlier topics listed by the user
Style:
  - Concise, neutral tone
  - Prefer not yes/no questions
  - Must end with a question mark
`;

export const PROMPT_USER_QUESTION = (n, prev) => {
  if (prev.length === 0)
    return `Generate question #${n}. Only the question text.`;
  const lines = prev.map((q, i) => ` - ${i + 1}. ${q}`);
  return `All previous questions (avoid similar topics):\n${lines.join(
    "\n"
  )}\n\nGenerate question #${n}. Only the question text.`;
};

export const PROMPT_SYSTEM_EVAL = `You are an impartial trivia answer grader.
Return ONLY JSON:
{"correct": boolean, "shortFeedback": "one short sentence", "modelAnswer": "concise expected answer"}
Guidelines:
  - Allow minor spelling mistakes / synonyms
  - If missing key detail -> correct = false
  - shortFeedback <= 12 words
`;

export const PROMPT_USER_EVAL = (q, a) =>
  `Question: ${q}\nPlayer answer: ${a}\nReturn ONLY the JSON.`;
