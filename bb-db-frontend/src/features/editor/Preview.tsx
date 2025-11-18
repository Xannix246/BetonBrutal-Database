import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import { getDoc, getFiles } from "../../store/store";

const PreviewPane = ({ document }: { document?: string }) => {
  const files = getFiles();
  const markdown = document || getDoc();

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
    <div className="prose prose-2xl max-w-none bg-black/80 p-6 text-white min-h-screen overflow-y-auto">
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

export default PreviewPane;
