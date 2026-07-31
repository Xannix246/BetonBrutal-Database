import { useEffect, useState } from "react";
import { Container } from "@shared";

export const InfoBlock = ({ data }: { data: EventData }) => {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    if (new Date().valueOf() < new Date(data.start).valueOf()) {
      setTime(`Contest isn't started yet`);
      return;
    }

    if (new Date().valueOf() > new Date(data.end).valueOf()) {
      setTime(`Contest already ended`);
      return;
    }

    const updateTimer = () => {
      const diff = new Date(data.end).getTime() - Date.now();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24 + days * 24)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor((diff / 1000) % 60)
        .toString()
        .padStart(2, "0");

      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTimer();

    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [data.end]);

  return (
    <div className="w-full flex flex-col gap-6">
      <Container className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b-2 border-white/20 bg-transparent pb-6">
        <div>
          <span className="text-xl text-[#ffd884] uppercase tracking-wide">
            Live official context
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white mt-1">
            Time before end: {time}
          </h2>
        </div>
      </Container>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Container className="p-4 bg-white/10">
          <div className="text-xs text-zinc-400 uppercase">// DATES & TIME</div>
          <div className="text-xl font-bold text-white mt-1">
            {new Date(data.start).toLocaleDateString()} {new Date(data.start).toLocaleTimeString()} - {new Date(data.end).toLocaleDateString()} {new Date(data.end).toLocaleTimeString()}
          </div>
          <p className="text-[24px] text-zinc-300 mt-2">
            Map name must end with{" "}
            <span className="text-[#ffd884] font-bold">"Build Off"</span>. Solo
            builders only.
          </p>
        </Container>

        <Container className="p-4 bg-white/10">
          <div className="text-xs text-zinc-400 uppercase">
            // CONTEST THEME
          </div>
          <div className="text-xl font-bold text-[#ffd884] mt-1 uppercase">
            {data.themeWords.join(', ')}
          </div>
          <p className="text-[24px] text-zinc-300 mt-2">
            Theme category is worth{" "}
            <span className="text-white font-bold">DOUBLE POINTS</span> (up to
            10 pts).
          </p>
        </Container>
      </div>
    </div>
  );
};
