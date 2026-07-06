// Relative "opened" label (compact, for the mono column) plus a full timestamp
// for the hover title.
export function ageLabel(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function fullTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
