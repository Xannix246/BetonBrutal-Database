import DOMPurify from "dompurify";
import parser from "bbcode-to-react";

interface DescriptionProps {
  content?: string;
}

const DescriptionFormatter = ({ content }: DescriptionProps) => {
  if (!content) return null;

  const sanitized = DOMPurify.sanitize(content);
  const hasHTML = /<\/?[a-z][\s\S]*>/i.test(sanitized);
  const hasBBCode = /\[[a-z]+[\s\S]*?\]/i.test(sanitized);

  const baseClasses = "prose prose-invert max-w-none text-gray-300 text-2xl whitespace-pre-wrap";

  if (hasHTML) {
    return (
      <div
        className={baseClasses}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  } else if (hasBBCode) {
    return <div className={baseClasses}>{parser.toReact(sanitized)}</div>;
  } else {
    return <div className={baseClasses}>{sanitized}</div>;
  }
};

export default DescriptionFormatter;
