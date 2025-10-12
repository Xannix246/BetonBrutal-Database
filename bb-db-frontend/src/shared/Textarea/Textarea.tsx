import { Textarea as HeadlessTextarea, TextareaProps } from "@headlessui/react";
import clsx from "clsx";

interface Props extends TextareaProps {
  className: string;
}

const Textarea = ({ className, ...props }: Props) => {
  return (
    <HeadlessTextarea
      className={clsx(className, "")}
      {...props}
    />
  );
}

export default Textarea;
