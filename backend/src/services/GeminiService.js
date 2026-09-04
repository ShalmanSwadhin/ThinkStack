import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import ComingSoonError from '../utils/ComingSoonError.js';
import {
  COMING_SOON_MESSAGES,
  isGeminiComingSoon,
  shouldUseGeminiMock,
  warnGeminiNotConfigured,
} from '../utils/integrationStatus.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const useMockMode = () => shouldUseGeminiMock();

const mapMessagesToContents = (messages) =>
  messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

const extractResponseText = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? '').join('').trim();
};

const parseContextField = (block, field) => {
  const match = block.match(new RegExp(`- ${field}: ([^\\n]+)`));
  return match?.[1]?.trim() ?? null;
};

const parseContextBlock = (systemInstruction, label) => {
  const regex = new RegExp(`${label} context:([\\s\\S]*?)(?=\\n\\n|$)`);
  const match = systemInstruction?.match(regex);
  if (!match) return null;

  const block = match[1];
  const multiline = (field) =>
    block.match(new RegExp(`- ${field}: ([\\s\\S]*?)(?=\\n- |$)`))?.[1]?.trim() ?? null;

  return {
    title: parseContextField(block, 'Title'),
    slug: parseContextField(block, 'Slug'),
    difficulty: parseContextField(block, 'Difficulty'),
    category: parseContextField(block, 'Category'),
    description: multiline('Description'),
    constraints: multiline('Constraints'),
    introduction: multiline('Introduction'),
  };
};

const buildContextualMockReply = (lastUserMessage, systemInstruction) => {
  const problem = parseContextBlock(systemInstruction, 'Problem');
  const topic = parseContextBlock(systemInstruction, 'Topic');
  const lower = lastUserMessage.toLowerCase();

  const asksAboutProblem =
    problem &&
    (lower.includes('problem') ||
      lower.includes('this') ||
      lower.includes('hint') ||
      lower.includes('approach') ||
      lower.includes('solve'));

  if (asksAboutProblem) {
    return `## ${problem.title}

**Difficulty:** ${problem.difficulty} · **Slug:** \`${problem.slug}\`

${problem.description}

**Constraints:** ${problem.constraints || 'See problem statement'}

### How to approach
1. Read the input format and constraints carefully.
2. Identify the pattern — does it need iteration, a hash map, or math?
3. Write a brute-force solution first, then optimize if needed.
4. Test with edge cases (empty input, single element, negatives).

### Hint
Try breaking the problem into smaller steps. What data structure helps you track values you've already seen?

---
*Mock AI mode — add \`GEMINI_API_KEY\` to \`backend/.env\` and set \`GEMINI_MOCK=false\` for full Gemini tutoring.*`;
  }

  if (topic && (lower.includes('topic') || lower.includes('this') || lower.includes('explain'))) {
    return `## ${topic.title}

**Category:** ${topic.category} · **Difficulty:** ${topic.difficulty}

${topic.introduction || 'No introduction available for this topic.'}

### What to focus on
- Core definitions and when to use this technique
- Time and space complexity of common operations
- Practice with the visualizer and related problems

---
*Mock AI mode — add \`GEMINI_API_KEY\` to \`backend/.env\` and set \`GEMINI_MOCK=false\` for full Gemini tutoring.*`;
  }

  if (problem) {
    return `You're working on **${problem.title}** (\`${problem.slug}\`). Ask me to explain the problem, suggest an approach, or review your code.

---
*Mock AI mode — configure \`GEMINI_API_KEY\` in \`backend/.env\` for real Gemini responses.*`;
  }

  if (topic) {
    return `You're studying **${topic.title}**. Ask me to explain concepts, complexity, or interview questions for this topic.

---
*Mock AI mode — configure \`GEMINI_API_KEY\` in \`backend/.env\` for real Gemini responses.*`;
  }

  return null;
};

const mockGenerate = ({ messages, systemInstruction }) => {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';

  const contextual = buildContextualMockReply(lastUserMessage, systemInstruction);
  if (contextual) return contextual;

  return `Hi! I'm your DSA tutor. You asked: "${lastUserMessage.slice(0, 120)}${
    lastUserMessage.length > 120 ? '...' : ''
  }"

I can help with concept explanations, complexity analysis, hints, interview questions, and code review.

---
*Mock AI mode — get a free key at [Google AI Studio](https://aistudio.google.com/apikey), add it to \`backend/.env\` as \`GEMINI_API_KEY\`, set \`GEMINI_MOCK=false\`, and restart the server.*`;
};

export class GeminiService {
  isConfigured() {
    return Boolean(env.gemini.apiKey?.trim());
  }

  isComingSoon() {
    return isGeminiComingSoon();
  }

  isMockMode() {
    return useMockMode();
  }

  async generateChatResponse({ systemInstruction, messages }) {
    if (isGeminiComingSoon()) {
      warnGeminiNotConfigured();
      throw new ComingSoonError('Gemini', COMING_SOON_MESSAGES.gemini);
    }

    if (useMockMode()) {
      logger.info('Gemini mock mode: returning simulated tutor response');
      return mockGenerate({ messages, systemInstruction });
    }

    if (!env.gemini.apiKey) {
      warnGeminiNotConfigured();
      throw new ComingSoonError('Gemini', COMING_SOON_MESSAGES.gemini);
    }

    const url = `${GEMINI_API_BASE}/models/${env.gemini.model}:generateContent`;

    const payload = {
      contents: mapMessagesToContents(messages),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.gemini.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error('Gemini API error', { status: response.status, body });

      if (response.status === 429) {
        throw new AppError(
          'Gemini free-tier quota reached for this model. Try again later, switch GEMINI_MODEL to gemini-2.5-flash-lite in backend/.env, or check usage in Google AI Studio.',
          503
        );
      }

      if (response.status === 403) {
        throw new AppError(
          'Gemini access denied for this project or model. In AI Studio, check Dashboard → Rate limits, try a different model, or verify your region supports the free tier.',
          503
        );
      }

      throw new AppError('AI tutor is temporarily unavailable. Please try again.', 503);
    }

    const data = await response.json();
    const text = extractResponseText(data);

    if (!text) {
      throw new AppError('AI tutor returned an empty response. Please try again.', 502);
    }

    return text;
  }
}

export default new GeminiService();
