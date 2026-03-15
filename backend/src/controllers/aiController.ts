import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export const chatWithAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages, lessonContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const systemContent = lessonContext
      ? `${SYSTEM_PROMPT}\n\nCurrent lesson context:\n${lessonContext}`
      : SYSTEM_PROMPT;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        ...messages.slice(-20) // Keep last 20 messages for context
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'I could not generate a response.';
    res.json({ success: true, reply });
  } catch (error: any) {
    if (error.code === 'insufficient_quota' || error.status === 429) {
      res.status(429).json({ error: 'AI service is temporarily unavailable. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
    }
  }
};

export const summarizeLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, title } = req.body;

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
    res.status(500).json({ error: 'Failed to summarize: ' + error.message });
  }
};

export const generateQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, title, count = 5 } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate multiple choice quiz questions in JSON format.' },
        {
          role: 'user',
          content: `Generate ${count} multiple choice questions for the lesson "${title}". 
          Return a JSON array with this structure:
          [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]
          
          Lesson content: ${content.substring(0, 2000)}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const raw = response.choices[0]?.message?.content || '{"questions":[]}';
    const parsed = JSON.parse(raw);
    const questions = parsed.questions || parsed;

    res.json({ success: true, questions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate questions: ' + error.message });
  }
};

export const explainTopic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, level = 'intermediate' } = req.body;

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
    res.status(500).json({ error: 'Failed to explain topic: ' + error.message });
  }
};
