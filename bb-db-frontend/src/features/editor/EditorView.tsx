/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { formatText } from "./utils";
import { $files, getDoc, setDoc, setFiles } from "../../store/store";

const EditorViewComponent = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const value = getDoc();

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      });
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        markdown(),
        oneDark,
        EditorView.theme({
          "&": {
            backgroundColor: "transparent !important",
            minHeight: "100vh",
            whiteSpace: "pre-wrap",
            padding: "16px",
          },
        }),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) setDoc(update.state.doc.toString());
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    const handleFormat = (e: any) => {
      formatText(e.detail, view);
    };
    window.addEventListener("editor-format", handleFormat);

    return () => {
      window.removeEventListener("editor-format", handleFormat);
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const editorEl = editorRef.current;
    if (!editorEl) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = $files.get();
      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      const imageFiles = droppedFiles.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      console.log(files, imageFiles);
      setFiles([...files, ...imageFiles]);

      const view = viewRef.current;
      if (!view) return;
      const markdownImages = imageFiles
        .map((f) => {
          const encodedName = encodeURIComponent(f.name);
          return `![${f.name}](${encodedName})`;
        })
        .join("\n");

      view.dispatch({
        changes: { from: view.state.selection.main.from, insert: markdownImages },
      });
    };

    editorEl.addEventListener("drop", handleDrop);
    return () => editorEl.removeEventListener("drop", handleDrop);
  }, []);

  return (
    <div
      ref={editorRef}
      className="flex-1 bg-black/80 text-xl text-white min-h-screen w-full outline-none"
    />
  );
};

export default EditorViewComponent;
