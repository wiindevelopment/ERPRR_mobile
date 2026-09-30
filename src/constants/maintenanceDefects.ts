export function parseDefects(value?: string | null): string[] {
  if (!value) return [];
  return value.split(',').map(part => part.trim()).filter(Boolean);
}

export function joinDefects(defects: string[]): string {
  return defects.join(',');
}
