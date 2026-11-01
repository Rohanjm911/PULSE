import React, { useState } from "react";
import {
  Power,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import type { StartupItem } from "@/types";

export const StartupPage: React.FC = () => {
  const { startupItems, toggleStartupItem, fetchStartupItems } =
    useSystemStore();
  const [pendingToggle, setPendingToggle] = useState<{
    item: StartupItem;
    nextState: boolean;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStartupItems();
    setIsRefreshing(false);
  };

  const handleConfirmToggle = async () => {
    if (!pendingToggle) return;
    await toggleStartupItem(pendingToggle.item.id, pendingToggle.nextState);
    setPendingToggle(null);
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Notice & Safety Bar */}
      <div className="p-4 rounded-xl bg-[#121720] border border-[#293342] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#202936] text-[#00D4FF]">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F4F6F8]">
              Windows Startup Integrity Protection
            </h4>
            <p className="text-[11px] text-[#9AA5B3] mt-0.5">
              Startup entries are queried safely from user & machine registry run hives and startup folders. Original command strings are preserved.
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-[#181F29] border border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#202936] transition-colors shrink-0"
          title="Refresh Startup Entries"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Startup Items List */}
      <div className="space-y-3">
        {startupItems.length === 0 ? (
          <div className="text-center py-12 text-[#687585] text-xs">
            No configurable startup applications detected in current registry hives.
          </div>
        ) : (
          startupItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#181F29] border border-[#293342] flex items-center justify-between hover:border-[#3A485E] transition-all"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`p-2.5 rounded-lg border shrink-0 mt-0.5 ${
                    item.enabled
                      ? "bg-[#35D07F]/10 border-[#35D07F]/25 text-[#35D07F]"
                      : "bg-[#202936] border-[#293342] text-[#687585]"
                  }`}
                >
                  <Power className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F4F6F8]">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202936] text-[#9AA5B3] border border-[#293342]">
                      {item.source}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#687585] mt-1 font-mono truncate max-w-xl">
                    {item.command}
                  </div>

                  <div className="text-[10px] text-[#9AA5B3] mt-1">
                    Publisher:{" "}
                    <span className="text-[#F4F6F8]">{item.publisher}</span> •
                    Location: {item.location}
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-[11px] font-mono text-[#9AA5B3]">
                  {item.enabled ? "Active" : "Disabled"}
                </span>

                <button
                  onClick={() =>
                    setPendingToggle({
                      item,
                      nextState: !item.enabled,
                    })
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    item.enabled ? "bg-[#35D07F]" : "bg-[#202936]"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      item.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingToggle}
        title="Modify Startup Status?"
        message={`Are you sure you want to ${
          pendingToggle?.nextState ? "enable" : "disable"
        } "${pendingToggle?.item.name}" from starting automatically with Windows?`}
        confirmLabel={pendingToggle?.nextState ? "Enable App" : "Disable App"}
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={handleConfirmToggle}
        onCancel={() => setPendingToggle(null)}
      />
    </div>
  );
};
