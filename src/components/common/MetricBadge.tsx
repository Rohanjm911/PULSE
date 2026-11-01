import React from "react";
import { getStatusBg } from "@/utils/format";

interface MetricBadgeProps {
  status: "Optimal" | "Good" | "Warning" | "Critical" | string;
  label?: string;
  size?: "sm" | "md";
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  status,
  label,
  size = "md",
}) => {
  const bgClass = getStatusBg(status);
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border tracking-wide select-none ${sizeClass} ${bgClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-85" />
      {label || status}
    </span>
  );
};
