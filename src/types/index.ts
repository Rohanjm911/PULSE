export interface SystemMetrics {
  timestamp: number;
  uptimeSeconds: number;
  cpu: {
    model: string;
    architecture: string;
    physicalCores: number;
    logicalCores: number;
    totalUsagePercent: number;
    currentFrequencyMHz: number;
    currentFrequencyMhz?: number;
    baseFrequencyMHz: number;
    baseFrequencyMhz?: number;
    cores: {
      id: number;
      usagePercent: number;
      frequencyMHz: number;
      frequencyMhz?: number;
    }[];
    temperatureC: number | null;
    powerWatts: number | null;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
    speedMHz: number | null;
    swapTotalBytes: number;
    swapUsedBytes: number;
    swapUsagePercent: number;
  };
  gpu: {
    name: string;
    vendor: string;
    utilizationPercent: number;
    vramTotalBytes: number;
    vramUsedBytes: number;
    vramUsagePercent: number;
    temperatureC: number | null;
    coreClockMHz?: number | null;
    coreClockMhz?: number | null;
    memoryClockMHz?: number | null;
    memoryClockMhz?: number | null;
    powerWatts: number | null;
    fanSpeedPercent: number | null;
    driverVersion: string;
    isSupported: boolean;
  }[];
  disks: {
    name: string;
    mountPoint: string;
    totalBytes: number;
    availableBytes: number;
    usedBytes: number;
    usagePercent: number;
    fileSystem: string;
    diskType: "SSD" | "HDD" | "Removable" | "Unknown";
    readBytesPerSec: number;
    writeBytesPerSec: number;
    temperatureC: number | null;
    healthStatus: "Healthy" | "Warning" | "Critical" | "Unavailable";
  }[];
  network: {
    activeAdapterName: string;
    downloadSpeedBps: number;
    uploadSpeedBps: number;
    totalDownloadedBytes: number;
    totalUploadedBytes: number;
    ipAddress: string;
    macAddress: string;
    latencyMs: number | null;
    packetLossPercent: number | null;
    adapters: {
      name: string;
      ip: string;
      mac: string;
      isUp: boolean;
      receivedBytes: number;
      transmittedBytes: number;
    }[];
  };
  healthScore: number; // 0 - 100
  overallStatus: "Optimal" | "Good" | "Warning" | "Critical";
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryBytes: number;
  diskReadBytes: number;
  diskWriteBytes: number;
  status: string;
  path: string;
  isSystem: boolean;
  user: string;
}

export interface StartupItem {
  id: string;
  name: string;
  command: string;
  publisher: string;
  location: string;
  enabled: boolean;
  source: "HKCU_Run" | "HKLM_Run" | "StartupFolder";
}

export interface HardwareInfo {
  motherboard: {
    manufacturer: string;
    product: string;
    serialNumber: string;
  };
  bios: {
    vendor: string;
    version: string;
    releaseDate: string;
  };
  cpu: {
    name: string;
    vendor: string;
    cores: number;
    threads: number;
    socket: string;
    features: string[];
  };
  ram: {
    totalCapacityBytes: number;
    sticks: {
      bankLabel: string;
      capacityBytes: number;
      speedMHz: number;
      partNumber: string;
    }[];
  };
  os: {
    name: string;
    version: string;
    buildNumber: string;
    architecture: string;
    installDate: string;
  };
}

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  testType: "cpu" | "memory" | "storage" | "all";
  cpuSingleScore?: number;
  cpuMultiScore?: number;
  memoryReadSpeedMBs?: number;
  memoryLatencyNs?: number;
  storageSeqReadMBs?: number;
  storageSeqWriteMBs?: number;
  durationMs: number;
  status: "idle" | "running" | "completed" | "failed";
  progressPercent: number;
}

export interface AlertRule {
  id: string;
  type: "cpu" | "memory" | "gpu" | "temp" | "disk" | "network";
  label: string;
  enabled: boolean;
  threshold: number;
  unit: string;
  severity: "info" | "warning" | "critical";
  cooldownSeconds: number;
  lastTriggered?: number;
}

export interface AlertLogItem {
  id: string;
  timestamp: number;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  acknowledged: boolean;
}

export interface SystemSnapshot {
  id: string;
  name: string;
  timestamp: number;
  cpuUsage: number;
  ramUsage: number;
  gpuUsage: number;
  diskUsage: number;
  healthScore: number;
  uptimeSeconds: number;
  processCount: number;
  topProcesses: { name: string; cpu: number; ramMB: number }[];
}

export interface AppSettings {
  theme: "dark" | "light" | "system";
  accentColor: string;
  pollIntervalMs: number;
  historyRetentionDays: number;
  startMinimized: boolean;
  minimizeToTray: boolean;
  floatingWidgetEnabled: boolean;
  floatingWidgetOpacity: number;
  floatingWidgetAlwaysOnTop: boolean;
  alerts: AlertRule[];
}

