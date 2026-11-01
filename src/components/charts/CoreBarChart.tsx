import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface CoreBarChartProps {
  cores: { id: number; usagePercent: number; frequencyMHz: number }[];
  height?: number;
}

export const CoreBarChart: React.FC<CoreBarChartProps> = ({
  cores,
  height = 200,
}) => {
  const option = useMemo(() => {
    const xLabels = cores.map((c) => `C${c.id}`);
    const usages = cores.map((c) => Math.round(c.usagePercent));

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
          const item = params[0];
          const core = cores[item.dataIndex];
          if (!core) return "";
          return `<div style="font-weight:bold; color:#00D4FF; font-family:monospace; margin-bottom:4px;">LOGICAL CORE #${core.id}</div>
                  <div style="color:#9AA5B3; font-size:11px;">Utilization: <b style="color:#F4F6F8; font-family:monospace;">${core.usagePercent.toFixed(1)}%</b></div>
                  <div style="color:#9AA5B3; font-size:11px;">Clock Frequency: <b style="color:#F4F6F8; font-family:monospace;">${core.frequencyMHz} MHz</b></div>`;
        },
      },
      grid: {
        left: "1%",
        right: "2%",
        top: "8%",
        bottom: "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xLabels,
        axisLine: { lineStyle: { color: "#293342" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#687585",
          fontSize: 9,
          fontFamily: "monospace",
          interval: 0,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        splitNumber: 3,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#687585",
          fontSize: 10,
          fontFamily: "monospace",
          formatter: "{value}%",
        },
        splitLine: { lineStyle: { color: "#1E2734", type: "dashed" } },
      },
      series: [
        {
          name: "Usage",
          type: "bar",
          barWidth: "55%",
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: (params: any) => {
              const val = params.value;
              if (val > 85) return "#FF5252";
              if (val > 60) return "#FFB547";
              return "#00D4FF";
            },
          },
          data: usages,
        },
      ],
      animationDuration: 250,
    };
  }, [cores]);

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
