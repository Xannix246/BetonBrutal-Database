import { Input as HeadlessInput, InputProps } from "@headlessui/react";
import clsx from "clsx";
import { JSX } from "react";
import { isClassic } from "@utils";

interface Props extends InputProps {
  className?: string;
  placeholder: string;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
}

const Input = ({ className, placeholder, leftIcon, rightIcon, ...props }: Props) => {
  return (
    <div className={clsx(className, isClassic() ? "bg-white rounded-[3px] border-1 border-[#043972]" : "flex gap-2 bg-black/50")}>
      {leftIcon}
      <HeadlessInput
        className={clsx(
          isClassic()
            ? "outline-none w-full"
            : "outline-none text-white w-full p-2",
          props.disabled && "cursor-not-allowed"
        )}
        placeholder={placeholder}
        autoComplete="off"
        {...props}
      />
      {rightIcon}
    </div>
  );
}

export default Input;