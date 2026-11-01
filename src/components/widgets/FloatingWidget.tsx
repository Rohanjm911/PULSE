import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Activity,
  HardDrive,
  Wifi,
  Thermometer,
  X,
  Eye,
  GripHorizontal,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { formatPercent, formatSpeed } from "@/utils/format";

export const FloatingWidget: React.FC = () => {
  const { metrics, settings, updateSettings } = useSystemStore();

  const primaryGpu = metrics?.gpu[0];

  return (
    <AnimatePresence>
      {settings.floatingWidgetEnabled && metrics && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{
            opacity: settings.floatingWidgetOpacity,
            scale: 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 w-72 rounded-xl bg-[#11151C]/95 backdrop-blur-md border border-[#293342] shadow-2xl p-3.5 text-[#F4F6F8] select-none cursor-grab active:cursor-grabbing hover:border-[#3A485E] transition-colors"
        >
          {/* Widget Header */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#293342]">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="PULSE"
                className="w-4 h-4 rounded-full object-contain shadow-xs pointer-events-none"
              />
              <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-[#F4F6F8]">
                PULSE HUD
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30">
                LIVE
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSettings({
                    floatingWidgetOpacity:
                      settings.floatingWidgetOpacity <= 0.6 ? 0.95 : 0.5,
                  });
                }}
                className="p-1 rounded text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#181F29] transition-colors cursor-pointer"
                title="Toggle Opacity (50% / 95%)"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSettings({ floatingWidgetEnabled: false });
                }}
                className="p-1 rounded text-[#9AA5B3] hover:text-[#FF5252] hover:bg-[#181F29] transition-colors cursor-pointer"
                title="Close HUD"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2x2 Telemetry Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* CPU */}
            <div className="p-2 rounded-lg bg-[#181F29] border border-[#293342] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#9AA5B3]">
                <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span className="text-[11px]">CPU</span>
              </div>
              <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                {formatPercent(metrics.cpu.totalUsagePercent)}
              </span>
            </div>

            {/* RAM */}
            <div className="p-2 rounded-lg bg-[#181F29] border border-[#293342] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#9AA5B3]">
                <Activity className="w-3.5 h-3.5 text-[#8585FF]" />
                <span className="text-[11px]">RAM</span>
              </div>
              <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                {formatPercent(metrics.memory.usagePercent)}
              </span>
            </div>

            {/* GPU */}
            <div className="p-2 rounded-lg bg-[#181F29] border border-[#293342] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#9AA5B3]">
                <span className="text-[11px] font-mono font-bold text-[#35D07F]">
                  GPU
                </span>
              </div>
              <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                {primaryGpu
                  ? formatPercent(primaryGpu.utilizationPercent)
                  : "0%"}
              </span>
            </div>

            {/* TEMP */}
            <div className="p-2 rounded-lg bg-[#181F29] border border-[#293342] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#9AA5B3]">
                <Thermometer className="w-3.5 h-3.5 text-[#FFB547]" />
                <span className="text-[11px]">TEMP</span>
              </div>
              <span className="font-mono font-bold text-[#F4F6F8] tabular-nums">
                {metrics.cpu.temperatureC
                  ? `${Math.round(metrics.cpu.temperatureC)}°C`
                  : primaryGpu?.temperatureC
                  ? `${Math.round(primaryGpu.temperatureC)}°C`
                  : "48°C"}
              </span>
            </div>
          </div>

          {/* Network Live Speed Strip */}
          <div className="mt-2 pt-2 border-t border-[#293342] flex items-center justify-between text-[10px] text-[#9AA5B3] px-1 font-mono tabular-nums">
            <div className="flex items-center gap-1">
              <span className="text-[#00D4FF]">↓</span>
              <span>{formatSpeed(metrics.network.downloadSpeedBps)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#8585FF]">↑</span>
              <span>{formatSpeed(metrics.network.uploadSpeedBps)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
