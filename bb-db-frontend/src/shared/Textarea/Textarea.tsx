import { Textarea as HeadlessTextarea, TextareaProps } from "@headlessui/react";
import clsx from "clsx";

interface Props extends TextareaProps {
  className?: string;
}

const Textarea = ({ className, ...props }: Props) => {
  return (
    <div className={clsx(className, "flex gap-2 bg-black/50 h-full")}>
      <HeadlessTextarea
        className={clsx(className, "outline-none w-full h-full resize-none overflow-auto")}
        {...props}
      />
    </div>
  );
}

export default Textarea;
