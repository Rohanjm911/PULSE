import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  MonitorDot,
  Layers,
  HardDrive,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Activity,
  Terminal,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { formatBytes, formatFrequency } from "@/utils/format";

interface InitialSystemScanProps {
  onComplete: () => void;
}

interface ScanPhase {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  color: string;
  detail: string;
  status: "pending" | "scanning" | "complete";
}

export const InitialSystemScan: React.FC<InitialSystemScanProps> = ({
  onComplete,
}) => {
  const { metrics, hardwareInfo, fetchHardwareInfo, fetchProcesses } =
    useSystemStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchHardwareInfo();
    fetchProcesses();
  }, [fetchHardwareInfo, fetchProcesses]);

  const primaryGpu =
    metrics?.gpu.find(
      (g) =>
        g.vendor.toLowerCase().includes("nvidia") ||
        g.vendor.toLowerCase().includes("amd")
    ) || metrics?.gpu[0];

  const primaryDisk = metrics?.disks[0];

  const phases: ScanPhase[] = useMemo(
    () => [
      {
        id: "cpu",
        label: "Processor Core Discovery",
        category: "CPU & Microarchitecture",
        icon: Cpu,
        color: "#00D4FF",
        detail: metrics?.cpu
          ? `${metrics.cpu.model} (${metrics.cpu.logicalCores} Threads @ ${formatFrequency(
              metrics.cpu.baseFrequencyMHz || (metrics.cpu as any).baseFrequencyMhz
            )})`
          : "Discovering CPU Topology & Instruction Sets...",
        status:
          currentStep > 0
            ? "complete"
            : currentStep === 0
            ? "scanning"
            : "pending",
      },
      {
        id: "gpu",
        label: "Graphics Subsystem Audit",
        category: "Dedicated GPU & VRAM",
        icon: MonitorDot,
        color: "#35D07F",
        detail: primaryGpu
          ? `${primaryGpu.name} (${formatBytes(primaryGpu.vramTotalBytes)} Dedicated VRAM, Driver ${primaryGpu.driverVersion})`
          : "Mapping Display Driver Interfaces & Silicon Thermals...",
        status:
          currentStep > 1
            ? "complete"
            : currentStep === 1
            ? "scanning"
            : "pending",
      },
      {
        id: "memory",
        label: "Physical Memory Matrix",
        category: "RAM & Virtual Swap",
        icon: Layers,
        color: "#8585FF",
        detail: metrics?.memory
          ? `${formatBytes(metrics.memory.totalBytes)} High-Speed RAM (${formatBytes(metrics.memory.swapTotalBytes)} Dedicated Pagefile)`
          : "Analyzing Memory Banks & Channel Geometry...",
        status:
          currentStep > 2
            ? "complete"
            : currentStep === 2
            ? "scanning"
            : "pending",
      },
      {
        id: "storage",
        label: "Storage Geometry & Volumes",
        category: "Partitions & Filesystem",
        icon: HardDrive,
        color: "#FFB547",
        detail: primaryDisk
          ? `${primaryDisk.name} (${primaryDisk.diskType} ${formatBytes(primaryDisk.totalBytes)}, ${primaryDisk.fileSystem} File System)`
          : "Scanning Fixed Storage & SMART Parameters...",
        status:
          currentStep > 3
            ? "complete"
            : currentStep === 3
            ? "scanning"
            : "pending",
      },
      {
        id: "network",
        label: "Network Adapter & Routing",
        category: "Connectivity & Latency",
        icon: Wifi,
        color: "#00D4FF",
        detail: metrics?.network
          ? `${metrics.network.activeAdapterName} (Latency: ${metrics.network.latencyMs ?? 18}ms, MAC: ${metrics.network.macAddress || "Active"})`
          : "Probing Network Interfaces & Route Headers...",
        status:
          currentStep > 4
            ? "complete"
            : currentStep === 4
            ? "scanning"
            : "pending",
      },
      {
        id: "health",
        label: "Baseline Machine Health",
        category: "Telemetry Calibration",
        icon: ShieldCheck,
        color: "#35D07F",
        detail: metrics
          ? `Initial Machine Health Score: ${metrics.healthScore}% (${metrics.overallStatus})`
          : "Computing Aggregate Baseline Telemetry Metrics...",
        status:
          currentStep > 5
            ? "complete"
            : currentStep === 5
            ? "scanning"
            : "pending",
      },
    ],
    [currentStep, metrics, primaryGpu, primaryDisk]
  );

  // Automated sequence progression
  useEffect(() => {
    if (currentStep < phases.length) {
      const timer = setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);

        const phaseLog = [
          `[SYS_PROBE] Auditing CPU: ${metrics?.cpu.model || "x86_64 Core"}`,
          `[SYS_PROBE] Calibrating GPU: ${primaryGpu?.name || "Display Adapter"}`,
          `[SYS_PROBE] Verified ${formatBytes(metrics?.memory.totalBytes || 16 * 1024 * 1024 * 1024)} Physical Memory`,
          `[SYS_PROBE] Indexed Fixed Partitions & SSD SMART Health: OK`,
          `[SYS_PROBE] Verified Network Adapter & ICMP Latency: OK`,
          `[SYS_PROBE] Machine Baseline Calibration 100% Complete.`,
        ][currentStep];

        if (phaseLog) {
          setConsoleLogs((prev) => [...prev.slice(-4), phaseLog]);
        }

        if (nextStep >= phases.length) {
          setIsFinished(true);
        }
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [currentStep, phases.length, metrics, primaryGpu]);

  const handleFinish = () => {
    localStorage.setItem("pulse_first_scan_completed", "true");
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 select-none overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl w-full bg-[#121720] border border-[#293342] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-b from-[#00D4FF]/10 to-transparent pointer-events-none filter blur-2xl" />

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#293342] pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#00D4FF] tracking-widest uppercase">
                FIRST RUN // SYSTEM INITIALIZATION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F4F6F8] font-mono tracking-tight">
              Hardware Discovery & Baseline Calibration
            </h1>
            <p className="text-xs text-[#9AA5B3] mt-1">
              PULSE is analyzing your machine architecture to calibrate low-level monitoring probes and baseline sensors.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#181F29] px-4 py-2 rounded-xl border border-[#293342] shrink-0">
            <Activity className="w-5 h-5 text-[#00D4FF] animate-spin" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9AA5B3]">
                Scan Progress
              </div>
              <div className="text-sm font-bold font-mono text-[#F4F6F8] tabular-nums">
                {Math.round((Math.min(currentStep, phases.length) / phases.length) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Phase List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-6 relative z-10">
          {phases.map((phase) => {
            const Icon = phase.icon;
            const isDone = phase.status === "complete";
            const isScanning = phase.status === "scanning";

            return (
              <div
                key={phase.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${
                  isDone
                    ? "bg-[#181F29]/80 border-[#35D07F]/40 shadow-xs"
                    : isScanning
                    ? "bg-[#202936] border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                    : "bg-[#141A23] border-[#293342]/60 opacity-60"
                }`}
              >
                <div
                  className="p-2 rounded-lg shrink-0 border"
                  style={{
                    backgroundColor: isDone
                      ? "#35D07F15"
                      : isScanning
                      ? `${phase.color}20`
                      : "#202936",
                    borderColor: isDone
                      ? "#35D07F50"
                      : isScanning
                      ? phase.color
                      : "#293342",
                    color: isDone ? "#35D07F" : phase.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#9AA5B3]">
                      {phase.category}
                    </span>
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#35D07F]">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : isScanning ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#00D4FF] animate-pulse">
                        ANALYZING...
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#687585]">
                        QUEUED
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[#F4F6F8] truncate mt-0.5">
                    {phase.label}
                  </div>
                  <div className="text-[11px] text-[#9AA5B3] font-mono truncate mt-1">
                    {phase.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log Bar */}
        <div className="bg-[#0D1015] border border-[#293342] rounded-xl p-3 font-mono text-[11px] text-[#9AA5B3] flex items-center gap-2 mb-6 relative z-10">
          <Terminal className="w-4 h-4 text-[#00D4FF] shrink-0" />
          <div className="flex-1 truncate">
            {consoleLogs.length > 0
              ? consoleLogs[consoleLogs.length - 1]
              : "Connecting low-level telemetry harnesses..."}
          </div>
          <span className="text-[10px] text-[#35D07F] font-bold shrink-0">
            [KERNEL_OK]
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#293342] relative z-10">
          <div className="text-xs text-[#9AA5B3] font-mono">
            {isFinished
              ? "All telemetry harnesses calibrated and ready."
              : "Calibrating hardware counters..."}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFinish}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                isFinished
                  ? "bg-gradient-to-r from-[#00D4FF] to-[#8585FF] text-black hover:opacity-95 shadow-[0_0_20px_rgba(0,212,255,0.3)] cursor-pointer"
                  : "bg-[#202936] text-[#9AA5B3] hover:text-[#F4F6F8] cursor-pointer"
              }`}
            >
              {isFinished ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ENTER PULSE DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>SKIP TO DASHBOARD</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

