import React, { useState } from "react";
import {
  Activity,
  Cpu,
  MonitorDot,
  HardDrive,
  Network,
  ListTree,
  Power,
  Wrench,
  Gauge,
  Gamepad2,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { useSystemStore, type NavTab } from "@/stores/useSystemStore";

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { activeTab, setActiveTab, alerts, metrics } = useSystemStore();

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  const navGroups: NavGroup[] = [
    {
      title: "TELEMETRY",
      items: [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "performance", label: "CPU & Memory", icon: Cpu },
        { id: "gpu", label: "GPU Graphics", icon: MonitorDot },
        { id: "storage", label: "Storage Volumes", icon: HardDrive },
        { id: "network", label: "Network", icon: Network },
      ],
    },
    {
      title: "SYSTEM MANAGEMENT",
      items: [
        { id: "processes", label: "Process Manager", icon: ListTree },
        { id: "startup", label: "Startup Apps", icon: Power },
        { id: "diagnostics", label: "Diagnostics", icon: Wrench },
        { id: "benchmark", label: "Benchmarks", icon: Gauge },
      ],
    },
    {
      title: "MODES & ANALYTICS",
      items: [
        { id: "gaming", label: "Gaming Mode", icon: Gamepad2 },
        { id: "alerts", label: "Alert Center", icon: Bell, badge: unreadAlerts },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-[#11151C] border-r border-[#293342] flex flex-col justify-between transition-all duration-250 z-30 select-none ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Top Header & Branding */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#293342] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="PULSE Logo"
                className="w-9 h-9 rounded-full object-contain p-0.5 bg-[#0D1015] border border-[#293342] shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#35D07F] border-2 border-[#11151C] rounded-full" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-wider text-[#F4F6F8] leading-none">
                  PULSE
                </span>
                <span className="text-[9px] text-[#00D4FF] tracking-widest uppercase font-mono font-bold mt-1">
                  SYSTEM CORE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-[#202936] text-[#9AA5B3] hover:text-[#F4F6F8] transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items List with Scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono tracking-wider font-semibold text-[#687585] uppercase">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                      isActive
                        ? "bg-[#181F29] text-[#F4F6F8] border border-[#293342] shadow-xs"
                        : "text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#181F29]/60"
                    }`}
                  >
                    {/* Active Accent Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#00D4FF]"
                          : "text-[#687585] group-hover:text-[#F4F6F8]"
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 text-left">
                        {item.label}
                      </span>
                    )}

                    {/* Unread Alerts Badge */}
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                          collapsed
                            ? "absolute top-1 right-1 w-2 h-2 p-0 bg-[#FF5252]"
                            : "bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/30"
                        }`}
                      >
                        {!collapsed && item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* System Status Mini Widget Footer */}
      <div className="p-3 border-t border-[#293342] bg-[#0D1015]/60 shrink-0">
        {collapsed ? (
          <div
            className="flex justify-center cursor-pointer p-1.5 rounded-lg hover:bg-[#202936] text-[#35D07F]"
            title={`System Health: ${metrics?.healthScore || 100}%`}
            onClick={() => setActiveTab("overview")}
          >
            <ShieldCheck className="w-5 h-5 text-[#35D07F]" />
          </div>
        ) : (
          <div
            className="px-3 py-2 rounded-lg bg-[#181F29] border border-[#293342] flex items-center justify-between cursor-pointer hover:border-[#3A485E] transition-colors"
            onClick={() => setActiveTab("overview")}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D07F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35D07F]" />
              </span>
              <span className="text-[11px] text-[#9AA5B3] truncate">System Active</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#35D07F]">
              {metrics ? `${metrics.healthScore}%` : "100%"}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
