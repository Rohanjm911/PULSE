import React from "react";
import {
  Bell,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import type { AlertRule } from "@/types";

export const AlertsPage: React.FC = () => {
  const { settings, updateSettings, alerts, acknowledgeAlert } =
    useSystemStore();

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    const updatedRules = settings.alerts.map((r) =>
      r.id === ruleId ? { ...r, enabled } : r
    );
    updateSettings({ alerts: updatedRules });
  };

  const handleThresholdChange = (ruleId: string, val: number) => {
    const updatedRules = settings.alerts.map((r) =>
      r.id === ruleId ? { ...r, threshold: val } : r
    );
    updateSettings({ alerts: updatedRules });
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Alert Header Summary */}
      <div className="rounded-xl bg-[#121720] border border-[#293342] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFB547] mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>INTELLIGENT HARDWARE THRESHOLDS</span>
          </div>
          <h2 className="text-base font-bold text-[#F4F6F8]">
            Alert Center & System Incident Log
          </h2>
          <p className="text-xs text-[#9AA5B3] mt-0.5">
            Configure automated thresholds that notify when memory, CPU, or hardware thermals exceed critical boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#181F29] border border-[#293342] text-xs font-mono">
            <span className="text-[#9AA5B3]">Unread Incidents: </span>
            <span
              className={`font-bold ${
                unacknowledgedCount > 0 ? "text-[#FF5252]" : "text-[#35D07F]"
              }`}
            >
              {unacknowledgedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Rules Config Card */}
      <Card
        title="Configurable Smart Alert Rules"
        subtitle="Set real-time trigger thresholds and notification severities"
        icon={Sliders}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {settings.alerts.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-[#121720] border border-[#293342] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F4F6F8]">
                    {rule.label}
                  </h4>
                  <span className="text-[10px] font-mono text-[#687585]">
                    Cooldown: {rule.cooldownSeconds}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MetricBadge
                    status={
                      rule.severity === "critical" ? "Critical" : "Warning"
                    }
                    size="sm"
                    label={rule.severity.toUpperCase()}
                  />
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) =>
                      handleToggleRule(rule.id, e.target.checked)
                    }
                    className="w-4 h-4 accent-[#00D4FF] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-[#9AA5B3] mb-1">
                  <span>Trigger Threshold</span>
                  <span className="font-bold text-[#00D4FF]">
                    {rule.threshold} {rule.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={rule.type === "temp" ? 60 : 50}
                  max={rule.type === "temp" ? 105 : 99}
                  step={1}
                  value={rule.threshold}
                  disabled={!rule.enabled}
                  onChange={(e) =>
                    handleThresholdChange(rule.id, parseInt(e.target.value))
                  }
                  className="w-full accent-[#00D4FF] cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alert Incident Log Table */}
      <Card
        title="Alert History & Incident Log"
        subtitle="Historical notifications stored locally in SQLite"
        icon={Bell}
      >
        <div className="pt-2 overflow-x-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-[#687585] text-xs">
              No alert incidents recorded. All system parameters are within thresholds.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#293342] text-[10px] font-mono uppercase text-[#687585]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">Alert Name</th>
                  <th className="pb-2">Incident Details</th>
                  <th className="pb-2 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293342]/50 font-mono">
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-[#202936]/40 transition-colors"
                  >
                    <td className="py-2.5 text-[#9AA5B3] text-[11px] tabular-nums">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5">
                      <MetricBadge
                        status={
                          alert.severity === "critical" ? "Critical" : "Warning"
                        }
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 font-bold text-[#F4F6F8]">
                      {alert.title}
                    </td>
                    <td className="py-2.5 text-[#9AA5B3] text-[11px]">
                      {alert.message}
                    </td>
                    <td className="py-2.5 text-right">
                      {alert.acknowledged ? (
                        <span className="text-[10px] text-[#35D07F] flex items-center justify-end gap-1 font-semibold">
                          <Check className="w-3 h-3" /> Seen
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-0.5 rounded text-[11px] text-[#00D4FF] hover:bg-[#00D4FF]/10 border border-[#00D4FF]/30 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
