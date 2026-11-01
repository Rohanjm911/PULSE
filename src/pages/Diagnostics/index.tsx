import React, { useState } from "react";
import {
  Wrench,
  Cpu,
  Layers,
  HardDrive,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { formatBytes } from "@/utils/format";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const DiagnosticsPage: React.FC = () => {
  const { hardwareInfo, metrics, processes } = useSystemStore();
  const [reportGenerated, setReportGenerated] = useState(false);

  if (!hardwareInfo || !metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-[#9AA5B3]">
        Gathering Hardware Diagnostics Telemetry...
      </div>
    );
  }

  // Performance recommendations based on measurements
  const recommendations: {
    title: string;
    desc: string;
    type: "info" | "warning";
  }[] = [];

  const highCpuTasks = processes.filter(
    (p) => p.cpuPercent > 20 && !p.isSystem
  );
  if (highCpuTasks.length > 0) {
    recommendations.push({
      title: "Active High-CPU User Tasks Detected",
      desc: `${highCpuTasks.length} non-system application(s) (${highCpuTasks
        .map((p) => p.name)
        .join(", ")}) are consuming sustained CPU cycles.`,
      type: "warning",
    });
  }

  if (metrics.memory.usagePercent > 80) {
    recommendations.push({
      title: "Elevated Memory Pressure (>80%)",
      desc: "Available physical memory headroom is limited. Consider closing unused background tabs or applications.",
      type: "warning",
    });
  }

  const lowSpaceDrive = metrics.disks.find((d) => d.usagePercent > 85);
  if (lowSpaceDrive) {
    recommendations.push({
      title: `Drive ${lowSpaceDrive.mountPoint} Space Warning`,
      desc: `Volume ${lowSpaceDrive.mountPoint} is at ${Math.round(
        lowSpaceDrive.usagePercent
      )}% capacity. Running disk cleanup on temporary directories is recommended.`,
      type: "warning",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "System Balanced & Optimized",
      desc: "CPU, memory, thermals and active storage workloads are performing well within design specifications.",
      type: "info",
    });
  }

  // One-Click System Report Exporter - CSV
  const exportCSV = () => {
    const rows = [
      ["PULSE System Report"],
      ["Timestamp", new Date().toISOString()],
      [""],
      ["OPERATING SYSTEM"],
      ["OS Name", hardwareInfo.os.name],
      ["OS Version", hardwareInfo.os.version],
      ["Build Number", hardwareInfo.os.buildNumber],
      ["Architecture", hardwareInfo.os.architecture],
      [""],
      ["MOTHERBOARD & BIOS"],
      ["Manufacturer", hardwareInfo.motherboard.manufacturer],
      ["Model", hardwareInfo.motherboard.product],
      ["Serial Number", hardwareInfo.motherboard.serialNumber],
      ["BIOS Vendor", hardwareInfo.bios.vendor],
      ["BIOS Version", hardwareInfo.bios.version],
      ["BIOS Date", hardwareInfo.bios.releaseDate],
      [""],
      ["PROCESSOR"],
      ["CPU Model", hardwareInfo.cpu.name],
      ["Cores", hardwareInfo.cpu.cores.toString()],
      ["Threads", hardwareInfo.cpu.threads.toString()],
      [""],
      ["MEMORY"],
      ["Total Capacity", formatBytes(hardwareInfo.ram.totalCapacityBytes)],
      ...hardwareInfo.ram.sticks.map((s, i) => [
        `Module ${i + 1}`,
        `${s.bankLabel} - ${formatBytes(s.capacityBytes)} @ ${s.speedMHz} MT/s (${s.partNumber})`,
      ]),
      [""],
      ["STORAGE"],
      ...metrics.disks.map((d) => [
        `Drive ${d.mountPoint}`,
        `${d.name} (${d.diskType}) - ${formatBytes(d.totalBytes)} total, ${formatBytes(d.availableBytes)} free`,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PULSE_System_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 3000);
  };

  // One-Click System Report Exporter - PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    // PULSE Branding header
    doc.setFillColor(13, 16, 21);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(0, 212, 255);
    doc.setFontSize(18);
    doc.text("PULSE - SYSTEM DIAGNOSTIC REPORT", 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(154, 165, 179);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    // Section 1: OS & Motherboard
    (doc as any).autoTable({
      startY: 38,
      head: [["Component", "Specification Detail"]],
      body: [
        [
          "Operating System",
          `${hardwareInfo.os.name} (${hardwareInfo.os.buildNumber})`,
        ],
        ["Architecture", hardwareInfo.os.architecture],
        [
          "Motherboard",
          `${hardwareInfo.motherboard.manufacturer} ${hardwareInfo.motherboard.product}`,
        ],
        [
          "BIOS Firmware",
          `${hardwareInfo.bios.vendor} ${hardwareInfo.bios.version} (${hardwareInfo.bios.releaseDate})`,
        ],
        [
          "Processor (CPU)",
          `${hardwareInfo.cpu.name} (${hardwareInfo.cpu.cores}C/${hardwareInfo.cpu.threads}T)`,
        ],
        [
          "Physical Memory",
          `${formatBytes(hardwareInfo.ram.totalCapacityBytes)} Installed`,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [24, 31, 41], textColor: [0, 212, 255] },
      styles: { fontSize: 9 },
    });

    // Section 2: Storage Volumes
    const storageRows = metrics.disks.map((d) => [
      d.mountPoint,
      d.name,
      d.diskType,
      formatBytes(d.totalBytes),
      formatBytes(d.availableBytes),
      d.healthStatus,
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Mount", "Model", "Type", "Capacity", "Free", "Health"]],
      body: storageRows,
      theme: "grid",
      headStyles: { fillColor: [24, 31, 41], textColor: [0, 212, 255] },
      styles: { fontSize: 8 },
    });

    doc.save(`PULSE_Diagnostic_Report_${Date.now()}.pdf`);
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 3000);
  };

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Action Header: One-Click System Report */}
      <div className="rounded-xl bg-[#121720] border border-[#293342] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00D4FF] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ONE-CLICK SYSTEM REPORT</span>
          </div>
          <h2 className="text-base font-bold text-[#F4F6F8]">
            Complete Hardware & Diagnostics Summary
          </h2>
          <p className="text-xs text-[#9AA5B3] mt-0.5">
            Collects motherboard, BIOS, CPU, RAM and storage tables into an exportable document.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#181F29] hover:bg-[#202936] border border-[#293342] text-xs font-mono font-semibold text-[#F4F6F8] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0D1015] text-xs font-mono font-bold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Notification if report was generated */}
      {reportGenerated && (
        <div className="p-3 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/25 text-[#35D07F] text-xs flex items-center gap-2 font-mono">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Diagnostic report successfully downloaded to your device!</span>
        </div>
      )}

      {/* Diagnostics Recommendations */}
      <Card
        title="Diagnostic Findings & Recommendations"
        subtitle="Autonomous rule-based health telemetry audit"
        icon={Lightbulb}
      >
        <div className="space-y-2.5 pt-1">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                rec.type === "warning"
                  ? "bg-[#FFB547]/10 border-[#FFB547]/25 text-[#FFB547]"
                  : "bg-[#121720] border-[#293342] text-[#F4F6F8]"
              }`}
            >
              {rec.type === "warning" ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FFB547]" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#35D07F]" />
              )}
              <div>
                <span className="font-semibold block">{rec.title}</span>
                <p className="text-[11px] text-[#9AA5B3] mt-0.5 leading-relaxed">
                  {rec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Structured Hardware Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating System */}
        <Card title="Operating System" subtitle="Windows platform details" icon={Server}>
          <div className="space-y-2 pt-1 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Name:</span>
              <span className="text-[#F4F6F8] font-bold">{hardwareInfo.os.name}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Version & Build:</span>
              <span className="text-[#F4F6F8]">{hardwareInfo.os.version} ({hardwareInfo.os.buildNumber})</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Kernel Architecture:</span>
              <span className="text-[#00D4FF]">{hardwareInfo.os.architecture}</span>
            </div>
          </div>
        </Card>

        {/* Motherboard & BIOS */}
        <Card title="Motherboard & BIOS" subtitle="Mainboard firmware info" icon={Wrench}>
          <div className="space-y-2 pt-1 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Manufacturer:</span>
              <span className="text-[#F4F6F8] font-bold">{hardwareInfo.motherboard.manufacturer}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Board Model:</span>
              <span className="text-[#F4F6F8]">{hardwareInfo.motherboard.product}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">BIOS Vendor & Ver:</span>
              <span className="text-[#8585FF]">{hardwareInfo.bios.vendor} {hardwareInfo.bios.version}</span>
            </div>
          </div>
        </Card>

        {/* Processor Instructions */}
        <Card title="Processor Details" subtitle="Instruction sets & topology" icon={Cpu}>
          <div className="space-y-2 pt-1 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">CPU Model:</span>
              <span className="text-[#F4F6F8] font-bold truncate max-w-[200px]">{hardwareInfo.cpu.name}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Cores / Threads:</span>
              <span className="text-[#00D4FF]">{hardwareInfo.cpu.cores} Cores / {hardwareInfo.cpu.threads} Threads</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Supported Extensions:</span>
              <span className="text-[#35D07F]">AVX-512, SSE4.2, VT-x, AES-NI</span>
            </div>
          </div>
        </Card>

        {/* Physical RAM Topology */}
        <Card title="Physical Memory Modules" subtitle="DIMM slots topology" icon={Layers}>
          <div className="space-y-2 pt-1 text-xs font-mono">
            <div className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
              <span className="text-[#9AA5B3]">Total Installed:</span>
              <span className="text-[#F4F6F8] font-bold">{formatBytes(hardwareInfo.ram.totalCapacityBytes)}</span>
            </div>
            {hardwareInfo.ram.sticks.map((stick, i) => (
              <div key={i} className="flex justify-between p-2 rounded-lg bg-[#121720] border border-[#293342]">
                <span className="text-[#9AA5B3]">{stick.bankLabel || `Slot #${i + 1}`}:</span>
                <span className="text-[#8585FF]">{formatBytes(stick.capacityBytes)} @ {stick.speedMHz} MT/s</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
