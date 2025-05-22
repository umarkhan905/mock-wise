export const formatTime = (timestamp: number) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();

  if (diff < 1000 * 60 * 60 * 24) {
    // Less than 24 hours, show time
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // More than 24 hours, show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};
