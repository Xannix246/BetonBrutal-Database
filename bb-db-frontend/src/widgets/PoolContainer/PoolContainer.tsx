import { motion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, Tabs } from "@shared";
import { PreviewPanel } from "@features";
import { VotingDataContent } from "./Blocks/VotingDataContent";
import { ShowcaseDataContent } from "./Blocks/ShowcaseDataContent";
import { InfoBlock } from "./Blocks/InfoBlock";
import { getEvent } from "./requests";

const PoolContainer = () => {
  const [eventData, setEventData] = useState<EventData>();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { damping: 25 });
  const y = useSpring(0, { damping: 25 });

  useEffect(() => {
    (async () => {
      setEventData(await getEvent());
    })();

    if (!ref.current) return;

    const handlePointerMove = (e: PointerEvent) => {
      const el = ref.current;
      const rect = el!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      x.set(((e.clientX - centerX) / 50) * -1);
      y.set(((e.clientY - centerY) / 50) * -1);
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  if (!eventData) return null;

  const tabsData = [
    {
      name: "Community Voting",
      panelClassName: "w-full pt-2",
      data: {
        type: "customData",
        elements: [<VotingDataContent key="voting" items={eventData.items} />],
      },
    },
    {
      name: "Judges Showcase",
      panelClassName: "w-full pt-2",
      data: {
        type: "customData",
        elements: [<ShowcaseDataContent key="showcase" items={eventData.items} />],
      },
    },
  ];

  return (
    <div className="flex w-full p-4 justify-center">
      <Container className="px-0 py-0 w-full flex flex-col xl:flex-row xl:max-w-360">
        <div className="not-xl:h-120 xl:w-[30%] xl:aspect-[9/16] overflow-clip">
          <motion.div
            ref={ref}
            style={{ x, y }}
            className="w-full h-full scale-118"
          >
            <img
              src={eventData.imageUrl}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
        <div className="p-5 w-full text-white text-xl flex flex-col gap-16">
          <div>
            <h2 className="text-[#ffd884] text-6xl uppercase">
              {eventData.title}
            </h2>
            <h4 className="text-4xl pl-5">
              <PreviewPanel className="bg-transparent px-0 py-0">
                {eventData.description}
              </PreviewPanel>
            </h4>
          </div>
          <InfoBlock data={eventData} />
          {eventData.items.length > 0 && <div className="w-full flex flex-col gap-4">
            <Tabs categories={tabsData} />
          </div>}
        </div>
      </Container>
    </div>
  );
};

export default PoolContainer;
