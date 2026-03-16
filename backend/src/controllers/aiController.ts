import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `You are an expert AI tutor for School OS, an educational platform.
Your role is to:
- Explain complex topics in simple, engaging ways
- Answer student questions clearly and helpfully
- Generate practice questions when asked
- Provide hints without giving away answers
- Encourage and motivate students
- Adapt your explanation level to the student's needs
Keep responses concise but comprehensive. Use examples and analogies when helpful.
Format responses with markdown when appropriate.`;

const isOpenAIConfigured = (): boolean => {
  const apiKey = process.env.OPENAI_API_KEY;
  return Boolean(apiKey && apiKey.startsWith('sk-') && !apiKey.includes('placeholder'));
};

const getOpenAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
};

const fallbackTutorReply = (question: string, lessonContext?: string): string => {
  const contextSnippet = (lessonContext || '').slice(0, 500);
  return [
    'AI Tutor (local mode):',
    '',
    `You asked: "${question || 'No question provided'}"`,
    '',
    'Here is a clear way to approach it:',
    '1. Identify the key concept from the lesson.',
    '2. Break the problem into smaller steps.',
    '3. Solve one step at a time and check your result.',
    '',
    contextSnippet ? `Lesson hint: ${contextSnippet}` : 'Lesson hint: focus on the lesson definitions and examples first.',
    '',
    'If you want, I can also generate 3 quick practice questions on this topic.'
  ].join('\n');
};

const fallbackSummary = (title: string, content: string): string => {
  const lines = content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);

  const bullets = lines.length
    ? lines.map((line) => `- ${line}`).join('\n')
    : '- Review the definitions\n- Practice with examples\n- Check your understanding with quiz questions';

  return `Summary for "${title}":\n${bullets}`;
};

const fallbackQuestions = (title: string, count = 5) => {
  const safeCount = Math.max(1, Math.min(10, Number(count) || 5));
  return Array.from({ length: safeCount }, (_, i) => ({
    question: `${title}: Practice question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: i % 4,
    explanation: 'Use the lesson concept and eliminate incorrect choices step by step.'
  }));
};

const fallbackExplanation = (topic: string, level: string): string => {
  return [
    `Topic: ${topic}`,
    `Level: ${level}`,
    '',
    `${topic} can be understood as a set of rules and patterns.`,
    'Start with a simple definition, then solve one easy example, and finally try a similar problem yourself.',
    '',
    'Practical tip: explain the concept in your own words in 2-3 sentences and test it with one mini-exercise.'
  ].join('\n');
};

const isRecoverableAIError = (error: any): boolean => {
  return (
    error?.status === 401 ||
    error?.status === 429 ||
    error?.code === 'invalid_api_key' ||
    error?.code === 'insufficient_quota' ||
    error?.code === 'rate_limit_exceeded'
  );
};

export const chatWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages, lessonContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const lastUserMessage = (messages as ChatMessage[])
      .filter((m) => m.role === 'user')
      .at(-1)?.content || '';

    if (!isOpenAIConfigured()) {
      res.json({ success: true, reply: fallbackTutorReply(lastUserMessage, lessonContext) });
      return;
    }

    const openai = getOpenAIClient();
    const systemContent = lessonContext
      ? `${SYSTEM_PROMPT}\n\nCurrent lesson context:\n${lessonContext}`
      : SYSTEM_PROMPT;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        ...(messages.slice(-20) as ChatMessage[])
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'I could not generate a response.';
    res.json({ success: true, reply });
  } catch (error: any) {
    if (isRecoverableAIError(error)) {
      const lastUserMessage = (req.body?.messages || [])
        .filter((m: ChatMessage) => m.role === 'user')
        .at(-1)?.content || '';
      res.json({ success: true, reply: fallbackTutorReply(lastUserMessage, req.body?.lessonContext) });
      return;
    }

    res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
  }
};

export const summarizeLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content = '', title = 'Lesson' } = req.body;

    if (!isOpenAIConfigured()) {
      res.json({ success: true, summary: fallbackSummary(title, content) });
      return;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at summarizing educational content.' },
        {
          role: 'user',
          content: `Please summarize the following lesson "${title}" in 3-5 key points:\n\n${content}`
        }
      ],
      max_tokens: 500,
      temperature: 0.5
    });

    const summary = response.choices[0]?.message?.content || 'Could not generate summary.';
    res.json({ success: true, summary });
  } catch (error: any) {
    if (isRecoverableAIError(error)) {
      const { content = '', title = 'Lesson' } = req.body;
      res.json({ success: true, summary: fallbackSummary(title, content) });
      return;
    }
    res.status(500).json({ error: 'Failed to summarize: ' + error.message });
  }
};

export const generateQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content = '', title = 'Lesson', count = 5 } = req.body;

    if (!isOpenAIConfigured()) {
      res.json({ success: true, questions: fallbackQuestions(title, count) });
      return;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate multiple choice quiz questions in JSON format.' },
        {
          role: 'user',
          content: `Generate ${count} multiple choice questions for the lesson "${title}".
Return a JSON object with this structure:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]}

Lesson content: ${String(content).substring(0, 2000)}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const raw = response.choices[0]?.message?.content || '{"questions":[]}';
    const parsed = JSON.parse(raw);
    const questions = parsed.questions || [];

    res.json({ success: true, questions });
  } catch (error: any) {
    if (isRecoverableAIError(error)) {
      const { title = 'Lesson', count = 5 } = req.body;
      res.json({ success: true, questions: fallbackQuestions(title, count) });
      return;
    }
    res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
};

export const explainTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic = 'Topic', level = 'intermediate' } = req.body;

    if (!isOpenAIConfigured()) {
      res.json({ success: true, explanation: fallbackExplanation(topic, level) });
      return;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Explain "${topic}" at a ${level} level with a practical example. Format with markdown.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const explanation = response.choices[0]?.message?.content || 'Could not generate explanation.';
    res.json({ success: true, explanation });
  } catch (error: any) {
    if (isRecoverableAIError(error)) {
      const { topic = 'Topic', level = 'intermediate' } = req.body;
      res.json({ success: true, explanation: fallbackExplanation(topic, level) });
      return;
    }
    res.status(500).json({ error: 'Failed to explain topic: ' + error.message });
  }
};
