import type { HelpTopic } from '../../../lib/help/topics';

/**
 * A starter Help Centre answer. Seeded by scripts/seed-help-articles.ts.
 *
 * answer: short paragraphs. A paragraph made only of lines starting "- " becomes
 * a bullet list. **bold** is supported. No links (sources are linked separately).
 */
export interface SeedHelpArticle {
  /** Stable, unique kebab-case id, e.g. "holiday-entitlement" (becomes helpArticle-<id>) */
  id: string;
  topic: HelpTopic;
  /** The question as a franchisee would ask it */
  question: string;
  answer: string[];
  /** Extra words people might search for that aren't in the question */
  keywords: string[];
  /**
   * Where the answer comes from. doc = document slug; heading = the EXACT text of an
   * "## " or "### " heading in that document (copied character for character), or
   * omitted to link the whole document. Empty for "Using the Members Area" answers.
   */
  sources: { doc: string; heading?: string; /** Which one, when a heading appears more than once (1 = first) */ occurrence?: number }[];
}
