import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
  unit?: string;
}

export interface LiveAreaChartProps {
  // Multi-series signature
  times?: string[];
  series?: ChartSeries[];
  showLegend?: boolean;

  // Single-series signature (backward compatibility)
  data?: { time: string; value: number }[];
  label?: string;
  color?: string;
  unit?: string;

  // Common
  height?: number;
  max?: number;
}

export const LiveAreaChart: React.FC<LiveAreaChartProps> = ({
  times,
  series,
  showLegend = false,
  data,
  label = "Value",
  color = "#00D4FF",
  unit = "%",
  height = 200,
  max,
}) => {
  // Resolve times and series from either multi or single format
  const resolvedTimes = useMemo(() => {
    if (times && times.length > 0) return times;
    if (data && data.length > 0) return data.map((d) => d.time);
    return [];
  }, [times, data]);

  const resolvedSeries: ChartSeries[] = useMemo(() => {
    if (series && series.length > 0) return series;
    if (data && data.length > 0) {
      return [
        {
          name: label,
          data: data.map((d) => d.value),
          color: color,
          unit: unit,
        },
      ];
    }
    return [];
  }, [series, data, label, color, unit]);

  const option = useMemo(() => {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#181F29",
        borderColor: "#293342",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#F4F6F8", fontSize: 11 },
        formatter: (params: any) => {
          if (!params || !params.length) return "";
          const timeLabel = params[0].name || "";
          let html = `<div style="font-size:10px; font-family:monospace; color:#9AA5B3; margin-bottom:4px;">TIME: ${timeLabel}</div>`;
          params.forEach((p: any) => {
            const seriesConfig = resolvedSeries.find(
              (s) => s.name === p.seriesName
            );
            const sUnit = seriesConfig?.unit || unit;
            html += `<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:2px;">
              <span style="display:flex; align-items:center; gap:6px;">
                <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background-color:${p.color};"></span>
                <span style="color:#9AA5B3; font-size:11px;">${p.seriesName}:</span>
              </span>
              <span style="font-weight:bold; font-family:monospace; color:#F4F6F8; font-size:12px;">
                ${typeof p.value === "number" ? p.value.toFixed(1) : p.value} ${sUnit}
              </span>
            </div>`;
          });
          return html;
        },
      },
      legend: showLegend
        ? {
            show: true,
            top: 0,
            right: 0,
            icon: "circle",
            itemWidth: 8,
            itemHeight: 8,
            textStyle: { color: "#9AA5B3", fontSize: 10 },
          }
        : { show: false },
      grid: {
        left: "1%",
        right: "2%",
        top: showLegend ? "18%" : "8%",
        bottom: "6%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: resolvedTimes,
        axisLine: { lineStyle: { color: "#293342" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#687585",
          fontSize: 10,
          fontFamily: "monospace",
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: max !== undefined ? max : undefined,
        splitNumber: 3,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#687585",
          fontSize: 10,
          fontFamily: "monospace",
          formatter: (val: number) => {
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return `${val}`;
          },
        },
        splitLine: { lineStyle: { color: "#1E2734", type: "dashed" } },
      },
      series: resolvedSeries.map((s) => {
        const primaryColor = s.color || "#00D4FF";
        return {
          name: s.name,
          type: "line",
          smooth: 0.35,
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: primaryColor,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${primaryColor}35` },
                { offset: 1, color: `${primaryColor}00` },
              ],
            },
          },
          data: s.data,
        };
      }),
      animationDuration: 250,
    };
  }, [resolvedTimes, resolvedSeries, height, max, showLegend, unit]);

  return (
    <div style={{ width: "100%", height }}>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge={true}
      />
    </div>
  );
};
