export default function formatTime(score: number): string {
  const seconds = score / 100;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${remainingSeconds
      .toFixed(2)
      .padStart(5, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, "0")}`;
  }
}
