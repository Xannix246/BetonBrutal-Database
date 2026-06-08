export const getColor = (value: number, max: number) => {
  const percent = value / (max-4);
  const hue = 120 * (1 - percent);
  return [hue, `hsl(${hue}, 100%, 50%)`];
};