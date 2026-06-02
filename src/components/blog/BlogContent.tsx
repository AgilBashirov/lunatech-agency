/**
 * BlogContent — renders markdown post body via react-markdown.
 *
 * Server component. rehype-raw is intentionally NOT used to prevent XSS.
 * Custom components apply project-consistent typography styles.
 */

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type Props = {
  content: string;
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-6 mt-10 text-3xl font-bold leading-tight text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-8 text-2xl font-semibold leading-snug text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-6 text-xl font-semibold text-white">{children}</h3>
  ),
  p: ({ children }) => (
    <p
      className="mb-5 leading-relaxed"
      style={{ color: "rgba(244,244,245,0.75)" }}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul
      className="mb-5 list-disc pl-6 leading-relaxed"
      style={{ color: "rgba(244,244,245,0.75)" }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className="mb-5 list-decimal pl-6 leading-relaxed"
      style={{ color: "rgba(244,244,245,0.75)" }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote
      className="my-6 border-l-4 pl-4 italic"
      style={{
        borderColor: "rgba(255,255,255,0.15)",
        color: "rgba(244,244,245,0.55)",
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    // Inline code vs fenced block — react-markdown passes className for fenced
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code
          className={`block overflow-x-auto rounded-lg px-4 py-3 text-sm font-mono leading-relaxed ${className ?? ""}`}
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(244,244,245,0.85)",
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded px-1.5 py-0.5 text-sm font-mono"
        style={{
          background: "rgba(255,255,255,0.08)",
          color: "rgba(244,244,245,0.85)",
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-5 overflow-x-auto rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 transition-colors duration-200"
      style={{ color: "rgba(244,244,245,0.8)" }}
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="my-6 w-full rounded-xl object-cover"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      loading="lazy"
    />
  ),
  hr: () => (
    <hr className="my-8" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
  ),
};

export function BlogContent({ content }: Props) {
  return (
    <div className="w-full max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
