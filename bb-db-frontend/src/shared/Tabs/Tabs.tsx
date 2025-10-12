import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { JSX } from 'react';

type CustomData = { 
  type: "customData";
  elements: JSX.Element[] }

type TextData = {
  type: "textData";
  // ...
}

type Categories = {
  name: string;
  data: CustomData | TextData;
  panelClassName?: string;
}

type Props = {
  categories: Categories[];
}

const Tabs = ({ categories }: Props) => {
  return (
    <div className="flex flex-col h-full w-full justify-center">
        <TabGroup>
          <TabList className="flex gap-4">
            {categories.map(({ name }) => (
              <Tab
                key={name}
                className=""
              >
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-3">
            {categories.map((category, i) => (
              category.data.type === "customData" ?
              <TabPanel 
                key={i}
                className={clsx(category.panelClassName, "")}
              >
                {category.data.elements}
              </TabPanel>
              :
              <TabPanel 
                key={i}
                className={clsx(category.panelClassName, "")}
              >
                {/* ... */}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
    </div>
  );
}

export default Tabs;
