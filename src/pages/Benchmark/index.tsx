import React, { useState } from "react";
import {
  Gauge,
  Cpu,
  Layers,
  HardDrive,
  Play,
  CheckCircle,
  AlertTriangle,
  History,
  Download,
  Activity,
  Zap,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";

export const BenchmarkPage: React.FC = () => {
  const { activeBenchmark, benchmarkRuns, runBenchmark } = useSystemStore();
  const [selectedSuite, setSelectedSuite] = useState<
    "cpu" | "memory" | "storage" | "all"
  >("all");
  const [isTestRunning, setIsTestRunning] = useState(false);

  const handleStartBenchmark = async () => {
    setIsTestRunning(true);
    await runBenchmark(selectedSuite);
    setIsTestRunning(false);
  };

  const exportBenchmarkHistory = () => {
    const jsonStr = JSON.stringify(benchmarkRuns, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PULSE_Benchmarks_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Thermal & Stress Warning Header */}
      <div className="p-4 rounded-xl bg-[#181F29] border border-[#293342] flex items-start gap-3 text-xs">
        <div className="p-2 rounded-lg bg-[#FFB547]/10 text-[#FFB547] shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-[#F4F6F8]">
            Synthetic Stress Testing Advisory:
          </span>
          <p className="mt-0.5 text-[#9AA5B3] leading-relaxed">
            Running hardware benchmarks subjects the CPU, memory subsystem, and storage controllers to sustained workloads, which temporarily increases temperature and power consumption. Storage tests safely utilize controlled temporary data files in Windows Temp and are strictly non-destructive.
          </p>
        </div>
      </div>

      {/* Benchmark Launcher Card */}
      <Card
        title="Hardware Stress & Performance Suite"
        subtitle="Select benchmark test profile to execute"
        icon={Gauge}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setSelectedSuite("all")}
            disabled={isTestRunning}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedSuite === "all"
                ? "bg-[#202936] border-[#00D4FF] text-[#00D4FF] shadow-xs"
                : "bg-[#121720] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:border-[#3A485E]"
            }`}
          >
            <div className="font-bold text-xs text-[#F4F6F8]">Full System Suite</div>
            <div className="text-[11px] text-[#9AA5B3] mt-1">
              Runs CPU, Memory, and Disk tests consecutively
            </div>
          </button>

          <button
            onClick={() => setSelectedSuite("cpu")}
            disabled={isTestRunning}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedSuite === "cpu"
                ? "bg-[#202936] border-[#00D4FF] text-[#00D4FF] shadow-xs"
                : "bg-[#121720] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:border-[#3A485E]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#F4F6F8]">
              <Cpu className="w-4 h-4 text-[#00D4FF]" /> CPU Compute
            </div>
            <div className="text-[11px] text-[#9AA5B3] mt-1">
              Single-thread & Multi-thread compute score
            </div>
          </button>

          <button
            onClick={() => setSelectedSuite("memory")}
            disabled={isTestRunning}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedSuite === "memory"
                ? "bg-[#202936] border-[#8585FF] text-[#8585FF] shadow-xs"
                : "bg-[#121720] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:border-[#3A485E]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#F4F6F8]">
              <Layers className="w-4 h-4 text-[#8585FF]" /> RAM Bandwidth
            </div>
            <div className="text-[11px] text-[#9AA5B3] mt-1">
              Memory bus read/write transfer rates
            </div>
          </button>

          <button
            onClick={() => setSelectedSuite("storage")}
            disabled={isTestRunning}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedSuite === "storage"
                ? "bg-[#202936] border-[#FFB547] text-[#FFB547] shadow-xs"
                : "bg-[#121720] border-[#293342] text-[#9AA5B3] hover:text-[#F4F6F8] hover:border-[#3A485E]"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#F4F6F8]">
              <HardDrive className="w-4 h-4 text-[#FFB547]" /> Storage IOPS
            </div>
            <div className="text-[11px] text-[#9AA5B3] mt-1">
              Sequential 128KB disk read & write velocity
            </div>
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#293342]">
          <div className="text-xs text-[#9AA5B3]">
            {isTestRunning ? (
              <span className="flex items-center gap-2 text-[#00D4FF] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-ping" />
                Benchmark in progress... Please do not close PULSE.
              </span>
            ) : (
              <span>Ready to initiate selected hardware test suite.</span>
            )}
          </div>

          <button
            onClick={handleStartBenchmark}
            disabled={isTestRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0D1015] font-mono font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isTestRunning ? "Executing..." : "Start Benchmark"}</span>
          </button>
        </div>
      </Card>

      {/* Active Benchmark Progress Card */}
      {isTestRunning && (
        <Card hoverable={false} className="border-[#00D4FF]/40 bg-[#121720]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#00D4FF] font-bold">
                TEST EXECUTION: {selectedSuite.toUpperCase()}
              </span>
              <span className="text-[#F4F6F8] animate-pulse">Running...</span>
            </div>
            <div className="w-full bg-[#181F29] rounded-full h-2.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#8585FF] w-3/4 animate-pulse rounded-full" />
            </div>
            <p className="text-[11px] text-[#9AA5B3]">
              Executing multi-threaded mathematical routines and memory bus load cycles...
            </p>
          </div>
        </Card>
      )}

      {/* Benchmark History & Results Table */}
      <Card
        title="Historical Benchmark Comparisons"
        subtitle="Log of recorded hardware benchmark scores on this machine"
        icon={History}
        action={
          benchmarkRuns.length > 0 && (
            <button
              onClick={exportBenchmarkHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121720] border border-[#293342] text-[11px] font-mono text-[#9AA5B3] hover:text-[#F4F6F8] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          )
        }
      >
        <div className="pt-2 overflow-x-auto">
          {benchmarkRuns.length === 0 ? (
            <div className="text-center py-10 text-[#687585] text-xs">
              No benchmark runs recorded yet. Select a suite above and click "Start Benchmark".
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#293342] text-[10px] font-mono uppercase text-[#687585]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Suite</th>
                  <th className="pb-2">CPU Single</th>
                  <th className="pb-2">CPU Multi</th>
                  <th className="pb-2">RAM Speed</th>
                  <th className="pb-2">Disk Read / Write</th>
                  <th className="pb-2 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293342]/50 font-mono tabular-nums">
                {benchmarkRuns.map((run, i) => (
                  <tr key={run.id || i} className="hover:bg-[#202936]/40 transition-colors">
                    <td className="py-2.5 text-[#9AA5B3] text-[11px]">
                      {new Date(run.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 font-bold uppercase text-[#F4F6F8]">
                      {run.testType}
                    </td>
                    <td className="py-2.5 text-[#00D4FF]">
                      {run.cpuSingleScore || "—"}
                    </td>
                    <td className="py-2.5 text-[#00D4FF] font-bold">
                      {run.cpuMultiScore || "—"}
                    </td>
                    <td className="py-2.5 text-[#8585FF]">
                      {run.memoryReadSpeedMBs
                        ? `${Math.round(run.memoryReadSpeedMBs)} MB/s`
                        : "—"}
                    </td>
                    <td className="py-2.5 text-[#FFB547]">
                      {run.storageSeqReadMBs
                        ? `${Math.round(run.storageSeqReadMBs)} / ${Math.round(
                            run.storageSeqWriteMBs || 0
                          )} MB/s`
                        : "—"}
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#35D07F]">
                      {run.cpuMultiScore
                        ? Math.round(
                            run.cpuMultiScore +
                              (run.memoryReadSpeedMBs || 0) * 0.2 +
                              (run.storageSeqReadMBs || 0) * 0.1
                          )
                        : "—"}
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
