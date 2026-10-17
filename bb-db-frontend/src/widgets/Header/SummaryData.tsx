import { useEffect, useState } from "react";
import { api } from "@features";
import { getStats } from "@store";

const SummaryData = () => {
  const data = getStats();

  return (
    <div className="relative flex flex-col gap-1 pl-5 text-black p-2 m-3 border-1 border-t-32 bg-white border-classic-blue-500 rounded-sm">
        <div className="absolute text-md -top-7 text-white font-medium">Web-site stats</div>
        <span>Total maps:  <span className="font-bold">{data.mapsCount}</span></span>
        <span>Total users:  <span className="font-bold">{data.usersCount}</span></span>
        <span>Total replays:  <span className="font-bold">{data.replaysCount}</span></span>
        <span>Total collections:  <span className="font-bold">{data.collectionsCount}</span></span>
      </div>
  );
}

export default SummaryData;