/**
 * Formats a number with comma thousand separators, e.g. 1234567.5 -> "1,234,567.5".
 * Done by hand rather than toLocaleString so the output doesn't depend on the device locale.
 * Non-numeric values are returned unchanged as strings.
 */
export function formatNumber(value: unknown, fractionDigits?: number): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(num)) return String(value);

  const text = fractionDigits === undefined ? String(Math.abs(num)) : Math.abs(num).toFixed(fractionDigits);
  // Very large/small numbers come back in exponent form; leave those as-is.
  if (text.includes('e')) return String(num);
  const [whole, fraction] = text.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${num < 0 ? '-' : ''}${grouped}${fraction ? `.${fraction}` : ''}`;
}

/**
 * Reformats text as the user types it into a numeric field, e.g. "1234567.5" -> "1,234,567.5".
 * Keeps a trailing "." and any typed decimals so typing isn't disrupted.
 */
export function formatNumberInput(text: string): string {
  const cleaned = text.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  const whole = (dot === -1 ? cleaned : cleaned.slice(0, dot)).replace(/^0+(?=\d)/, '');
  const fraction = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, '');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === null ? grouped : `${grouped || '0'}.${fraction}`;
}

/** Parses text produced by formatNumberInput back into a number (NaN if invalid). */
export function parseNumberInput(text: string): number {
  return Number(text.replace(/,/g, ''));
}
