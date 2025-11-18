import { Field, Label, Radio, RadioGroup as RGroup } from "@headlessui/react";
import clsx from "clsx";

type Props = {
  label: string;
  items: string[];
  selected: string;
  setSelected: (value: string) => void;
}

const RadioGroup = ({
  label,
  items = ["default"],
  selected = items[0],
  setSelected,
}: Props) => {
  return (
    <RGroup 
      value={selected} 
      onChange={setSelected} 
      aria-label={label}
    >
      {items.map((item) => (
        <Field key={item} className="flex items-center gap-4 transition duration-300 hover:bg-white/10 p-1 w-full">
          <Radio
            value={item}
            className="group flex size-8 items-center justify-center border-3 border-[#fdeece] outline-none"
          >
            <span className="invisible size-4 bg-[#fdeece] group-data-checked:visible" />
          </Radio>
          <Label className={clsx(
            "text-2xl w-[80%]",
            "transition duration-300",
            selected === item && "text-green"
          )}>{item}</Label>
        </Field>
      ))}
    </RGroup>
  );
}

export default RadioGroup;
