export function getDateLabel(date: Date, currentDate = new Date()): string {
  const isToday =
    date.getDate() === currentDate.getDate() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear();
  const timeLabel = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `TODAY • ${timeLabel}`;
  }

  return `${date
    .toLocaleDateString([], { month: "short", day: "numeric" })
    .toUpperCase()} • ${timeLabel}`;
}
