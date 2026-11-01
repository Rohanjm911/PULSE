import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  Clock,
  Database,
  Layers,
  Save,
  CheckCircle,
  Shield,
  Info,
  Bell,
  LayoutDashboard,
  Gamepad2,
  Power,
  Sliders,
  SlidersHorizontal,
  HardDrive,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type SettingsTab =
  | "general"
  | "appearance"
  | "monitoring"
  | "notifications"
  | "dashboard"
  | "gaming"
  | "storage"
  | "startup"
  | "about";

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, setActiveTab } = useSystemStore();
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("general");
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmClearDb, setConfirmClearDb] = useState(false);

  const handleSave = async (partial: any) => {
    await updateSettings(partial);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const navItems: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "monitoring", label: "Monitoring", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "gaming", label: "Gaming Mode", icon: Gamepad2 },
    { id: "storage", label: "Data & Storage", icon: Database },
    { id: "startup", label: "Startup", icon: Power },
    { id: "about", label: "About PULSE", icon: Info },
  ];

  return (
    <div className="space-y-6 pb-8 select-none">
      {savedNotice && (
        <div className="p-3 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/25 text-xs text-[#35D07F] flex items-center gap-2 font-mono animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Application preferences successfully persisted to SQLite storage.</span>
        </div>
      )}

      {/* Settings Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#293342]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSettingsTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSettingsTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-[#181F29] border border-[#293342] text-[#00D4FF] shadow-xs"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#181F29]/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#00D4FF]" : "text-[#687585]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL */}
      {activeSettingsTab === "general" && (
        <div className="space-y-4">
          <Card
            title="General Desktop Preferences"
            subtitle="Configure window lifecycle, tray behaviors and user interaction safety"
            icon={SettingsIcon}
          >
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Minimize to System Tray on Window Close
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Keeps background monitoring active without cluttering the Windows taskbar.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => handleSave({ minimizeToTray: e.target.checked })}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Start Minimized with Windows Logon
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Silently begins tracking system statistics upon user log on.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startMinimized}
                  onChange={(e) => handleSave({ startMinimized: e.target.checked })}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Require Confirmation Dialog for Destructive Actions
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Displays verification modals prior to terminating processes or modifying startup keys.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled={true}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer opacity-75"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: APPEARANCE */}
      {activeSettingsTab === "appearance" && (
        <div className="space-y-4">
          <Card
            title="Visual Identity & Theming"
            subtitle="Customize interface palette and technical accent tokens"
            icon={Palette}
          >
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-semibold text-[#F4F6F8] block mb-2 font-mono">
                  Primary Accent Color
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Pulse Cyan", color: "#00D4FF", desc: "Default technical" },
                    { label: "Cobalt Indigo", color: "#8585FF", desc: "Modern technical" },
                    { label: "Emerald Green", color: "#35D07F", desc: "Precision telemetry" },
                    { label: "Amber Warning", color: "#FFB547", desc: "High-contrast" },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => handleSave({ accentColor: c.color })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.accentColor === c.color
                          ? "bg-[#202936] border-[#00D4FF] shadow-xs"
                          : "bg-[#121720] border-[#293342] hover:border-[#3A485E]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="font-mono text-xs font-bold text-[#F4F6F8]">
                          {c.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9AA5B3] mt-1 font-mono">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Token Swatches */}
              <div className="pt-3 border-t border-[#293342]/60">
                <span className="text-xs font-semibold text-[#F4F6F8] block mb-2 font-mono">
                  Active Surface Palette Tokens
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-[#0D1015] border border-[#293342] text-[#9AA5B3]">
                    Background: #0D1015
                  </div>
                  <div className="p-2 rounded bg-[#121720] border border-[#293342] text-[#9AA5B3]">
                    Secondary: #121720
                  </div>
                  <div className="p-2 rounded bg-[#181F29] border border-[#293342] text-[#9AA5B3]">
                    Card: #181F29
                  </div>
                  <div className="p-2 rounded bg-[#202936] border border-[#293342] text-[#9AA5B3]">
                    Elevated: #202936
                  </div>
                  <div className="p-2 rounded bg-[#11151C] border border-[#293342] text-[#9AA5B3]">
                    Sidebar: #11151C
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: MONITORING */}
      {activeSettingsTab === "monitoring" && (
        <div className="space-y-4">
          <Card
            title="Monitoring Engine & Sampling Frequency"
            subtitle="Configure real-time kernel sampling intervals and hardware polling"
            icon={Clock}
          >
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-semibold text-[#F4F6F8] block mb-2 font-mono">
                  Telemetry Sampling Interval
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  {[
                    { label: "High (500ms)", val: 500, desc: "Ultra-responsive" },
                    { label: "Normal (1000ms)", val: 1000, desc: "Recommended balance" },
                    { label: "Eco (2000ms)", val: 2000, desc: "Minimal CPU footprint" },
                    { label: "Background (5000ms)", val: 5000, desc: "Idle telemetry" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleSave({ pollIntervalMs: opt.val })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.pollIntervalMs === opt.val
                          ? "bg-[#202936] border-[#00D4FF] text-[#00D4FF] font-bold shadow-xs"
                          : "bg-[#121720] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8]"
                      }`}
                    >
                      <div className="font-bold text-xs text-[#F4F6F8]">{opt.label}</div>
                      <div className="text-[10px] text-[#9AA5B3] mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeSettingsTab === "notifications" && (
        <div className="space-y-4">
          <Card
            title="Notification Center & Alert Integrations"
            subtitle="Configure trigger thresholds and anomaly alerts"
            icon={Bell}
          >
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Active Threshold Alerts in App Header
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Displays warning badges and incident popover notifications when thresholds are crossed.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled={true}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="px-3.5 py-2 rounded-lg bg-[#202936] border border-[#293342] text-[#00D4FF] font-mono text-xs hover:border-[#00D4FF] transition-colors flex items-center gap-2"
                >
                  <span>Configure Specific Alert Rules (CPU, RAM, GPU, Temp)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: DASHBOARD */}
      {activeSettingsTab === "dashboard" && (
        <div className="space-y-4">
          <Card
            title="Overview Dashboard Preferences"
            subtitle="Configure widget visibility and chart rendering behaviors"
            icon={LayoutDashboard}
          >
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Show Metric Sparklines
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Renders mini historical trend curves inside the 6 primary metric cards.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled={true}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Display Transparent Health Score Breakdown
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Shows CPU headroom, memory headroom, storage margin, and thermal safety calculations.
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled={true}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: GAMING MODE */}
      {activeSettingsTab === "gaming" && (
        <div className="space-y-4">
          <Card
            title="Gaming Mode & Floating HUD"
            subtitle="Configure overlay transparency, always-on-top positioning, and low overhead mode"
            icon={Gamepad2}
          >
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Enable Floating Desktop HUD
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Keeps a compact translucent hardware telemetry HUD pinned on top of applications.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.floatingWidgetEnabled}
                  onChange={(e) => handleSave({ floatingWidgetEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-[#F4F6F8] font-mono">
                    HUD Opacity ({Math.round(settings.floatingWidgetOpacity * 100)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={settings.floatingWidgetOpacity}
                  onChange={(e) => handleSave({ floatingWidgetOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#00D4FF] cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 7: DATA & STORAGE */}
      {activeSettingsTab === "storage" && (
        <div className="space-y-4">
          <Card
            title="SQLite Database & Telemetry Retention"
            subtitle="Configure local analytics storage bounds and maintenance"
            icon={Database}
          >
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs font-semibold text-[#F4F6F8] block mb-2 font-mono">
                  History Retention Period
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  {[
                    { label: "7 Days", val: 7 },
                    { label: "30 Days (Default)", val: 30 },
                    { label: "90 Days", val: 90 },
                    { label: "365 Days", val: 365 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleSave({ historyRetentionDays: opt.val })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        settings.historyRetentionDays === opt.val
                          ? "bg-[#202936] border-[#00D4FF] text-[#00D4FF] font-bold shadow-xs"
                          : "bg-[#121720] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] text-xs font-mono space-y-1">
                <span className="text-[#687585]">Database Location:</span>
                <div className="text-[#F4F6F8] break-all">%APPDATA%\PULSE\pulse_data.db</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 8: STARTUP */}
      {activeSettingsTab === "startup" && (
        <div className="space-y-4">
          <Card
            title="Windows Startup Registry Configuration"
            subtitle="Manage autostart behavior and boot impact"
            icon={Power}
          >
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F6F8]">
                    Launch PULSE on Windows Boot
                  </div>
                  <div className="text-[#9AA5B3] text-[11px] mt-0.5">
                    Registers PULSE in the HKCU Run registry key for automatic background initiation.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startMinimized}
                  onChange={(e) => handleSave({ startMinimized: e.target.checked })}
                  className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("startup")}
                  className="px-3.5 py-2 rounded-lg bg-[#202936] border border-[#293342] text-[#00D4FF] font-mono text-xs hover:border-[#00D4FF] transition-colors flex items-center gap-2"
                >
                  <span>Open Full Startup Applications Manager</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 9: ABOUT PULSE */}
      {activeSettingsTab === "about" && (
        <div className="space-y-4">
          <Card title="About PULSE" subtitle="Software identity & release specifications" icon={Info}>
            <div className="pt-2 text-xs font-mono space-y-2 text-[#9AA5B3]">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#121720] border border-[#293342] mb-3">
                <img
                  src="/logo.png"
                  alt="PULSE"
                  className="w-10 h-10 rounded-full object-contain p-0.5 bg-[#0D1015] border border-[#293342]"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#F4F6F8]">PULSE Desktop Suite</h3>
                  <p className="text-[11px] text-[#00D4FF]">Know Your Machine. Own Your Performance.</p>
                </div>
              </div>

              <div className="flex justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span>Version:</span>
                <span className="text-[#F4F6F8] font-bold">1.0.0 (Commercial Desktop Release)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span>Target Architecture:</span>
                <span className="text-[#F4F6F8]">Windows 10 / 11 (x86_64 / AMD64)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span>Core Engine:</span>
                <span className="text-[#00D4FF]">Tauri 2 + Rust sysinfo/WMI Kernel Telemetry</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span>Frontend Runtime:</span>
                <span className="text-[#8585FF]">React 19 + TypeScript + Tailwind CSS v4 + Apache ECharts</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#121720] border border-[#293342]">
                <span>Data Integrity:</span>
                <span className="text-[#35D07F] font-bold">100% Real Windows APIs (0% Mock Data)</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
