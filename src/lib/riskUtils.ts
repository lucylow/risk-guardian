/** Shared risk formatting utilities. */

export function formatSafetyScore(score: number): string {
  if (score >= 70) return `${score} — Safe`;
  if (score >= 40) return `${score} — Moderate`;
  return `${score} — High Risk`;
}

export function getSafetyLabel(score: number): "Safe" | "Moderate" | "High Risk" {
  if (score >= 70) return "Safe";
  if (score >= 40) return "Moderate";
  return "High Risk";
}

export function getSafetyColorClass(score: number): string {
  if (score >= 70) return "text-risk-safe";
  if (score >= 40) return "text-risk-moderate";
  return "text-risk-danger";
}

export function getSafetyBgClass(score: number): string {
  if (score >= 70) return "bg-risk-safe/10 border-risk-safe/30 text-risk-safe";
  if (score >= 40) return "bg-risk-moderate/10 border-risk-moderate/30 text-risk-moderate";
  return "bg-risk-danger/10 border-risk-danger/30 text-risk-danger";
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function formatRelative(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
