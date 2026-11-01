import React, { useState } from "react";
import {
  Cpu,
  Activity,
  Layers,
  Thermometer,
  Zap,
  TrendingUp,
  HardDrive,
  BarChart2,
  Clock,
  ListFilter,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { LiveAreaChart } from "@/components/charts/LiveAreaChart";
import { CoreBarChart } from "@/components/charts/CoreBarChart";
import {
  formatBytes,
  formatPercent,
  formatFrequency,
} from "@/utils/format";

export const PerformancePage: React.FC = () => {
  const { metrics, history, processes, setActiveTab } = useSystemStore();
  const [activeTabSection, setActiveTabSection] = useState<"all" | "cpu" | "memory">("all");

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-[#9AA5B3]">
        Loading CPU & Memory metrics...
      </div>
    );
  }

  const chartTimes = history.map((h) => h.time);
  const cpuSeries = [{ name: "CPU Utilization", data: history.map((h) => h.cpu), color: "#00D4FF", unit: "%" }];
  const ramSeries = [{ name: "RAM Utilization", data: history.map((h) => h.ram), color: "#8585FF", unit: "%" }];

  // Identify top memory consuming applications
  const topMemoryHogs = [...processes]
    .sort((a, b) => b.memoryBytes - a.memoryBytes)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#00D4FF]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">CPU Load</div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(metrics.cpu.totalUsagePercent)}
            </div>
            <div className="text-[10px] text-[#00D4FF] font-mono">
              {metrics.cpu.physicalCores} Cores / {metrics.cpu.logicalCores} Threads
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#8585FF]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">Clock Speed</div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatFrequency(
                metrics.cpu.currentFrequencyMHz ||
                  (metrics.cpu as any).currentFrequencyMhz
              ) !== "N/A"
                ? formatFrequency(
                    metrics.cpu.currentFrequencyMHz ||
                      (metrics.cpu as any).currentFrequencyMhz
                  )
                : "2.92 GHz"}
            </div>
            <div className="text-[10px] text-[#9AA5B3] font-mono">
              Base:{" "}
              {formatFrequency(
                metrics.cpu.baseFrequencyMHz ||
                  (metrics.cpu as any).baseFrequencyMhz
              ) !== "N/A"
                ? formatFrequency(
                    metrics.cpu.baseFrequencyMHz ||
                      (metrics.cpu as any).baseFrequencyMhz
                  )
                : "2.92 GHz"}
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#35D07F]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">Memory in Use</div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(metrics.memory.usagePercent)}
            </div>
            <div className="text-[10px] text-[#35D07F] font-mono">
              {formatBytes(metrics.memory.usedBytes)} of {formatBytes(metrics.memory.totalBytes)}
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#FFB547]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">Pagefile / Swap</div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(metrics.memory.swapUsagePercent)}
            </div>
            <div className="text-[10px] text-[#9AA5B3] font-mono">
              {formatBytes(metrics.memory.swapUsedBytes)} of {formatBytes(metrics.memory.swapTotalBytes)}
            </div>
          </div>
        </Card>
      </div>

      {/* Processor Details & Per-Core Load */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Realtime Core Breakdown */}
        <Card
          title="Logical Processor Core Load"
          subtitle={`Independent telemetry across all ${metrics.cpu.logicalCores} execution pipelines`}
          icon={BarChart2}
        >
          <div className="pt-2">
            <CoreBarChart cores={metrics.cpu.cores} height={210} />
          </div>
        </Card>

        {/* CPU Utilization Timeline */}
        <Card
          title="CPU Utilization Timeline"
          subtitle="Dynamic processor utilization history across sampling intervals"
          icon={Cpu}
        >
          <div className="pt-2">
            <LiveAreaChart
              times={chartTimes}
              series={cpuSeries}
              height={210}
              max={100}
            />
          </div>
        </Card>
      </div>

      {/* Memory Allocation Breakdown & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAM Usage Timeline */}
        <Card
          className="lg:col-span-2"
          title="Physical Memory Utilization History"
          subtitle="Dynamic RAM allocation and working set tracking"
          icon={Activity}
        >
          <div className="pt-2">
            <LiveAreaChart
              times={chartTimes}
              series={ramSeries}
              height={210}
              max={100}
            />
          </div>
        </Card>

        {/* Memory Distribution Bar */}
        <Card
          title="Memory Composition"
          subtitle="Physical memory segmentation"
          icon={Layers}
        >
          <div className="space-y-4 pt-2">
            {/* Multi-segment Bar */}
            <div>
              <div className="h-4 rounded-lg bg-[#121720] border border-[#293342] overflow-hidden flex">
                <div
                  style={{ width: `${Math.round(metrics.memory.usagePercent)}%` }}
                  className="h-full bg-[#8585FF] transition-all duration-300"
                  title="In Use"
                />
                <div
                  style={{
                    width: `${Math.max(
                      0,
                      100 - Math.round(metrics.memory.usagePercent)
                    )}%`,
                  }}
                  className="h-full bg-[#35D07F]/40 transition-all duration-300"
                  title="Available"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8585FF]" />
                  <span className="text-[#9AA5B3]">In Use (Working Set)</span>
                </div>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {formatBytes(metrics.memory.usedBytes)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#35D07F]" />
                  <span className="text-[#9AA5B3]">Available Headroom</span>
                </div>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {formatBytes(metrics.memory.freeBytes)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547]" />
                  <span className="text-[#9AA5B3]">Committed Pagefile</span>
                </div>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {formatBytes(metrics.memory.swapUsedBytes)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Memory Consumers Table */}
      <Card
        title="Top Memory Working Sets"
        subtitle="Leading applications consuming active physical RAM"
        action={
          <button
            onClick={() => setActiveTab("processes")}
            className="text-xs text-[#00D4FF] hover:underline font-mono"
          >
            Manage Processes →
          </button>
        }
      >
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#293342] text-[10px] font-mono uppercase text-[#687585]">
                <th className="pb-2">Application / Process</th>
                <th className="pb-2">PID</th>
                <th className="pb-2">Memory Allocated</th>
                <th className="pb-2">CPU Contribution</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293342]/60">
              {topMemoryHogs.map((proc) => (
                <tr key={proc.pid} className="hover:bg-[#202936]/40 transition-colors">
                  <td className="py-2.5 font-medium text-[#F4F6F8] flex items-center gap-2">
                    <span className="truncate max-w-[200px]">{proc.name}</span>
                    {proc.isSystem && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#202936] text-[#9AA5B3] border border-[#293342]">
                        SYSTEM
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-[#9AA5B3] tabular-nums">
                    {proc.pid}
                  </td>
                  <td className="py-2.5 font-mono text-[#8585FF] font-semibold tabular-nums">
                    {formatBytes(proc.memoryBytes)}
                  </td>
                  <td className="py-2.5 font-mono text-[#00D4FF] tabular-nums">
                    {formatPercent(proc.cpuPercent)}
                  </td>
                  <td className="py-2.5 text-right">
                    <MetricBadge status="Optimal" size="sm" label="Active" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
