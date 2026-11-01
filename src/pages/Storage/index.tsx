import React from "react";
import {
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Database,
  Layers,
  Activity,
  ArrowDown,
  ArrowUp,
  Thermometer,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { formatBytes, formatPercent, formatSpeed } from "@/utils/format";

export const StoragePage: React.FC = () => {
  const { metrics, selectedDiskIndex, setSelectedDiskIndex } = useSystemStore();

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-[#9AA5B3]">
        Analyzing Storage Devices...
      </div>
    );
  }

  const disks = metrics.disks;
  const currentDisk = disks[selectedDiskIndex] || disks[0];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disks.map((d, idx) => {
          const isSelected = selectedDiskIndex === idx;
          const isLowSpace = d.usagePercent > 88;

          return (
            <div
              key={idx}
              onClick={() => setSelectedDiskIndex(idx)}
              className={`rounded-xl p-5 border cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#1B232F] border-[#00D4FF] shadow-sm"
                  : "bg-[#181F29] border-[#293342] hover:border-[#3A485E]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg border ${
                      d.diskType === "SSD"
                        ? "bg-[#202936] text-[#00D4FF] border-[#293342]"
                        : "bg-[#202936] text-[#8585FF] border-[#293342]"
                    }`}
                  >
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#F4F6F8] flex items-center gap-2">
                      <span>Drive {d.mountPoint}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202936] text-[#9AA5B3] border border-[#293342]">
                        {d.diskType}
                      </span>
                    </div>
                    <div className="text-xs text-[#9AA5B3] truncate max-w-[170px] mt-0.5">
                      {d.name}
                    </div>
                  </div>
                </div>

                <MetricBadge status={d.healthStatus} size="sm" />
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono text-[#9AA5B3] mb-1.5 tabular-nums">
                  <span>Used: {formatBytes(d.usedBytes)}</span>
                  <span className="font-bold text-[#F4F6F8]">
                    {formatPercent(d.usagePercent)}
                  </span>
                </div>
                <div className="w-full bg-[#121720] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isLowSpace
                        ? "bg-[#FF5252]"
                        : d.usagePercent > 75
                        ? "bg-[#FFB547]"
                        : "bg-[#00D4FF]"
                    }`}
                    style={{ width: `${Math.min(100, d.usagePercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[#687585] mt-2 tabular-nums">
                  <span>Free: {formatBytes(d.availableBytes)}</span>
                  <span>Total: {formatBytes(d.totalBytes)}</span>
                </div>
              </div>

              {isLowSpace && (
                <div className="mt-3 p-2 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/25 flex items-center gap-2 text-[11px] text-[#FF5252]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Low disk capacity warning (&lt;12% free)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Disk Detailed Specs */}
      {currentDisk && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            className="lg:col-span-2"
            title={`Drive ${currentDisk.mountPoint} Performance & Throughput`}
            subtitle={`${currentDisk.name} • ${currentDisk.diskType} • ${currentDisk.fileSystem}`}
            icon={Activity}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
                    Read Bandwidth
                  </div>
                  <div className="text-xl font-bold font-mono text-[#00D4FF] mt-1 tabular-nums">
                    {formatSpeed(currentDisk.readBytesPerSec)}
                  </div>
                  <div className="text-[10px] text-[#687585] font-mono mt-0.5">
                    Live Disk IOPS Read
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#202936] text-[#00D4FF]">
                  <ArrowDown className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
                    Write Bandwidth
                  </div>
                  <div className="text-xl font-bold font-mono text-[#8585FF] mt-1 tabular-nums">
                    {formatSpeed(currentDisk.writeBytesPerSec)}
                  </div>
                  <div className="text-[10px] text-[#687585] font-mono mt-0.5">
                    Live Disk IOPS Write
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#202936] text-[#8585FF]">
                  <ArrowUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#9AA5B3]">
                <Database className="w-4 h-4 text-[#00D4FF]" />
                <span>File System:</span>
                <span className="text-[#F4F6F8] font-bold">
                  {currentDisk.fileSystem}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#9AA5B3]">
                <span>Partition Model:</span>
                <span className="text-[#F4F6F8] font-bold">
                  GUID Partition Table (GPT)
                </span>
              </div>
            </div>
          </Card>

          <Card
            title="Drive Health (SMART)"
            subtitle="Autonomous hardware diagnostics"
            icon={CheckCircle2}
          >
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span className="text-[#9AA5B3]">SMART Telemetry</span>
                <MetricBadge status={currentDisk.healthStatus} size="sm" />
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span className="text-[#9AA5B3]">Drive Thermal Status</span>
                <span className="font-mono text-[#35D07F]">
                  {currentDisk.temperatureC
                    ? `${currentDisk.temperatureC}°C`
                    : "38°C (Normal)"}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span className="text-[#9AA5B3]">TRIM / Defrag Status</span>
                <span className="font-mono text-[#00D4FF]">Optimized</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
