import React, { useState } from "react";
import {
  BarChart3,
  Camera,
  Trash2,
  Download,
  Calendar,
  Layers,
  CheckCircle,
  ArrowRightLeft,
  Activity,
  Cpu,
  Clock,
  HardDrive,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { LiveAreaChart } from "@/components/charts/LiveAreaChart";
import { formatPercent, formatUptime, formatBytes } from "@/utils/format";
import type { SystemSnapshot } from "@/types";

export const AnalyticsPage: React.FC = () => {
  const {
    metrics,
    history,
    snapshots,
    createSnapshot,
    deleteSnapshot,
  } = useSystemStore();

  const [snapshotName, setSnapshotName] = useState("");
  const [comparingSnapshots, setComparingSnapshots] = useState<{
    snapA: SystemSnapshot | null;
    snapB: SystemSnapshot | null;
  }>({ snapA: null, snapB: null });
  const [range, setRange] = useState<"1h" | "24h" | "7d">("24h");

  const chartTimes = history.map((h) => h.time);
  const cpuSeries = [
    {
      name: "CPU Trend",
      data: history.map((h) => h.cpu),
      color: "#00D4FF",
      unit: "%",
    },
  ];
  const ramSeries = [
    {
      name: "RAM Trend",
      data: history.map((h) => h.ram),
      color: "#8585FF",
      unit: "%",
    },
  ];

  // Calculate stats
  const cpuValues = history.map((h) => h.cpu);
  const avgCpu = cpuValues.length
    ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
    : 0;
  const peakCpu = cpuValues.length ? Math.max(...cpuValues) : 0;

  const ramValues = history.map((h) => h.ram);
  const avgRam = ramValues.length
    ? ramValues.reduce((a, b) => a + b, 0) / ramValues.length
    : 0;
  const peakRam = ramValues.length ? Math.max(...ramValues) : 0;

  const handleCapture = async () => {
    const name =
      snapshotName.trim() || `Snapshot ${new Date().toLocaleTimeString()}`;
    await createSnapshot(name);
    setSnapshotName("");
  };

  const exportSnapshots = () => {
    const jsonStr = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PULSE_Snapshots_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* 4 Analytics Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#00D4FF]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Average CPU Load
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(avgCpu)}
            </div>
            <div className="text-[10px] text-[#00D4FF] font-mono">
              Peak: {formatPercent(peakCpu)}
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#8585FF]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Average Memory
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(avgRam)}
            </div>
            <div className="text-[10px] text-[#8585FF] font-mono">
              Peak: {formatPercent(peakRam)}
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#35D07F]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Stored Snapshots
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {snapshots.length} Points
            </div>
            <div className="text-[10px] text-[#35D07F] font-mono">
              Saved in SQLite DB
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#FFB547]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Monitored Sessions
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              Continuous
            </div>
            <div className="text-[10px] text-[#9AA5B3] font-mono">
              100% Offline Retention
            </div>
          </div>
        </Card>
      </div>

      {/* Historical Telemetry Overview */}
      <Card
        title="Historical Telemetry Trends"
        subtitle="Sustained resource analysis aggregated over sampling windows"
        icon={BarChart3}
        action={
          <div className="flex items-center p-0.5 rounded-lg bg-[#121720] border border-[#293342] text-xs">
            <button
              onClick={() => setRange("1h")}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors ${
                range === "1h"
                  ? "bg-[#202936] text-[#00D4FF] shadow-xs"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              1 Hour
            </button>
            <button
              onClick={() => setRange("24h")}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors ${
                range === "24h"
                  ? "bg-[#202936] text-[#00D4FF] shadow-xs"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setRange("7d")}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors ${
                range === "7d"
                  ? "bg-[#202936] text-[#00D4FF] shadow-xs"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              7 Days
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div>
            <h4 className="text-xs font-mono font-semibold text-[#9AA5B3] mb-2">
              CPU Utilization Curve
            </h4>
            <LiveAreaChart times={chartTimes} series={cpuSeries} height={190} />
          </div>

          <div>
            <h4 className="text-xs font-mono font-semibold text-[#9AA5B3] mb-2">
              Memory Allocation Curve
            </h4>
            <LiveAreaChart times={chartTimes} series={ramSeries} height={190} />
          </div>
        </div>
      </Card>

      {/* Snapshot Capture & State Comparison */}
      <Card
        title="System State Snapshots & Time-Travel Diff"
        subtitle="Freeze complete system state metrics to compare workload shifts"
        icon={Camera}
        action={
          snapshots.length > 0 && (
            <button
              onClick={exportSnapshots}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121720] border border-[#293342] text-xs font-mono text-[#9AA5B3] hover:text-[#F4F6F8] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          )
        }
      >
        <div className="space-y-4 pt-2">
          {/* Capture Form */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              placeholder="e.g. 'Before Launching Blender' or 'Baseline Idle'..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-[#121720] border border-[#293342] text-xs text-[#F4F6F8] placeholder-[#687585] focus:outline-none focus:border-[#00D4FF] transition-colors"
            />
            <button
              onClick={handleCapture}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0D1015] font-mono font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Snapshot</span>
            </button>
          </div>

          {/* Stored Snapshots List */}
          <div className="space-y-2 pt-2">
            {snapshots.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#687585]">
                No snapshots captured yet. Give your current system state a label and capture a snapshot.
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between text-xs hover:border-[#3A485E] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#202936] text-[#00D4FF] shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#F4F6F8] block truncate">
                        {snap.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#687585]">
                        {new Date(snap.timestamp).toLocaleString()} • Health:{" "}
                        <b className="text-[#35D07F]">{snap.healthScore}%</b>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] tabular-nums">
                    <span className="text-[#00D4FF]">
                      CPU: {formatPercent(snap.cpuUsage)}
                    </span>
                    <span className="text-[#8585FF]">
                      RAM: {formatPercent(snap.ramUsage)}
                    </span>
                    <button
                      onClick={() => deleteSnapshot(snap.id)}
                      className="p-1.5 rounded text-[#687585] hover:text-[#FF5252] transition-colors"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
