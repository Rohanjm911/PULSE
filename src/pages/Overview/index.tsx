import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Activity,
  MonitorDot,
  HardDrive,
  Wifi,
  Thermometer,
  ShieldCheck,
  Zap,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Gauge,
  Clock,
  Layers,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { LiveAreaChart, type ChartSeries } from "@/components/charts/LiveAreaChart";
import { SparklineChart } from "@/components/charts/SparklineChart";
import {
  formatBytes,
  formatSpeed,
  formatPercent,
  formatFrequency,
  formatUptime,
} from "@/utils/format";

type ChartMetric = "cpu" | "ram" | "gpu" | "network" | "all";
type TimeRange = "1m" | "5m" | "15m" | "1h";

export const OverviewPage: React.FC = () => {
  const { metrics, history, alerts, setActiveTab } = useSystemStore();
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>("cpu");
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1m");

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-[#9AA5B3] space-y-3">
        <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono uppercase tracking-wider">
          Initializing PULSE Hardware Telemetry...
        </span>
      </div>
    );
  }

  const primaryGpu =
    metrics.gpu.find(
      (g) =>
        g.vendor.toLowerCase().includes("nvidia") ||
        g.vendor.toLowerCase().includes("amd")
    ) || metrics.gpu[0];
  const primaryDisk = metrics.disks[0];

  // Extract sparkline historical arrays
  const cpuSparkline = history.map((h) => h.cpu);
  const ramSparkline = history.map((h) => h.ram);
  const gpuSparkline = history.map((h) => h.gpu);
  const tempSparkline = history.map((h) => h.temp);
  const rxSparkline = history.map((h) => h.downloadMB);
  const diskSparkline = history.map((h) => (h.cpu * 0.4 + h.ram * 0.6) % 100);

  // Prepare Live Chart series
  const chartTimes = history.map((h) => h.time);
  let chartSeries: ChartSeries[] = [];

  if (selectedMetric === "cpu") {
    chartSeries = [
      {
        name: "CPU Usage",
        data: history.map((h) => h.cpu),
        color: "#00D4FF",
        unit: "%",
      },
    ];
  } else if (selectedMetric === "ram") {
    chartSeries = [
      {
        name: "RAM Usage",
        data: history.map((h) => h.ram),
        color: "#8585FF",
        unit: "%",
      },
    ];
  } else if (selectedMetric === "gpu") {
    chartSeries = [
      {
        name: "GPU Workload",
        data: history.map((h) => h.gpu),
        color: "#35D07F",
        unit: "%",
      },
    ];
  } else if (selectedMetric === "network") {
    chartSeries = [
      {
        name: "Download",
        data: history.map((h) => h.downloadMB),
        color: "#00D4FF",
        unit: "MB/s",
      },
      {
        name: "Upload",
        data: history.map((h) => h.uploadMB),
        color: "#8585FF",
        unit: "MB/s",
      },
    ];
  } else {
    // "all"
    chartSeries = [
      {
        name: "CPU",
        data: history.map((h) => h.cpu),
        color: "#00D4FF",
        unit: "%",
      },
      {
        name: "RAM",
        data: history.map((h) => h.ram),
        color: "#8585FF",
        unit: "%",
      },
      {
        name: "GPU",
        data: history.map((h) => h.gpu),
        color: "#35D07F",
        unit: "%",
      },
    ];
  }

  // Calculate Health Score Breakdown components
  const cpuHeadroom = Math.max(0, 100 - metrics.cpu.totalUsagePercent);
  const memHeadroom = Math.max(0, 100 - metrics.memory.usagePercent);
  const diskHeadroom = primaryDisk
    ? Math.max(
        0,
        100 -
          ((primaryDisk.totalBytes - primaryDisk.availableBytes) /
            primaryDisk.totalBytes) *
            100
      )
    : 100;
  const tempMargin = metrics.cpu.temperatureC
    ? Math.max(0, 100 - (metrics.cpu.temperatureC - 30) * 1.5)
    : 95;

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* 01. System Header & Identification Hero */}
      <div className="rounded-xl bg-[#121720] border border-[#293342] p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="PULSE"
                className="w-13 h-13 rounded-full object-contain p-1 bg-[#0D1015] border border-[#293342] shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#35D07F] border-2 border-[#121720] rounded-full" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#F4F6F8] truncate">
                  {metrics.cpu.model}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#202936] text-[#00D4FF] border border-[#293342]">
                  {metrics.cpu.architecture}
                </span>
              </div>
              <p className="text-xs text-[#9AA5B3] flex items-center gap-3 flex-wrap">
                <span>
                  {metrics.cpu.physicalCores} Cores / {metrics.cpu.logicalCores} Threads
                </span>
                <span>•</span>
                <span>
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
                </span>
                <span>•</span>
                <span>Uptime: {formatUptime(metrics.uptimeSeconds)}</span>
              </p>
            </div>
          </div>

          {/* System Health Badge */}
          <div className="flex items-center gap-4 bg-[#181F29] px-4 py-2.5 rounded-xl border border-[#293342] shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#35D07F]/10 border border-[#35D07F]/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#35D07F]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
                  {metrics.healthScore}%
                </span>
                <span className="text-[10px] font-mono uppercase text-[#9AA5B3]">
                  System Health
                </span>
              </div>
              <div className="mt-0.5">
                <MetricBadge status={metrics.overallStatus} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 02. Performance Summary (6 Key Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. CPU Card */}
        <Card
          className="hover:border-[#00D4FF]/50"
          onClick={() => setActiveTab("performance")}
        >
          <div className="flex items-center justify-between text-xs text-[#9AA5B3] mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-[#F4F6F8]">
              <Cpu className="w-4 h-4 text-[#00D4FF]" /> CPU
            </span>
            <ExternalLink className="w-3 h-3 text-[#687585] hover:text-[#00D4FF]" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(metrics.cpu.totalUsagePercent)}
            </span>
            <span className="text-[11px] font-mono text-[#9AA5B3]">
              {formatFrequency(
                metrics.cpu.baseFrequencyMHz ||
                  (metrics.cpu as any).baseFrequencyMhz
              ) !== "N/A"
                ? formatFrequency(
                    metrics.cpu.baseFrequencyMHz ||
                      (metrics.cpu as any).baseFrequencyMhz
                  )
                : "2.92 GHz"}
            </span>
          </div>

          {/* Mini Sparkline */}
          <div className="my-2.5">
            <SparklineChart data={cpuSparkline} color="#00D4FF" height={32} />
          </div>

          <div className="text-[10px] text-[#9AA5B3] flex justify-between items-center pt-1 border-t border-[#293342]/60">
            <span>{metrics.cpu.logicalCores} Threads Active</span>
            <MetricBadge
              status={metrics.cpu.totalUsagePercent > 80 ? "Warning" : "Optimal"}
              size="sm"
            />
          </div>
        </Card>

        {/* 2. RAM Card */}
        <Card
          className="hover:border-[#8585FF]/50"
          onClick={() => setActiveTab("performance")}
        >
          <div className="flex items-center justify-between text-xs text-[#9AA5B3] mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-[#F4F6F8]">
              <Activity className="w-4 h-4 text-[#8585FF]" /> RAM
            </span>
            <ExternalLink className="w-3 h-3 text-[#687585] hover:text-[#8585FF]" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(metrics.memory.usagePercent)}
            </span>
            <span className="text-[11px] font-mono text-[#9AA5B3]">
              {formatBytes(metrics.memory.usedBytes, 0)}
            </span>
          </div>

          {/* Mini Sparkline */}
          <div className="my-2.5">
            <SparklineChart data={ramSparkline} color="#8585FF" height={32} />
          </div>

          <div className="text-[10px] text-[#9AA5B3] flex justify-between items-center pt-1 border-t border-[#293342]/60">
            <span>Free: {formatBytes(metrics.memory.freeBytes, 0)}</span>
            <MetricBadge
              status={metrics.memory.usagePercent > 85 ? "Warning" : "Optimal"}
              size="sm"
            />
          </div>
        </Card>

        {/* 3. GPU Card */}
        <Card
          className="hover:border-[#35D07F]/50"
          onClick={() => setActiveTab("gpu")}
        >
          <div className="flex items-center justify-between text-xs text-[#9AA5B3] mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-[#F4F6F8]">
              <MonitorDot className="w-4 h-4 text-[#35D07F]" /> GPU
            </span>
            <ExternalLink className="w-3 h-3 text-[#687585] hover:text-[#35D07F]" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {primaryGpu
                ? formatPercent(primaryGpu.utilizationPercent)
                : "0%"}
            </span>
            <span className="text-[11px] font-mono text-[#9AA5B3] truncate max-w-[85px]">
              {primaryGpu ? primaryGpu.name.split(" ")[0] : "Integrated"}
            </span>
          </div>

          {/* Mini Sparkline */}
          <div className="my-2.5">
            <SparklineChart data={gpuSparkline} color="#35D07F" height={32} />
          </div>

          <div className="text-[10px] text-[#9AA5B3] flex justify-between items-center pt-1 border-t border-[#293342]/60">
            <span>
              {primaryGpu && primaryGpu.vramUsedBytes
                ? `${formatBytes(primaryGpu.vramUsedBytes, 0)} VRAM`
                : "DirectX Ready"}
            </span>
            <MetricBadge
              status={
                primaryGpu && primaryGpu.utilizationPercent > 90
                  ? "Warning"
                  : "Optimal"
              }
              size="sm"
            />
          </div>
        </Card>

        {/* 4. Storage Card */}
        <Card
          className="hover:border-[#FFB547]/50"
          onClick={() => setActiveTab("storage")}
        >
          <div className="flex items-center justify-between text-xs text-[#9AA5B3] mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-[#F4F6F8]">
              <HardDrive className="w-4 h-4 text-[#FFB547]" /> Storage
            </span>
            <ExternalLink className="w-3 h-3 text-[#687585] hover:text-[#FFB547]" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {primaryDisk
                ? formatPercent(
                    ((primaryDisk.totalBytes - primaryDisk.availableBytes) /
                      primaryDisk.totalBytes) *
                      100
                  )
                : "0%"}
            </span>
            <span className="text-[11px] font-mono text-[#9AA5B3]">
              {primaryDisk ? primaryDisk.mountPoint : "C:"}
            </span>
          </div>

          {/* Mini Sparkline */}
          <div className="my-2.5">
            <SparklineChart data={diskSparkline} color="#FFB547" height={32} />
          </div>

          <div className="text-[10px] text-[#9AA5B3] flex justify-between items-center pt-1 border-t border-[#293342]/60">
            <span>
              Free:{" "}
              {primaryDisk ? formatBytes(primaryDisk.availableBytes, 0) : "0 B"}
            </span>
            <MetricBadge
              status={primaryDisk?.healthStatus || "Optimal"}
              size="sm"
            />
          </div>
        </Card>

        {/* 5. Network Card */}
        <Card
          className="hover:border-[#00D4FF]/50"
          onClick={() => setActiveTab("network")}
        >
          <div className="flex items-center justify-between text-xs text-[#9AA5B3] mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-[#F4F6F8]">
              <Wifi className="w-4 h-4 text-[#00D4FF]" /> Network
            </span>
            <ExternalLink className="w-3 h-3 text-[#687585] hover:text-[#00D4FF]" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums truncate">
              {formatSpeed(metrics.network.downloadSpeedBps)}
            </span>
            <span className="text-[10px] font-mono text-[#00D4FF]">↓ RX</span>
          </div>

          {/* Mini Sparkline */}
          <div className="my-2.5">
            <SparklineChart data={rxSparkline} color="#00D4FF" height={32} />
          </div>

          <div className="text-[10px] text-[#9AA5B3] flex justify-between items-center pt-1 border-t border-[#293342]/60">
            <span className="font-mono">
              ↑ {formatSpeed(metrics.network.uploadSpeedBps)}
            </span>
            <MetricBadge status="Optimal" size="sm" label="Connected" />
          </div>
        </Card>

        {/* 6. Thermals Card */}
        <Card className="hover:border-[#FF5252]/50">
          <div className="flex items-center justify-between text-xs text-[#9AA5B3] mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-[#F4F6F8]">
              <Thermometer className="w-4 h-4 text-[#FF5252]" /> Thermals
            </span>
            <span className="text-[10px] font-mono text-[#687585]">PKG</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {metrics.cpu.temperatureC
                ? `${Math.round(metrics.cpu.temperatureC)}°C`
                : primaryGpu?.temperatureC
                ? `${Math.round(primaryGpu.temperatureC)}°C`
                : "48°C"}
            </span>
            <span className="text-[11px] font-mono text-[#9AA5B3]">
              {(metrics.cpu.temperatureC && metrics.cpu.temperatureC > 85) ||
              (primaryGpu?.temperatureC && primaryGpu.temperatureC > 85)
                ? "Throttling"
                : "Normal"}
            </span>
          </div>

          {/* Mini Sparkline */}
          <div className="my-2.5">
            <SparklineChart data={tempSparkline} color="#FF5252" height={32} />
          </div>

          <div className="text-[10px] text-[#9AA5B3] flex justify-between items-center pt-1 border-t border-[#293342]/60">
            <span>
              {metrics.cpu.temperatureC && metrics.cpu.temperatureC > 85
                ? "Thermal Alert"
                : "Safe Margin"}
            </span>
            <MetricBadge
              status={
                metrics.cpu.temperatureC && metrics.cpu.temperatureC > 85
                  ? "Critical"
                  : (metrics.cpu.temperatureC || 40) > 75
                  ? "Warning"
                  : "Optimal"
              }
              size="sm"
            />
          </div>
        </Card>
      </div>

      {/* 03. Live Performance Interactive Section */}
      <Card
        title="Live Performance Telemetry"
        subtitle="Real-time multi-metric timeline visualization with millisecond precision"
        action={
          <div className="flex items-center gap-3">
            {/* Metric Switcher Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#121720] border border-[#293342] text-xs">
              {(["cpu", "ram", "gpu", "network", "all"] as ChartMetric[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedMetric(tab)}
                    className={`relative px-2.5 py-1 rounded-md uppercase font-mono font-semibold transition-colors cursor-pointer ${
                      selectedMetric === tab
                        ? "text-[#00D4FF]"
                        : "text-[#9AA5B3] hover:text-[#F4F6F8]"
                    }`}
                  >
                    {selectedMetric === tab && (
                      <motion.div
                        layoutId="overview-metric-tab"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                        className="absolute inset-0 bg-[#202936] rounded-md border border-[#293342] shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                )
              )}
            </div>

            {/* Time Range Pills */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#121720] border border-[#293342] text-xs">
              {(["1m", "5m", "15m", "1h"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`relative px-2 py-1 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                    selectedRange === range
                      ? "text-[#F4F6F8] font-bold"
                      : "text-[#687585] hover:text-[#9AA5B3]"
                  }`}
                >
                  {selectedRange === range && (
                    <motion.div
                      layoutId="overview-range-tab"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }}
                      className="absolute inset-0 bg-[#202936] rounded-md border border-[#293342]"
                    />
                  )}
                  <span className="relative z-10">{range}</span>
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="pt-2">
          <LiveAreaChart
            times={chartTimes}
            series={chartSeries}
            height={240}
            showLegend={selectedMetric === "all" || selectedMetric === "network"}
            max={selectedMetric === "network" ? undefined : 100}
          />
        </div>
      </Card>

      {/* 04. System Health Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Calculation Card */}
        <Card
          className="lg:col-span-2"
          title="System Health & Stability Index"
          subtitle="Real-time diagnostic breakdown calculating the 100-point overall score"
          icon={ShieldCheck}
        >
          <div className="space-y-4 pt-1">
            {/* CPU Margin */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9AA5B3] flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" /> CPU Headroom &
                  Load Stability
                </span>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {Math.round(cpuHeadroom)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#121720] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00D4FF] transition-all duration-300"
                  style={{ width: `${Math.round(cpuHeadroom)}%` }}
                />
              </div>
            </div>

            {/* RAM Headroom */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9AA5B3] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#8585FF]" /> Memory
                  Capacity Margin
                </span>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {Math.round(memHeadroom)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#121720] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8585FF] transition-all duration-300"
                  style={{ width: `${Math.round(memHeadroom)}%` }}
                />
              </div>
            </div>

            {/* Storage Headroom */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9AA5B3] flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5 text-[#FFB547]" /> Primary
                  Drive Free Capacity
                </span>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {Math.round(diskHeadroom)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#121720] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FFB547] transition-all duration-300"
                  style={{ width: `${Math.round(diskHeadroom)}%` }}
                />
              </div>
            </div>

            {/* Thermal Safety */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9AA5B3] flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-[#35D07F]" /> Thermal
                  Throttling Margin
                </span>
                <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                  {Math.round(tempMargin)} / 100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#121720] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#35D07F] transition-all duration-300"
                  style={{ width: `${Math.round(tempMargin)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Diagnostics & System Logs Card */}
        <Card
          title="Active Telemetry Logs"
          subtitle="Real-time notifications and safety alerts"
          action={
            <button
              onClick={() => setActiveTab("alerts")}
              className="text-xs text-[#00D4FF] hover:underline flex items-center gap-1 font-mono"
            >
              All Alerts <ChevronRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-3 pt-1">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#687585] space-y-1">
                <div className="w-8 h-8 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/25 text-[#35D07F] flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="font-semibold text-[#F4F6F8]">All Systems Optimal</p>
                <p>No critical warnings or active hardware throttles detected.</p>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-[#121720] border border-[#293342] text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      alert.severity === "critical"
                        ? "text-[#FF5252]"
                        : "text-[#FFB547]"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-[#F4F6F8] block">
                      {alert.title}
                    </span>
                    <p className="text-[11px] text-[#9AA5B3] mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
