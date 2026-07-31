import { useEffect, useState } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { Button } from "@shared";
import { getUser } from "@store";
import { setVote } from "../requests";
import { authClient } from "@/features";

export const VotingDataContent = ({ items }: { items: ItemData[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voteItems, setVoteItems] = useState(items);
  const [totalVotes, setTotalVotes] = useState(0);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    (async () => {
      const user = (await authClient.getSession()).data?.user;
      setUser(user);
      setTotalVotes(
        items.reduce((acc, curr) => acc + curr.userVotes.length, 0),
      );
      items.forEach((item) => {
        if (user && item.userVotes.includes(user.id)) {
          setSelectedId(item.id);
        } else if (!user) {
          setSelectedId("0");
        }
      });
    })();
  }, [items]);

  const handleVote = async (id: string) => {
    const data = await setVote(id);
    setVoteItems(data.items);
    setSelectedId(id);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-baseline border-b-2 border-white/20 pb-3 text-xl">
        <span className="text-zinc-400 uppercase tracking-wide">
          Community pool
        </span>
        <span className="text-[#ffd884] uppercase">
          Total votes: {totalVotes}
        </span>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {voteItems.map((opt) => {
          const isSelected = selectedId === opt.id;
          const votes = opt.userVotes.length;
          const percentage =
            totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          return (
            <Button
              key={opt.id}
              disabled={!user}
              onClick={() => {
                if (selectedId === null) setTotalVotes((prev) => prev + 1);
                handleVote(opt.id);
              }}
              className={clsx(
                `relative w-full p-6 transition-colors overflow-hidden group`,
                isSelected
                  ? "border-[#ffd884] border-2 bg-white/10"
                  : "bg-black/20",
                !selectedId && "bg-white/5",
              )}
            >
              {selectedId && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute top-0 left-0 bottom-0 opacity-25 ${
                    isSelected ? "bg-blue" : "bg-white"
                  }`}
                />
              )}

              <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                <div>
                  <div className="text-lg text-[#ffd884] w-72">
                    @{opt.creator}
                  </div>
                  <a
                    href={`/workshop/${opt.id}`}
                    className="text-2xl md:text-3xl font-black text-white uppercase mt-1 hover:underline"
                  >
                    {opt.title}
                  </a>
                </div>

                <div className="text-right self-end sm:self-center">
                  {selectedId ? (
                    <span className="text-3xl md:text-4xl font-black text-[#ffd884]">
                      {percentage}%
                    </span>
                  ) : (
                    <span className="px-6 py-3 bg-white/10 group-hover:bg-yellow group-hover:text-black transition-colors text-base uppercase font-black tracking-wider">
                      Vote
                    </span>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
