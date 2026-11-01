import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Settings as SettingsIcon,
  Layers,
  Clock,
  ShieldAlert,
  CheckCircle,
  X,
  Activity,
  Layers2,
  ExternalLink,
} from "lucide-react";
import { useSystemStore, type NavTab } from "@/stores/useSystemStore";
import { formatUptime } from "@/utils/format";

const PAGE_TITLES: Record<NavTab, { title: string; subtitle: string; category: string }> = {
  overview: {
    title: "System Overview",
    subtitle: "Real-time telemetry, core hardware metrics and diagnostics summary",
    category: "TELEMETRY",
  },
  performance: {
    title: "CPU & Memory Performance",
    subtitle: "Logical cores load distribution, clock frequencies and RAM allocation",
    category: "TELEMETRY",
  },
  gpu: {
    title: "GPU Diagnostics",
    subtitle: "Graphics engine workload, dedicated VRAM, thermals and clock rates",
    category: "TELEMETRY",
  },
  storage: {
    title: "Storage Volumes",
    subtitle: "Disk partition capacity, live throughput and drive health telemetry",
    category: "TELEMETRY",
  },
  network: {
    title: "Network Intelligence",
    subtitle: "Live bandwidth, adapter configurations, ping latency and packet statistics",
    category: "TELEMETRY",
  },
  processes: {
    title: "Process Manager",
    subtitle: "Active Windows tasks, thread counters, memory consumers and safety locks",
    category: "SYSTEM MANAGEMENT",
  },
  startup: {
    title: "Startup Applications",
    subtitle: "Windows startup entries, registry keys and boot impact monitoring",
    category: "SYSTEM MANAGEMENT",
  },
  diagnostics: {
    title: "System Diagnostics",
    subtitle: "Motherboard, BIOS, instruction sets and complete hardware audit report",
    category: "SYSTEM MANAGEMENT",
  },
  benchmark: {
    title: "Benchmarking Center",
    subtitle: "Real-time multi-threaded stress tests for CPU, RAM and NVMe storage",
    category: "SYSTEM MANAGEMENT",
  },
  gaming: {
    title: "Gaming Mode & HUD",
    subtitle: "Low-latency system prioritization and customizable on-screen display",
    category: "MODES & ANALYTICS",
  },
  alerts: {
    title: "Alert Center",
    subtitle: "Intelligent threshold notifications, critical events and anomaly logs",
    category: "MODES & ANALYTICS",
  },
  analytics: {
    title: "Historical Analytics",
    subtitle: "Long-term telemetry aggregation, usage trends and system state snapshots",
    category: "MODES & ANALYTICS",
  },
  settings: {
    title: "Application Settings",
    subtitle: "Telemetry intervals, theme accents, HUD controls and startup preferences",
    category: "MODES & ANALYTICS",
  },
};

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    metrics,
    alerts,
    acknowledgeAlert,
    updateSettings,
    settings,
    processes,
  } = useSystemStore();
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);

  const pageInfo = PAGE_TITLES[activeTab] || {
    title: "PULSE",
    subtitle: "System Diagnostics & Telemetry Suite",
    category: "SYSTEM",
  };

  const unreadAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <header className="h-16 bg-[#0D1015] border-b border-[#293342] px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#687585] uppercase mb-0.5">
          <span>PULSE</span>
          <span>/</span>
          <span>{pageInfo.category}</span>
        </div>
        <h1 className="text-base font-bold text-[#F4F6F8] leading-tight">
          {pageInfo.title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Uptime & Health Stats */}
        {metrics && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#121720] border border-[#293342] text-xs">
            <div className="flex items-center gap-1.5 text-[#9AA5B3]">
              <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="font-mono tabular-nums">
                Up: {formatUptime(metrics.uptimeSeconds)}
              </span>
            </div>
            <div className="w-px h-3 bg-[#293342]" />
            <div className="flex items-center gap-1.5 text-[#9AA5B3]">
              <Activity className="w-3.5 h-3.5 text-[#35D07F]" />
              <span>
                Health:{" "}
                <b className="text-[#35D07F] font-mono tabular-nums">
                  {metrics.healthScore}%
                </b>
              </span>
            </div>
            <div className="w-px h-3 bg-[#293342]" />
            <div className="flex items-center gap-1.5 text-[#9AA5B3]">
              <Layers2 className="w-3.5 h-3.5 text-[#8585FF]" />
              <span className="font-mono tabular-nums">
                Processes: {processes.length}
              </span>
            </div>
          </div>
        )}

        {/* Floating HUD Quick Toggle */}
        <button
          onClick={() =>
            updateSettings({
              floatingWidgetEnabled: !settings.floatingWidgetEnabled,
            })
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            settings.floatingWidgetEnabled
              ? "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30"
              : "bg-[#181F29] text-[#9AA5B3] border-[#293342] hover:text-[#F4F6F8] hover:bg-[#202936]"
          }`}
          title="Toggle Floating Desktop HUD"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">HUD</span>
        </button>

        {/* Notification Bell with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsPopover(!showAlertsPopover)}
            className={`p-2 rounded-lg border transition-colors relative ${
              unreadAlerts.length > 0
                ? "bg-[#181F29] border-[#293342] text-[#FFB547] hover:bg-[#202936]"
                : "bg-[#181F29] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#202936]"
            }`}
            title="System Alerts & Warnings"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5252] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0D1015]">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Mini Drawer / Popover */}
          <AnimatePresence>
            {showAlertsPopover && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#181F29] border border-[#293342] shadow-2xl p-4 z-50 select-none"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#293342]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#FFB547]" />
                    <span className="text-xs font-bold text-[#F4F6F8]">
                      System Alerts & Logs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowAlertsPopover(false);
                        setActiveTab("alerts");
                      }}
                      className="text-[11px] text-[#00D4FF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View All <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setShowAlertsPopover(false)}
                      className="text-[#9AA5B3] hover:text-[#F4F6F8] p-0.5 rounded hover:bg-[#202936] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[#293342] my-2">
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#687585]">
                      No system alerts recorded. Everything is operating normally.
                    </div>
                  ) : (
                    alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="py-2.5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                alert.severity === "critical"
                                  ? "bg-[#FF5252]"
                                  : "bg-[#FFB547]"
                              }`}
                            />
                            <span className="font-semibold text-[#F4F6F8]">
                              {alert.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9AA5B3] pl-3">
                            {alert.message}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="shrink-0 p-1 text-[#687585] hover:text-[#35D07F] cursor-pointer"
                            title="Acknowledge alert"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Shortcut */}
        <button
          onClick={() => setActiveTab("settings")}
          className="p-2 rounded-lg bg-[#181F29] border border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#202936] transition-colors"
          title="Open Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
