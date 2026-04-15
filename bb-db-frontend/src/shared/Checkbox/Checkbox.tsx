import { Checkbox as HeadlessCheckbox } from "@headlessui/react";

type Props = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
}

const Checkbox = ({ enabled, setEnabled }: Props) => {
  return (
    <HeadlessCheckbox
      checked={enabled}
      onChange={setEnabled}
      className="group flex size-8 items-center justify-center border-3 border-[#fdeece] outline-none aspect-square cursor-pointer"
    >
      <span className="invisible size-4 bg-[#fdeece] group-data-checked:visible" />
    </HeadlessCheckbox>
  );
}

export default Checkbox;
