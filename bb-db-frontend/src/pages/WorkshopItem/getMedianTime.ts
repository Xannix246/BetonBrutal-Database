export default function getMedianTime (replays: Replay[]) {
  if (replays.length === 0) return;

  const isOdd = Boolean(replays.length % 2);

  const sortedReplays = [...replays].sort((a, b) => a.score - b.score);

  if (isOdd) {
    return sortedReplays[Math.round(sortedReplays.length/2)-1].score;
  } else {
    const scoreA = sortedReplays[sortedReplays.length/2].score;
    const scoreB = sortedReplays[sortedReplays.length/2-1].score;

    return Math.round((scoreA+scoreB)/2);
  }
}
