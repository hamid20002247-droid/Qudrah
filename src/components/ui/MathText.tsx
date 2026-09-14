"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { useMemo } from "react";

/** Renders Arabic text; segments wrapped in $...$ become KaTeX. */
export function MathText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const parts = useMemo(() => {
    const re = /\$([^$]+)\$/g;
    const out: { type: "text" | "math"; value: string }[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) {
        out.push({ type: "text", value: text.slice(last, m.index) });
      }
      out.push({ type: "math", value: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    if (out.length === 0) out.push({ type: "text", value: text });
    return out;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : (
          <span
            key={i}
            className="inline-block px-0.5"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(p.value, {
                throwOnError: false,
                displayMode: false,
              }),
            }}
          />
        )
      )}
    </span>
  );
}
