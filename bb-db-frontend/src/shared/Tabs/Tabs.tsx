import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";
import { JSX } from "react";

type CustomData = {
  type: "customData";
  elements: JSX.Element[];
};

type TextData = {
  type: "textData";
  content?: string;
};

export type Categories = {
  name: string;
  data: CustomData | TextData;
  panelClassName?: string;
};

type Tabs = {
  categories: Categories[];
};

export const Tabs = ({ categories }: Tabs) => {
  return (
    <div className="flex flex-col h-full w-full justify-center">
      <TabGroup>
        <TabList className="flex gap-2 sm:gap-4 border-b-2 border-white/20 pb-2">
          {categories.map(({ name }) => (
            <Tab
              key={name}
              className={clsx(
                "px-5 py-2.5 md:text-xl font-black uppercase tracking-wide transition-all outline-none cursor-pointer",
                "data-[selected]:bg-yellow data-[selected]:text-black data-[selected]:border-[#ffd884]",
                "data-[not-selected]:bg-black/40",
              )}
            >
              {name}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-4 w-full">
          {categories.map((category, i) =>
            category.data.type === "customData" ? (
              <TabPanel
                key={i}
                className={clsx(
                  category.panelClassName,
                  "w-full focus:outline-none",
                )}
              >
                {category.data.elements}
              </TabPanel>
            ) : (
              <TabPanel
                key={i}
                className={clsx(
                  category.panelClassName,
                  "w-full focus:outline-none",
                )}
              >
                <div className="text-zinc-300">
                  {category.data.content}
                </div>
              </TabPanel>
            ),
          )}
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default Tabs;
