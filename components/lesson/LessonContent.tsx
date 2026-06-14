import ReactMarkdown, { type Components } from "react-markdown";
import { NumericExample } from "@/components/lesson/NumericExample";

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-8 text-2xl font-bold text-text-primary">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 text-lg font-bold text-text-primary">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-base font-bold text-text-primary">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-text-primary">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed text-text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

const numericMarkdownComponents: Components = {
  ...markdownComponents,
  p: ({ children }) => (
    <p className="mt-4 text-sm leading-relaxed text-text-primary first:mt-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-relaxed text-text-primary first:mt-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-text-primary first:mt-0">
      {children}
    </ol>
  ),
};

/** Titolo della sezione "Esempio pratico" presente in ogni lezione. */
const EXAMPLE_HEADING = "## Esempio pratico";

interface LessonSections {
  before: string;
  example: string | null;
  after: string;
}

/**
 * Isola la sezione "## Esempio pratico" dal resto del contenuto, in modo
 * che il suo corpo possa essere renderizzato in un blocco NumericExample
 * dedicato, senza dover toccare il Markdown delle lezioni.
 */
function splitLessonContent(content: string): LessonSections {
  const startIdx = content.indexOf(EXAMPLE_HEADING);
  if (startIdx === -1) {
    return { before: content, example: null, after: "" };
  }

  const bodyStart = startIdx + EXAMPLE_HEADING.length;
  const nextHeadingOffset = content.slice(bodyStart).search(/\n##\s/);
  const bodyEnd = nextHeadingOffset === -1 ? content.length : bodyStart + nextHeadingOffset;

  return {
    before: content.slice(0, bodyStart),
    example: content.slice(bodyStart, bodyEnd).trim(),
    after: content.slice(bodyEnd),
  };
}

interface LessonContentProps {
  content: string;
}

/**
 * Renderer Markdown del contenuto testuale di una lezione. La sezione
 * "Esempio pratico" viene renderizzata in un blocco NumericExample
 * dedicato (font monospace).
 */
export function LessonContent({ content }: LessonContentProps) {
  const { before, example, after } = splitLessonContent(content);

  return (
    <div className="mt-6">
      <ReactMarkdown components={markdownComponents}>{before}</ReactMarkdown>
      {example && (
        <NumericExample>
          <ReactMarkdown components={numericMarkdownComponents}>{example}</ReactMarkdown>
        </NumericExample>
      )}
      <ReactMarkdown components={markdownComponents}>{after}</ReactMarkdown>
    </div>
  );
}
