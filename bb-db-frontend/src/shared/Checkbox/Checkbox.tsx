import { isClassic } from "@/utils";
import { Checkbox as HeadlessCheckbox } from "@headlessui/react";
import clsx from "clsx";

type Props = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

const Checkbox = ({ enabled, setEnabled }: Props) => {
  return (
    <HeadlessCheckbox
      checked={enabled}
      onChange={setEnabled}
      className={clsx("group flex aspect-square items-center justify-center",
        isClassic()
          ? "size-5 rounded-full border-2 border-white"
          : "size-8 border-3 border-[#fdeece] outline-none cursor-pointer"
      )}
    >
      <span className={clsx("invisible size-3 group-data-checked:visible",
        isClassic()
          ? "bg-gradient-to-br from-white to-classic-yellow-200 rounded-full"
          : "invisible bg-[#fdeece]"
      )} />
    </HeadlessCheckbox>
  );
}

export default Checkbox;
