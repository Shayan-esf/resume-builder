import React from "react";

interface RichTextProps {
  text: string;
  strongClassName?: string;
}

/**
 * Renders inline **bold** markdown segments safely as <strong> elements.
 */
export function RichText({
  text,
  strongClassName = "text-slate-900 font-semibold",
}: RichTextProps) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={idx} className={strongClassName}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}
