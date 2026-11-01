import React, { useMemo } from "react";

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: string | number;
  className?: string;
  fillOpacity?: number;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = "#00D4FF",
  height = 36,
  width = "100%",
  className = "",
  fillOpacity = 0.15,
}) => {
  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Ensure we have at least 2 points to draw
    const safeData = data.length === 1 ? [data[0], data[0]] : data;
    const min = Math.min(...safeData, 0);
    const max = Math.max(...safeData, 100);
    const range = max - min || 1;

    const w = 100;
    const h = 40;
    const step = w / (safeData.length - 1);

    return safeData.map((val, idx) => {
      const x = idx * step;
      const y = h - ((val - min) / range) * (h - 6) - 3;
      return { x, y };
    });
  }, [data]);

  if (points.length < 2) {
    return <div style={{ height }} className={`w-full ${className}`} />;
  }

  // Generate smooth SVG path
  let pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX.toFixed(1)},${current.y.toFixed(1)} ${controlX.toFixed(1)},${next.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},40 L ${points[0].x.toFixed(1)},40 Z`;
  const lastPoint = points[points.length - 1];
  const gradientId = `sparkline-grad-${color.replace("#", "")}`;

  return (
    <div style={{ height, width }} className={`overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Fill Area */}
        <path d={fillD} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last Point Pulse Dot */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill={color}
          stroke="#0D1015"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

