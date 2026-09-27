const DEFECTS = [
  'AC not working',
  'Air leak',
  'Arm boom bucket jack seal leak',
  'Arm boom slow',
  'Bucket teeth worn out',
  'Circle blade defect',
  'Clutch worn out',
  'Coupling motor damage',
  'Crank seal leak',
  'Drum worn out',
  'Ducon seal leak',
  'Engine heating',
  'Engine oil leaking',
  'Engine slow when taking load',
  'Ex-dig pad worn out',
  'Fan belt damage',
  'Gear tight',
  'HYD heating',
  'HYD leaking',
  'Leaf spring bushes damage',
  'Less brake',
  'Lights not working',
  'Lost bucket jack pressure',
  'No battery charging',
  'No compaction',
  'No parking brake',
  'No pulling power',
  'Propeller shaft abnormal noise',
  'PTO leak',
  'Ripper defect',
  'Scrapers damage',
  'Shims worn out',
  'Shock not working',
  'Stabilizer jack pad worn out',
  'Stepping motor defect',
  'Swing grease seal leak',
  'Tandem defect',
  'Tire worn out',
  'Track shifting',
  'White smoke',
  'Winders not working',
];

export const MAINTENANCE_DEFECTS: readonly string[] = [...DEFECTS].sort((a, b) =>
  a.localeCompare(b, undefined, { sensitivity: 'base' }),
);

export function parseDefects(value?: string | null): string[] {
  if (!value) return [];
  return value.split(',').map(part => part.trim()).filter(Boolean);
}

export function joinDefects(defects: string[]): string {
  return defects.join(',');
}
