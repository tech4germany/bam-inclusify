export function isValidUrl(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("http://") || value.startsWith("mailto:");
}
