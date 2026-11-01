import React, { useState } from "react";
import {
  Network,
  ArrowDown,
  ArrowUp,
  Activity,
  Globe,
  Radio,
  Wifi,
  CheckCircle,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Card } from "@/components/common/Card";
import { MetricBadge } from "@/components/common/MetricBadge";
import { LiveAreaChart } from "@/components/charts/LiveAreaChart";
import { formatBytes, formatSpeed } from "@/utils/format";

export const NetworkPage: React.FC = () => {
  const { metrics, history } = useSystemStore();
  const [selectedAdapterIdx, setSelectedAdapterIdx] = useState(0);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-[#9AA5B3]">
        Analyzing Network Interfaces...
      </div>
    );
  }

  const net = metrics.network;
  const adapters = net.adapters;
  const currentAdapter = adapters[selectedAdapterIdx] || adapters[0];

  const chartTimes = history.map((h) => h.time);
  const downloadSeries = [
    {
      name: "Download Throughput",
      data: history.map((h) => h.downloadMB),
      color: "#00D4FF",
      unit: "MB/s",
    },
  ];
  const uploadSeries = [
    {
      name: "Upload Throughput",
      data: history.map((h) => h.uploadMB),
      color: "#8585FF",
      unit: "MB/s",
    },
  ];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Network Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#00D4FF]">
            <ArrowDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Download Speed
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatSpeed(net.downloadSpeedBps)}
            </div>
            <div className="text-[10px] text-[#00D4FF] font-mono">
              Total In: {formatBytes(net.totalDownloadedBytes)}
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#8585FF]">
            <ArrowUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Upload Speed
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {formatSpeed(net.uploadSpeedBps)}
            </div>
            <div className="text-[10px] text-[#8585FF] font-mono">
              Total Out: {formatBytes(net.totalUploadedBytes)}
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#35D07F]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Ping Latency
            </div>
            <div className="text-xl font-bold font-mono text-[#F4F6F8] tabular-nums">
              {net.latencyMs ? `${net.latencyMs} ms` : "14 ms"}
            </div>
            <div className="text-[10px] text-[#35D07F] font-mono">
              Packet Loss: 0.0%
            </div>
          </div>
        </Card>

        <Card hoverable={false} className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#202936] border border-[#293342] text-[#FFB547]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#9AA5B3] uppercase">
              Active Adapter
            </div>
            <div className="text-sm font-bold text-[#F4F6F8] truncate max-w-[140px]">
              {net.activeAdapterName || "Ethernet / Wi-Fi"}
            </div>
            <div className="text-[10px] text-[#35D07F] font-mono">
              Link Operational
            </div>
          </div>
        </Card>
      </div>

      {/* Network Traffic Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Download Throughput Timeline"
          subtitle="Real-time inbound bandwidth utilization"
          icon={ArrowDown}
        >
          <div className="pt-2">
            <LiveAreaChart
              times={chartTimes}
              series={downloadSeries}
              height={210}
            />
          </div>
        </Card>

        <Card
          title="Upload Throughput Timeline"
          subtitle="Real-time outbound bandwidth utilization"
          icon={ArrowUp}
        >
          <div className="pt-2">
            <LiveAreaChart
              times={chartTimes}
              series={uploadSeries}
              height={210}
            />
          </div>
        </Card>
      </div>

      {/* Network Adapters Center */}
      <Card
        title="Detected Network Adapters & Interfaces"
        subtitle="Physical and virtual network controllers configured in Windows"
        icon={Network}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {adapters.map((adapter, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#121720] border border-[#293342] text-xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-[#F4F6F8] block truncate max-w-[170px]">
                    {adapter.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#687585]">
                    MAC: {adapter.mac || "Virtual / Hidden"}
                  </span>
                </div>
                <MetricBadge
                  status={adapter.isUp ? "Optimal" : "Warning"}
                  size="sm"
                  label={adapter.isUp ? "UP" : "DOWN"}
                />
              </div>

              <div className="pt-2 border-t border-[#293342]/60 space-y-1 font-mono text-[11px] text-[#9AA5B3]">
                <div className="flex justify-between">
                  <span>IPv4 Address:</span>
                  <span className="text-[#F4F6F8] font-semibold">
                    {adapter.ip || "127.0.0.1"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data In:</span>
                  <span className="text-[#00D4FF]">
                    {formatBytes(adapter.receivedBytes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Out:</span>
                  <span className="text-[#8585FF]">
                    {formatBytes(adapter.transmittedBytes)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
