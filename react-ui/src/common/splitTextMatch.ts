export function splitTextMatch(text: string, offset: number, length: number): [string, string, string] {
  const preMatch = text.substring(0, offset);
  const match = text.substring(offset, offset + length);
  const postMatch = text.substring(offset + length);
  return [preMatch, match, postMatch];
}
