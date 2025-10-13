export function parseSearchInput(input: string): {
  id?: string;
  text?: string;
} {
  const trimmed = input.trim();

  const idMatch = trimmed.match(/id=(\d+)/);
  if (idMatch) return { id: idMatch[1] };

  if (/^\d+$/.test(trimmed)) return { id: trimmed };

  return { text: trimmed.toLowerCase() };
}
