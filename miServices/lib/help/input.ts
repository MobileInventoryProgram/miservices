import { newKey } from '@/lib/documents/standard';
import { answerToBlocks } from './markup';
import { HELP_TOPICS } from './topics';

export interface HelpArticleInput {
  question: string;
  answer: string;
  topic: string;
  keywords: string[];
  isPublished: boolean;
  sources: { documentId: string; headingKey?: string; headingText?: string }[];
}

/** Tidy a submitted answer, or say what's wrong with it */
export function readHelpInput(body: Record<string, unknown>): { input: HelpArticleInput } | { error: string } {
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 200) : '';
  if (!question) return { error: 'Please write the question.' };
  const answer = typeof body.answer === 'string' ? body.answer.trim().slice(0, 5000) : '';
  if (!answer) return { error: 'Please write the answer.' };
  const topic = typeof body.topic === 'string' && HELP_TOPICS.some((t) => t.value === body.topic) ? body.topic : '';
  if (!topic) return { error: 'Please choose a topic.' };
  const keywords = Array.isArray(body.keywords)
    ? Array.from(new Set(body.keywords.filter((k): k is string => typeof k === 'string').map((k) => k.trim().slice(0, 60)).filter(Boolean))).slice(0, 20)
    : [];
  const sources = Array.isArray(body.sources)
    ? body.sources
        .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object' && typeof (s as Record<string, unknown>).documentId === 'string')
        .slice(0, 10)
        .map((s) => ({
          documentId: String(s.documentId),
          headingKey: typeof s.headingKey === 'string' && s.headingKey ? s.headingKey : undefined,
          headingText: typeof s.headingText === 'string' && s.headingText ? s.headingText.slice(0, 200) : undefined,
        }))
    : [];
  return { input: { question, answer, topic, keywords, isPublished: body.isPublished !== false, sources } };
}

/** The stored fields for an answer (shared with PATCH) */
export function helpArticleFields(input: HelpArticleInput) {
  return {
    question: input.question,
    answer: answerToBlocks(input.answer, `${newKey()}-`),
    topic: input.topic,
    keywords: input.keywords,
    isPublished: input.isPublished,
    sources: input.sources.map((s) => ({
      _type: 'helpSource',
      _key: newKey(),
      document: { _type: 'reference', _ref: s.documentId },
      ...(s.headingKey ? { headingKey: s.headingKey, headingText: s.headingText || '' } : {}),
    })),
  };
}
