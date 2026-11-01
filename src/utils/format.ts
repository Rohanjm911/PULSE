export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return "0 KB/s";
  if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  }
  return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
}

export function formatFrequency(mhz: number | null | undefined): string {
  if (!mhz || mhz <= 0) return "N/A";
  if (mhz >= 1000) {
    return `${(mhz / 1000).toFixed(2)} GHz`;
  }
  return `${Math.round(mhz)} MHz`;
}

export function formatUptime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatPercent(value: number): string {
  if (typeof value !== "number" || isNaN(value)) return "0%";
  return `${Math.round(Math.min(100, Math.max(0, value)))}%`;
}

export function getStatusColor(
  status: "Optimal" | "Good" | "Warning" | "Critical" | string
): string {
  switch (status.toLowerCase()) {
    case "optimal":
    case "healthy":
    case "good":
      return "text-[#35D07F]";
    case "warning":
      return "text-[#FFB547]";
    case "critical":
      return "text-[#FF5252]";
    default:
      return "text-[#9AA5B3]";
  }
}

export function getStatusBg(
  status: "Optimal" | "Good" | "Warning" | "Critical" | string
): string {
  switch (status.toLowerCase()) {
    case "optimal":
    case "healthy":
    case "good":
      return "bg-[#35D07F]/10 border-[#35D07F]/25 text-[#35D07F]";
    case "warning":
      return "bg-[#FFB547]/10 border-[#FFB547]/25 text-[#FFB547]";
    case "critical":
      return "bg-[#FF5252]/10 border-[#FF5252]/25 text-[#FF5252]";
    default:
      return "bg-[#202936] border-[#293342] text-[#9AA5B3]";
  }
}
