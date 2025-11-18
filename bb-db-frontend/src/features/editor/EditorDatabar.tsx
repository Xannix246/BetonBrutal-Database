import { useEffect, useRef, useState } from "react";
import Container from "../../shared/Containter/Container";
import Input from "../../shared/Input/Input";
import { MinusIcon } from "@heroicons/react/24/outline";

type Props = {
  preview: File | null;
  setPreview: (file: File | null) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
}

const EditorDatabar = ({ preview, setPreview, tags, setTags }: Props) => {
  const [value, setValue] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dropEl = dropRef.current;
    if (!dropEl) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      const imageFiles = droppedFiles.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      setPreview(imageFiles[0]);
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    dropEl.addEventListener("drop", handleDrop, { passive: false });
    window.addEventListener("dragover", handleWindowDragOver, { passive: false });
    window.addEventListener("drop", handleWindowDrop, { passive: false });

    return () => {
      dropEl.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);


  const handleTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value !== "" && !tags.includes(value) && value.length <= 20) {
      if (tags.length >= 3) return;
      setTags([...tags, value]);
      setValue("");
    }
  }

  return (
    <Container className="flex flex-col text-white place-items-center p-4 gap-16 bg-black/80 min-w-[250px] max-w-[250px] h-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="text-xl font-bold mb-2">PREVIEW</div>
        <div
          className="min-h-32 w-full bg-white/10 flex justify-center place-items-center"
          ref={dropRef}
        >
          {!preview ? <h4>DROP IMAGE HERE</h4>
            :
            <img
              src={URL.createObjectURL(preview)}
              alt={preview.name}
              className="w-full object-cover"
            />
          }
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <div className="text-xl font-bold mb-2">TAGS</div>
        <Input
          placeholder="Add tag (3 tags max)"
          className="text-xl bg-white/10"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => handleTag(e)}
        />
        <div className="text-xl text-gray-400 grid gap-2">
          {tags.map((tag, i) => (
            <div key={i} className="flex gap-1 group">
              <MinusIcon
                width={24}
                className="hover:text-pink opacity-0 group-hover:text-white group-hover:opacity-100 transition duration-300 cursor-pointer group"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
              />
              {tag.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

export default EditorDatabar;