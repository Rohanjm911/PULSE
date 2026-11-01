import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ListTree,
  Search,
  ArrowUpDown,
  Shield,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  X,
  Zap,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { formatBytes, formatPercent } from "@/utils/format";
import type { ProcessItem } from "@/types";

export const ProcessesPage: React.FC = () => {
  const {
    processes,
    processSearch,
    setProcessSearch,
    processSortField,
    processSortAsc,
    setProcessSort,
    killProcess,
    fetchProcesses,
  } = useSystemStore();

  const [filterType, setFilterType] = useState<"all" | "apps" | "system" | "heavy">("all");
  const [selectedProcessToKill, setSelectedProcessToKill] = useState<ProcessItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; err: boolean } | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProcesses();
    setIsRefreshing(false);
  };

  const handleConfirmKill = async () => {
    if (!selectedProcessToKill) return;

    const res = await killProcess(selectedProcessToKill.pid);
    if (res.success) {
      setNotification({ msg: res.message, err: false });
    } else {
      setNotification({ msg: res.message, err: true });
    }
    setSelectedProcessToKill(null);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter and sort
  const filteredProcesses = processes
    .filter((p) => {
      if (filterType === "apps" && p.isSystem) return false;
      if (filterType === "system" && !p.isSystem) return false;
      if (filterType === "heavy" && p.cpuPercent < 2 && p.memoryBytes < 300 * 1024 * 1024)
        return false;
      if (processSearch) {
        const query = processSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.pid.toString().includes(query) ||
          p.path.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let valA: any = a[processSortField];
      let valB: any = b[processSortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return processSortAsc ? -1 : 1;
      if (valA > valB) return processSortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Top Banner / Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
            notification.err
              ? "bg-[#FF5252]/10 border-[#FF5252]/25 text-[#FF5252]"
              : "bg-[#35D07F]/10 border-[#35D07F]/25 text-[#35D07F]"
          }`}
        >
          <span>{notification.msg}</span>
          <button
            onClick={() => setNotification(null)}
            className="hover:underline font-mono text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687585]" />
          <input
            type="text"
            value={processSearch}
            onChange={(e) => setProcessSearch(e.target.value)}
            placeholder="Filter by application name, PID or executable path..."
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-[#181F29] border border-[#293342] text-xs text-[#F4F6F8] placeholder-[#687585] focus:outline-none focus:border-[#00D4FF] transition-colors"
          />
          {processSearch && (
            <button
              onClick={() => setProcessSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687585] hover:text-[#F4F6F8]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-[#121720] border border-[#293342] text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`relative px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                filterType === "all"
                  ? "text-[#00D4FF]"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              {filterType === "all" && (
                <motion.div
                  layoutId="processes-filter-tab"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-[#202936] rounded-md border border-[#293342] shadow-xs"
                />
              )}
              <span className="relative z-10">All ({processes.length})</span>
            </button>
            <button
              onClick={() => setFilterType("apps")}
              className={`relative px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                filterType === "apps"
                  ? "text-[#00D4FF]"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              {filterType === "apps" && (
                <motion.div
                  layoutId="processes-filter-tab"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-[#202936] rounded-md border border-[#293342] shadow-xs"
                />
              )}
              <span className="relative z-10">Apps</span>
            </button>
            <button
              onClick={() => setFilterType("system")}
              className={`relative px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                filterType === "system"
                  ? "text-[#00D4FF]"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              {filterType === "system" && (
                <motion.div
                  layoutId="processes-filter-tab"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-[#202936] rounded-md border border-[#293342] shadow-xs"
                />
              )}
              <span className="relative z-10">System</span>
            </button>
            <button
              onClick={() => setFilterType("heavy")}
              className={`relative px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                filterType === "heavy"
                  ? "text-[#FFB547]"
                  : "text-[#9AA5B3] hover:text-[#F4F6F8]"
              }`}
            >
              {filterType === "heavy" && (
                <motion.div
                  layoutId="processes-filter-tab"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-[#202936] rounded-md border border-[#293342] shadow-xs"
                />
              )}
              <span className="relative z-10">Heavy</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-[#181F29] border border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:bg-[#202936] transition-colors disabled:opacity-50"
            title="Refresh Process List"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main Process Table */}
      <Card hoverable={false} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#121720] border-b border-[#293342] text-[10px] font-mono uppercase text-[#687585]">
                <th
                  onClick={() => setProcessSort("name")}
                  className="py-3 px-4 cursor-pointer hover:text-[#F4F6F8]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Process Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => setProcessSort("pid")}
                  className="py-3 px-4 cursor-pointer hover:text-[#F4F6F8]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => setProcessSort("cpuPercent")}
                  className="py-3 px-4 cursor-pointer hover:text-[#F4F6F8]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CPU Usage</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => setProcessSort("memoryBytes")}
                  className="py-3 px-4 cursor-pointer hover:text-[#F4F6F8]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Working Set (RAM)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status & Protection</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#293342]/50">
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-[#687585]"
                  >
                    No matching processes found for "{processSearch}".
                  </td>
                </tr>
              ) : (
                filteredProcesses.slice(0, 100).map((proc) => {
                  const isHighCpu = proc.cpuPercent > 10;
                  const isHighMem = proc.memoryBytes > 500 * 1024 * 1024;

                  return (
                    <tr
                      key={proc.pid}
                      className="hover:bg-[#202936]/40 transition-colors group"
                    >
                      {/* Name & Path */}
                      <td className="py-2.5 px-4 font-medium text-[#F4F6F8]">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[220px]">
                            {proc.name}
                          </span>
                        </div>
                        {proc.path && (
                          <div className="text-[10px] font-mono text-[#687585] truncate max-w-[280px]">
                            {proc.path}
                          </div>
                        )}
                      </td>

                      {/* PID */}
                      <td className="py-2.5 px-4 font-mono text-[#9AA5B3] tabular-nums">
                        {proc.pid}
                      </td>

                      {/* CPU */}
                      <td className="py-2.5 px-4 font-mono tabular-nums">
                        <span
                          className={
                            isHighCpu
                              ? "text-[#FF5252] font-bold"
                              : proc.cpuPercent > 3
                              ? "text-[#FFB547]"
                              : "text-[#00D4FF]"
                          }
                        >
                          {formatPercent(proc.cpuPercent)}
                        </span>
                      </td>

                      {/* Memory */}
                      <td className="py-2.5 px-4 font-mono tabular-nums">
                        <span
                          className={
                            isHighMem
                              ? "text-[#FFB547] font-semibold"
                              : "text-[#8585FF]"
                          }
                        >
                          {formatBytes(proc.memoryBytes)}
                        </span>
                      </td>

                      {/* Protection Badge */}
                      <td className="py-2.5 px-4">
                        {proc.isSystem ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#202936] text-[#9AA5B3] border border-[#293342]">
                            <Shield className="w-3 h-3 text-[#35D07F]" />
                            Protected
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#687585]">
                            Standard App
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        {proc.isSystem ? (
                          <span className="text-[10px] font-mono text-[#687585]">
                            Locked
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedProcessToKill(proc)}
                            className="px-2.5 py-1 rounded text-[11px] font-mono text-[#FF5252] hover:bg-[#FF5252]/10 border border-transparent hover:border-[#FF5252]/25 transition-colors"
                          >
                            End Task
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!selectedProcessToKill}
        title="End Process Task?"
        message={`Are you sure you want to terminate "${selectedProcessToKill?.name}" (PID: ${selectedProcessToKill?.pid})? Unsaved changes in this application will be lost.`}
        confirmLabel="End Process"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmKill}
        onCancel={() => setSelectedProcessToKill(null)}
      />
    </div>
  );
};
