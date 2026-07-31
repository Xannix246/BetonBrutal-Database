import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import clsx from "clsx";
import { getDoc, getFiles } from "@store";

type Props = {
  document?: string;
  children?: React.ReactNode;
  className?: string;
};

const PreviewPanel = ({ document, children, className }: Props) => {
  const files = getFiles();
  const markdown = document || children?.toString() || getDoc();

  const objectUrls = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of files) {
      map.set(f.name, URL.createObjectURL(f));
    }
    return map;
  }, [files]);

  useMemo(() => {
    return () => {
      for (const url of objectUrls.values()) URL.revokeObjectURL(url);
    };
  }, [objectUrls]);

  return (
    <div className={clsx("prose prose-2xl max-w-none bg-black/80 p-6 text-white overflow-y-auto", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          img({ src, alt }) {
            if (!src) return null;
            const decodedSrc = decodeURIComponent(src);
            const actualSrc = objectUrls.get(decodedSrc) || src;
            return (
              <div className="w-full flex justify-center">
                <img src={actualSrc} alt={alt} className="xl:w-[50%]" />
              </div>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-300">
                {children}
              </blockquote>
            );
          },
          code({ children }) {
            return (
              <code className="bg-gray-800 text-white p-1 rounded">
                {children}
              </code>
            );
          },
          ul({ children }) {
            return (
              <ul className="list-disc pl-2">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ul className="list-disc pl-2">
                {children}
              </ul>
            );
          }
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
};

export default PreviewPanel;
