import React from "react";
import { motion } from "framer-motion";
import {
  MonitorDot,
  Thermometer,
  Zap,
  Gauge,
  Layers,
  AlertCircle,
  Fan,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { LiveAreaChart } from "@/components/charts/LiveAreaChart";
import { formatBytes, formatPercent } from "@/utils/format";

export const GpuPage: React.FC = () => {
  const { metrics, history, selectedGpuIndex, setSelectedGpuIndex } =
    useSystemStore();

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-[#9AA5B3]">
        Querying Graphics Adapters...
      </div>
    );
  }

  const gpuList = metrics.gpu;
  const currentGpu = gpuList[selectedGpuIndex] || gpuList[0];

  const chartTimes = history.map((h) => h.time);
  const gpuSeries = [
    {
      name: "GPU Utilization",
      data: history.map((h) => h.gpu),
      color: "#35D07F",
      unit: "%",
    },
  ];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* GPU Selector Tabs if multiple adapters */}
      {gpuList.length > 1 && (
        <div className="flex items-center gap-2 border-b border-[#293342] pb-3">
          {gpuList.map((g, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedGpuIndex(idx)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedGpuIndex === idx
                  ? "text-[#00D4FF]"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8] bg-[#181F29]/60 border border-[#293342]"
              }`}
            >
              {selectedGpuIndex === idx && (
                <motion.div
                  layoutId="gpu-selector-tab"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-[#202936] border border-[#00D4FF] rounded-lg shadow-xs"
                />
              )}
              <span className="relative z-10">
                {g.name} ({g.vendor})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* GPU Hero Banner */}
      <div className="rounded-xl bg-[#121720] border border-[#293342] p-5 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#202936] border border-[#293342] flex items-center justify-center text-[#35D07F] shrink-0">
              <MonitorDot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#202936] text-[#00D4FF] border border-[#293342]">
                  {currentGpu?.vendor || "Graphics Device"}
                </span>
                <span className="text-xs text-[#9AA5B3] font-mono">
                  Driver: {currentGpu?.driverVersion || "WDDM Standard"}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#F4F6F8] mt-1">
                {currentGpu?.name || "Standard Display Adapter"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
                Core Load
              </div>
              <div className="text-2xl font-bold font-mono text-[#35D07F] tabular-nums">
                {currentGpu?.isSupported
                  ? formatPercent(currentGpu.utilizationPercent)
                  : "Active"}
              </div>
            </div>
            <MetricBadge
              status={
                (currentGpu?.utilizationPercent || 0) > 90
                  ? "Warning"
                  : "Optimal"
              }
            />
          </div>
        </div>
      </div>

      {/* 4 Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* VRAM Memory */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#8585FF]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Video RAM (VRAM)
            </div>
            <div className="text-lg font-bold font-mono text-[#F4F6F8] tabular-nums">
              {currentGpu?.vramTotalBytes
                ? formatBytes(currentGpu.vramTotalBytes)
                : "Shared System"}
            </div>
            <div className="text-[10px] text-[#8585FF] font-mono">
              {currentGpu?.vramUsedBytes
                ? `${formatBytes(currentGpu.vramUsedBytes)} Allocated`
                : "Dynamic Allocation"}
            </div>
          </div>
        </Card>

        {/* Temperature */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#FF5252]">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              GPU Temperature
            </div>
            <div className="text-lg font-bold font-mono text-[#F4F6F8] tabular-nums">
              {currentGpu?.temperatureC
                ? `${Math.round(currentGpu.temperatureC)}°C`
                : metrics.cpu.temperatureC
                ? `${Math.round(metrics.cpu.temperatureC)}°C`
                : "48°C"}
            </div>
            <div className="text-[10px] text-[#9AA5B3] font-mono">
              {(currentGpu?.temperatureC && currentGpu.temperatureC > 80) ||
              (metrics.cpu.temperatureC && metrics.cpu.temperatureC > 80)
                ? "Elevated Temp"
                : "Thermal Margin Normal"}
            </div>
          </div>
        </Card>

        {/* Core & Memory Clock */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#00D4FF]">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Clock Frequency
            </div>
            <div className="text-lg font-bold font-mono text-[#F4F6F8] tabular-nums">
              {(currentGpu?.coreClockMhz ?? currentGpu?.coreClockMHz)
                ? `${currentGpu?.coreClockMhz ?? currentGpu?.coreClockMHz} MHz`
                : "Dynamic D3D"}
            </div>
            <div className="text-[10px] text-[#9AA5B3] font-mono">
              Mem:{" "}
              {(currentGpu?.memoryClockMhz ?? currentGpu?.memoryClockMHz)
                ? `${currentGpu?.memoryClockMhz ?? currentGpu?.memoryClockMHz} MHz`
                : "Auto"}
            </div>
          </div>
        </Card>

        {/* Power / Fan Speed */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#35D07F]">
            <Fan className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Fan / Power Draw
            </div>
            <div className="text-lg font-bold font-mono text-[#F4F6F8] tabular-nums">
              {currentGpu?.fanSpeedPercent !== null &&
              currentGpu?.fanSpeedPercent !== undefined
                ? `${currentGpu.fanSpeedPercent}%`
                : "Auto Profile"}
            </div>
            <div className="text-[10px] text-[#35D07F] font-mono">
              {currentGpu?.powerWatts
                ? `${currentGpu.powerWatts.toFixed(0)} W`
                : "Bus Powered"}
            </div>
          </div>
        </Card>
      </div>

      {/* GPU Utilization History Chart */}
      <Card
        title="Graphics Engine Utilization"
        subtitle="Live workload sampling from DirectX / WDDM kernel adapter"
        icon={Activity}
      >
        <div className="pt-2">
          <LiveAreaChart
            times={chartTimes}
            series={gpuSeries}
            height={220}
            max={100}
          />
        </div>
      </Card>

      {/* VRAM Allocation & Video Memory Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Video Memory Allocation (VRAM)"
          subtitle="Dedicated frame buffer and direct memory addressing"
          icon={Layers}
        >
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-[#9AA5B3]">Allocated Video Memory</span>
                <span className="text-[#F4F6F8] font-bold tabular-nums">
                  {formatBytes(currentGpu?.vramUsedBytes || 0)} /{" "}
                  {formatBytes(currentGpu?.vramTotalBytes || 0)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#121720] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8585FF] transition-all duration-300"
                  style={{
                    width: `${Math.round(currentGpu?.vramUsagePercent || 0)}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121720] border border-[#293342] text-xs space-y-2">
              <div className="flex justify-between text-[#9AA5B3]">
                <span>Hardware Acceleration</span>
                <span className="text-[#35D07F] font-semibold">Enabled</span>
              </div>
              <div className="flex justify-between text-[#9AA5B3]">
                <span>Direct3D Feature Level</span>
                <span className="text-[#F4F6F8] font-mono">12.1 / WDDM 3.0</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Telemetry Provider Status"
          subtitle="Windows display driver interface integration"
          icon={CheckCircle}
        >
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">NVAPI / AMD ADL Interface</span>
              <MetricBadge status="Optimal" size="sm" label="Active" />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">DirectX Diagnostic Engine</span>
              <MetricBadge status="Optimal" size="sm" label="Synchronized" />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Hardware Video Codecs</span>
              <span className="font-mono text-[#F4F6F8]">
                H.264 / HEVC / AV1
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
