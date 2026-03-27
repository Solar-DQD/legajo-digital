export function parseMonthYear(value: string): { month: number; year: number } | null {
  if (!value) return null;
  const parts = value.split('-');
  if (parts.length !== 2) return null;
  const month = parseInt(parts[0]);
  const year = parseInt(parts[1]);
  if (isNaN(month) || isNaN(year)) return null;
  return { month, year };
}
