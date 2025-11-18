import { EyeIcon, PencilIcon, ItalicIcon, LinkIcon, CodeBracketIcon, ChevronRightIcon, ListBulletIcon } from "@heroicons/react/24/solid";
import Button from "../../shared/Button/Button";

type format = "bold" | "italic" | "link" | "code" | "quote" | "ul";

type Props = {
  preview: boolean;
  onTogglePreview: () => void;
  onFormat: (value: format) => void;
}

const EditorToolbar = ({ preview, onTogglePreview, onFormat }:  Props) => {
  return (
    <div className="flex h-12 bg-white/30 w-full z-20 justify-center items-center gap-3 px-4">
      {/* <Button className="p-1" onClick={() => onFormat("bold")}><BoldIcon width={24} /></Button> */}
      <Button className="p-1" onClick={() => onFormat("italic")}><ItalicIcon width={24} /></Button>
      <Button className="p-1" onClick={() => onFormat("link")}><LinkIcon width={24} /></Button>
      <Button className="p-1" onClick={() => onFormat("code")}><CodeBracketIcon width={24} /></Button>
      <Button className="p-1" onClick={() => onFormat("quote")}><ChevronRightIcon width={24} /></Button>
      <Button className="p-1" onClick={() => onFormat("ul")}><ListBulletIcon width={24} /></Button>

      <div className="flex-1" />
      <Button className="p-1" onClick={onTogglePreview}>
        {preview ? <PencilIcon width={24} /> : <EyeIcon width={24} />}
      </Button>
    </div>
  );
};

export default EditorToolbar;
