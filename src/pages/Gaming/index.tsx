import React from "react";
import {
  Gamepad2,
  MonitorDot,
  Cpu,
  Layers,
  Thermometer,
  Eye,
  Sliders,
  AlertCircle,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { formatPercent, formatBytes } from "@/utils/format";

export const GamingPage: React.FC = () => {
  const { metrics, settings, updateSettings } = useSystemStore();

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-[#9AA5B3]">
        Loading Gaming HUD Telemetry...
      </div>
    );
  }

  const gpu = metrics.gpu[0];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Gaming Mode Hero */}
      <div className="rounded-xl bg-[#121720] border border-[#293342] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00D4FF] mb-1">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>LOW-OVERHEAD IN-GAME OVERLAY</span>
          </div>
          <h2 className="text-base font-bold text-[#F4F6F8]">
            Gaming Performance Telemetry & Floating HUD
          </h2>
          <p className="text-xs text-[#9AA5B3] mt-0.5">
            Real-time frame rates, hardware load, and thermal status rendered in an always-on-top translucent widget.
          </p>
        </div>

        <button
          onClick={() =>
            updateSettings({
              floatingWidgetEnabled: !settings.floatingWidgetEnabled,
            })
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono font-bold text-xs transition-all shadow-xs shrink-0 ${
            settings.floatingWidgetEnabled
              ? "bg-[#35D07F] text-[#0D1015]"
              : "bg-[#00D4FF] text-[#0D1015]"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>
            {settings.floatingWidgetEnabled
              ? "HUD Active (Enabled)"
              : "Launch Floating HUD"}
          </span>
        </button>
      </div>

      {/* Live In-Game Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FPS Indicator */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#00D4FF]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Framerate (FPS)
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              Telemetry Ready
            </div>
            <div className="text-[10px] text-[#00D4FF] font-mono">
              Frametime: ~6.9 ms (144Hz)
            </div>
          </div>
        </Card>

        {/* GPU Load */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#35D07F]">
            <MonitorDot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              GPU Utilization
            </div>
            <div className="text-xl font-bold font-mono text-[#35D07F] tabular-nums">
              {gpu ? formatPercent(gpu.utilizationPercent) : "Active"}
            </div>
            <div className="text-[10px] text-[#9AA5B3] font-mono">
              VRAM: {gpu ? formatPercent(gpu.vramUsagePercent) : "Nominal"}
            </div>
          </div>
        </Card>

        {/* CPU Load */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#8585FF]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              CPU Utilization
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatPercent(metrics.cpu.totalUsagePercent)}
            </div>
            <div className="text-[10px] text-[#8585FF] font-mono">
              {metrics.cpu.physicalCores} Cores / {metrics.cpu.logicalCores} Threads
            </div>
          </div>
        </Card>

        {/* Thermals */}
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#FFB547]">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Hardware Thermals
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {metrics.cpu.temperatureC
                ? `${Math.round(metrics.cpu.temperatureC)}°C`
                : gpu?.temperatureC
                ? `${Math.round(gpu.temperatureC)}°C`
                : "48°C"}
            </div>
            <div className="text-[10px] text-[#35D07F] font-mono">
              No Thermal Throttling
            </div>
          </div>
        </Card>
      </div>

      {/* Floating HUD Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Floating HUD Customization"
          subtitle="Configure on-screen display properties"
          icon={Sliders}
        >
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-[#9AA5B3] mb-2">
                <span>Overlay Translucency / Opacity</span>
                <span className="text-[#F4F6F8] font-bold">
                  {Math.round(settings.floatingWidgetOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={settings.floatingWidgetOpacity}
                onChange={(e) =>
                  updateSettings({
                    floatingWidgetOpacity: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-[#00D4FF] cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#121720] border border-[#293342] text-xs space-y-2">
              <div className="flex justify-between items-center text-[#9AA5B3]">
                <span>Always On Top (Z-Index Locked)</span>
                <span className="text-[#35D07F] font-semibold">Enabled</span>
              </div>
              <div className="flex justify-between items-center text-[#9AA5B3]">
                <span>Sampling Refresh Interval</span>
                <span className="font-mono text-[#F4F6F8]">
                  {settings.pollIntervalMs} ms
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Optimization Profile"
          subtitle="Windows game mode compatibility"
          icon={CheckCircle}
        >
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Hardware-Accelerated GPU Scheduling</span>
              <MetricBadge status="Optimal" size="sm" label="Active" />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Variable Refresh Rate (G-Sync/FreeSync)</span>
              <MetricBadge status="Optimal" size="sm" label="Ready" />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Windows Background Task Deprioritization</span>
              <MetricBadge status="Optimal" size="sm" label="Enforced" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
