import { Button as HeadlessButton, ButtonProps } from "@headlessui/react";
import clsx from "clsx";
import React from "react";
import { isClassic } from "@utils";

interface Props extends ButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button = ({ children, className, disabled, ...props }: Props) => {
  return (
    <HeadlessButton
      className={clsx(className, isClassic() ? "btn-classic-default hover:text-black" : "btn-default")}
      disabled={disabled}
      {...props}
    >
      {children}
    </HeadlessButton>
  );
}

export default Button;
