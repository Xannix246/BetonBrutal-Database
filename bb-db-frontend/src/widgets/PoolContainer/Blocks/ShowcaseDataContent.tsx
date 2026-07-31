import { useState } from "react";
import clsx from "clsx";
import { Button, Container } from "@shared";

export const ShowcaseDataContent = ({ items }: { items: ItemData[] }) => {
  const [activeId, setActiveId] = useState(items[0].id);
  const activeBuild = items.find((i) => i.id === activeId) || items[0];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-xl flex justify-between items-center border-b-2 border-white/20 pb-3">
        <span className="text-zinc-400 uppercase tracking-wide">
          Maps total scores
        </span>
        <span className="bg-yellow text-black px-3 py-1 font-bold">
          MAX 100 PTS
        </span>
      </div>

      <Container className="p-6 bg-white/5 flex flex-col gap-6 w-full">
        <div className="flex justify-between items-start border-b-2 border-white/10 pb-4">
          <div>
            <div className="text-lg text-[#ffd884]">@{activeBuild.creator}</div>
            <a
              href={`/workshop/${activeBuild.id}`}
              className="text-3xl md:text-4xl font-black uppercase text-white mt-1 hover:underline"
            >
              {activeBuild.title}
            </a>
          </div>
          <div className="text-right uppercase">
            <div className="text-lg text-zinc-400">Total score</div>
            <div className="text-4xl md:text-5xl font-black text-[#ffd884]">
              {activeBuild.totalScore}
              <span className="text-xl text-zinc-500">/100</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 uppercase text-center">
          <Container className="p-3 bg-black/40 border border-white/10">
            <div className="text-lg text-zinc-400">Originality</div>
            <div className="text-2xl font-bold text-white mt-1">
              {activeBuild.originality}/5
            </div>
          </Container>
          <Container className="p-3 bg-black/40 border border-white/10">
            <div className="text-lg text-zinc-400">Aesthetic</div>
            <div className="text-2xl font-bold text-white mt-1">
              {activeBuild.aesthetic}/5
            </div>
          </Container>
          <Container className="p-3 bg-black/40 border border-white/10">
            <div className="text-lg text-zinc-400">Fun</div>
            <div className="text-2xl font-bold text-white mt-1">
              {activeBuild.fun}/5
            </div>
          </Container>
          <Container className="p-3 bg-[#ffd884]/10 border border-[#ffd884]/40">
            <div className="text-lg text-[#ffd884]">Theme (x2)</div>
            <div className="text-2xl font-bold text-[#ffd884] mt-1">
              {activeBuild.theme}/10
            </div>
          </Container>
        </div>
      </Container>

      <div className="grid grid-cols-2 gap-3 w-full">
        {items.map((item) => (
          <Button
            key={item.id}
            onClick={() => setActiveId(item.id)}
            className={clsx(
              `p-4 text-left border-2 transition-all w-full flex flex-col gap-2`,
              activeId === item.id
                ? "border-[#ffd884] bg-white/10"
                : "border-white/10 hover:border-white/30 bg-black/40",
            )}
          >
            <div className="text-lg text-zinc-400">@{item.creator}</div>
            <div className="text-xl font-bold text-white uppercase truncate">
              {item.title}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
